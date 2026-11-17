use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::net::TcpStream;
use tokio_tungstenite::tungstenite::client::IntoClientRequest;
use tokio_tungstenite::{connect_async, MaybeTlsStream, WebSocketStream};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CdpVersion {
    #[serde(rename = "Browser")]
    pub browser: Option<String>,
    #[serde(rename = "Protocol-Version")]
    pub protocol_version: Option<String>,
    #[serde(rename = "User-Agent")]
    pub user_agent: Option<String>,
    #[serde(rename = "V8-Version")]
    pub v8_version: Option<String>,
    #[serde(rename = "webSocketDebuggerUrl")]
    pub web_socket_debugger_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CdpTarget {
    pub id: String,
    pub title: String,
    #[serde(rename = "type")]
    pub target_type: String,
    pub url: String,
    #[serde(rename = "webSocketDebuggerUrl")]
    pub web_socket_debugger_url: Option<String>,
}

pub struct CdpClient {
    pub port: u16,
    http_client: reqwest::Client,
}

impl CdpClient {
    pub fn new(port: u16) -> Self {
        Self {
            port,
            http_client: reqwest::Client::builder()
                .timeout(Duration::from_millis(1500))
                .build()
                .unwrap_or_default(),
        }
    }

    pub async fn check_is_alive(&self) -> bool {
        let url = format!("http://127.0.0.1:{}/json/version", self.port);
        match self.http_client.get(&url).send().await {
            Ok(resp) => resp.status().is_success(),
            Err(_) => false,
        }
    }

    pub async fn get_version(&self) -> Result<CdpVersion, String> {
        let url = format!("http://127.0.0.1:{}/json/version", self.port);
        let resp = self
            .http_client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Не удалось связаться с CDP портом {}: {}", self.port, e))?;

        resp.json::<CdpVersion>()
            .await
            .map_err(|e| format!("Ошибка разбора ответа /json/version: {}", e))
    }

    pub async fn list_targets(&self) -> Result<Vec<CdpTarget>, String> {
        let url = format!("http://127.0.0.1:{}/json/list", self.port);
        let resp = self
            .http_client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Не удалось получить список целей CDP: {}", e))?;

        resp.json::<Vec<CdpTarget>>()
            .await
            .map_err(|e| format!("Ошибка разбора списка целей /json/list: {}", e))
    }

    pub async fn get_steam_cef_targets(&self) -> Result<Vec<CdpTarget>, String> {
        let targets = self.list_targets().await?;
        let filtered: Vec<CdpTarget> = targets
            .into_iter()
            .filter(|t| is_steam_cef_target(t) && t.web_socket_debugger_url.is_some())
            .collect();
        Ok(filtered)
    }

    pub async fn connect_ws(
        ws_url: &str,
    ) -> Result<WebSocketStream<MaybeTlsStream<TcpStream>>, String> {
        let mut request = ws_url
            .into_client_request()
            .map_err(|e| format!("Некорректный WS URL ({}): {}", ws_url, e))?;

        // КРИТИЧЕСКИ ВАЖНО: Steam CEF блокирует соединения при наличии стороннего Origin
        request.headers_mut().remove("Origin");

        let (stream, _) = connect_async(request)
            .await
            .map_err(|e| format!("Ошибка подключения к WebSocket {}: {}", ws_url, e))?;

        Ok(stream)
    }
}

pub fn is_steam_cef_target(target: &CdpTarget) -> bool {
    if target.target_type != "page" {
        return false;
    }
    let url = target.url.to_lowercase();
    let title = target.title.to_lowercase();

    url.contains("steamloopback.host")
        || url.contains("steam://")
        || url.contains("library")
        || title.contains("steam")
        || title.contains("library")
        || title.contains("sharedjscontext")
}
