use super::client::CdpClient;
use super::injector::{
    build_inject_payload, build_remove_payload, create_enable_events_messages,
    create_runtime_evaluate_message,
};
use crate::theme::{generate_css, ThemeConfig};
use futures_util::{SinkExt, StreamExt};
use std::collections::HashSet;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::{mpsc, RwLock};
use tokio_tungstenite::tungstenite::protocol::Message;

static MSG_COUNTER: AtomicU64 = AtomicU64::new(100);

pub struct CdpController {
    port: Arc<RwLock<u16>>,
    pub active_theme: Arc<RwLock<Option<ThemeConfig>>>,
    shutdown_tx: Arc<RwLock<Option<mpsc::Sender<()>>>>,
}

impl CdpController {
    pub fn new(port: u16) -> Self {
        Self {
            port: Arc::new(RwLock::new(port)),
            active_theme: Arc::new(RwLock::new(None)),
            shutdown_tx: Arc::new(RwLock::new(None)),
        }
    }

    pub async fn set_port(&self, port: u16) {
        let mut p = self.port.write().await;
        *p = port;
    }

    pub async fn get_port(&self) -> u16 {
        *self.port.read().await
    }

    pub async fn apply_theme(&self, theme: ThemeConfig) -> Result<usize, String> {
        let port = self.get_port().await;
        let client = CdpClient::new(port);

        if !client.check_is_alive().await {
            return Err(format!(
                "Порт отладки Steam ({}) недоступен. Запущен ли Steam с флагом -cef-enable-debugging?",
                port
            ));
        }

        let targets = client.get_steam_cef_targets().await?;
        if targets.is_empty() {
            return Err("Не найдено подходящих CEF-страниц библиотеки Steam для инъекции.".to_string());
        }

        let css = generate_css(&theme);
        let payload = build_inject_payload(&css);

        let mut injected_count = 0;
        for target in &targets {
            if let Some(ref ws_url) = target.web_socket_debugger_url {
                if let Ok(mut ws) = CdpClient::connect_ws(ws_url).await {
                    let msg_id = MSG_COUNTER.fetch_add(1, Ordering::SeqCst);
                    let eval_msg = create_runtime_evaluate_message(msg_id, &payload);
                    if ws.send(Message::Text(eval_msg.into())).await.is_ok() {
                        injected_count += 1;
                    }
                    let _ = ws.close(None).await;
                }
            }
        }

        // Сохраняем активную тему
        {
            let mut active = self.active_theme.write().await;
            *active = Some(theme);
        }

        // Запускаем фоновый Watcher для автоматической повторной инъекции при навигации
        self.ensure_watcher_running().await;

        Ok(injected_count)
    }

    pub async fn remove_theme(&self) -> Result<(), String> {
        // Сбрасываем активную тему
        {
            let mut active = self.active_theme.write().await;
            *active = None;
        }

        // Останавливаем watcher
        self.stop_watcher().await;

        let port = self.get_port().await;
        let client = CdpClient::new(port);

        if client.check_is_alive().await {
            if let Ok(targets) = client.get_steam_cef_targets().await {
                let remove_payload = build_remove_payload();
                for target in targets {
                    if let Some(ref ws_url) = target.web_socket_debugger_url {
                        if let Ok(mut ws) = CdpClient::connect_ws(ws_url).await {
                            let msg_id = MSG_COUNTER.fetch_add(1, Ordering::SeqCst);
                            let eval_msg = create_runtime_evaluate_message(msg_id, &remove_payload);
                            let _ = ws.send(Message::Text(eval_msg.into())).await;
                            let _ = ws.close(None).await;
                        }
                    }
                }
            }
        }

        Ok(())
    }

    async fn stop_watcher(&self) {
        let mut tx_opt = self.shutdown_tx.write().await;
        if let Some(tx) = tx_opt.take() {
            let _ = tx.send(()).await;
        }
    }

    async fn ensure_watcher_running(&self) {
        self.stop_watcher().await;

        let (tx, mut rx) = mpsc::channel::<()>(1);
        {
            let mut tx_opt = self.shutdown_tx.write().await;
            *tx_opt = Some(tx);
        }

        let port_arc = self.port.clone();
        let active_theme_arc = self.active_theme.clone();

        tokio::spawn(async move {
            let mut known_targets = HashSet::new();

            loop {
                tokio::select! {
                    _ = rx.recv() => {
                        log::info!("Watcher CDP остановлен.");
                        break;
                    }
                    _ = tokio::time::sleep(Duration::from_millis(2500)) => {
                        let active = active_theme_arc.read().await.clone();
                        let theme = match active {
                            Some(t) => t,
                            None => break,
                        };

                        let port = *port_arc.read().await;
                        let client = CdpClient::new(port);
                        if !client.check_is_alive().await {
                            continue;
                        }

                        if let Ok(targets) = client.get_steam_cef_targets().await {
                            let css = generate_css(&theme);
                            let payload = build_inject_payload(&css);

                            for target in &targets {
                                if let Some(ref ws_url) = target.web_socket_debugger_url {
                                    // Если появилась новая цель или страница обновилась
                                    if known_targets.insert(target.id.clone()) {
                                        if let Ok(mut ws) = CdpClient::connect_ws(ws_url).await {
                                            let msg_id = MSG_COUNTER.fetch_add(1, Ordering::SeqCst);
                                            let eval_msg = create_runtime_evaluate_message(msg_id, &payload);
                                            let (page_en, runtime_en) = create_enable_events_messages(msg_id + 10);
                                            let _ = ws.send(Message::Text(page_en.into())).await;
                                            let _ = ws.send(Message::Text(runtime_en.into())).await;
                                            let _ = ws.send(Message::Text(eval_msg.into())).await;

                                            // Спавним слушатель для этой цели на события навигации
                                            let target_id = target.id.clone();
                                            let payload_clone = payload.clone();
                                            tokio::spawn(async move {
                                                while let Some(msg) = ws.next().await {
                                                    if let Ok(Message::Text(text)) = msg {
                                                        if text.contains("Page.frameNavigated") || text.contains("Runtime.executionContextCreated") {
                                                            let reinject_id = MSG_COUNTER.fetch_add(1, Ordering::SeqCst);
                                                            let reinject_msg = create_runtime_evaluate_message(reinject_id, &payload_clone);
                                                            let _ = ws.send(Message::Text(reinject_msg.into())).await;
                                                        }
                                                    } else {
                                                        break;
                                                    }
                                                }
                                                log::debug!("Сессия страницы {} завершена", target_id);
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
}
