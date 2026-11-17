use std::path::Path;
use std::process::Command;
use std::time::Duration;
use sysinfo::{ProcessesToUpdate, System};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SteamProcessStatus {
    pub is_running: bool,
    pub pid: Option<u32>,
    pub cmd_args: Vec<String>,
}

pub fn check_steam_process() -> SteamProcessStatus {
    let mut sys = System::new_all();
    sys.refresh_processes(ProcessesToUpdate::All, true);

    for (pid, process) in sys.processes() {
        let name = process.name().to_string_lossy();
        if name.eq_ignore_ascii_case("steam.exe") || name.eq_ignore_ascii_case("steam") {
            let args: Vec<String> = process
                .cmd()
                .iter()
                .map(|a| a.to_string_lossy().to_string())
                .collect();

            return SteamProcessStatus {
                is_running: true,
                pid: Some(pid.as_u32()),
                cmd_args: args,
            };
        }
    }

    SteamProcessStatus {
        is_running: false,
        pid: None,
        cmd_args: Vec::new(),
    }
}

pub fn are_any_steam_processes_running() -> bool {
    let mut sys = System::new_all();
    sys.refresh_processes(ProcessesToUpdate::All, true);

    for (_, process) in sys.processes() {
        let name = process.name().to_string_lossy().to_lowercase();
        if name == "steam.exe" || name == "steam" || name.contains("steamwebhelper") {
            return true;
        }
    }
    false
}

pub async fn restart_steam_with_cef_debugging(
    steam_exe_path: &Path,
    port: u16,
) -> Result<(), String> {
    if !steam_exe_path.exists() {
        return Err(format!(
            "Исполняемый файл Steam не найден по пути: {}",
            steam_exe_path.display()
        ));
    }

    log::info!("Перезапуск Steam с портом отладки CEF {}...", port);

    // 1. Если процесс запущен, выполняем мягкое закрытие
    if are_any_steam_processes_running() {
        log::info!("Отправка команды мягкого закрытия Steam (-shutdown)...");
        #[cfg(target_os = "windows")]
        {
            let _ = Command::new(steam_exe_path).arg("-shutdown").status();
        }

        // Ждём мягкого завершения до 3 секунд
        for _ in 0..6 {
            tokio::time::sleep(Duration::from_millis(500)).await;
            if !are_any_steam_processes_running() {
                break;
            }
        }

        // 2. Если всё ещё висят steam.exe или steamwebhelper.exe — принудительно завершаем дерево процессов
        if are_any_steam_processes_running() {
            log::warn!("Принудительное завершение всех процессов steam.exe и steamwebhelper.exe...");
            #[cfg(target_os = "windows")]
            {
                let _ = Command::new("taskkill")
                    .args(["/F", "/T", "/IM", "steam.exe"])
                    .status();
                let _ = Command::new("taskkill")
                    .args(["/F", "/T", "/IM", "steamwebhelper.exe"])
                    .status();
            }
            #[cfg(not(target_os = "windows"))]
            {
                let _ = Command::new("pkill").arg("-9").arg("steam").status();
                let _ = Command::new("pkill").arg("-9").arg("steamwebhelper").status();
            }

            // Ждём полной выгрузки из памяти
            for _ in 0..6 {
                tokio::time::sleep(Duration::from_millis(400)).await;
                if !are_any_steam_processes_running() {
                    break;
                }
            }
        }
    }

    // Даём Windows 800 мс на освобождение сетевых сокетов и дескрипторов
    tokio::time::sleep(Duration::from_millis(800)).await;

    // 3. Запуск Steam с флагом отладки CEF
    log::info!("Запуск Steam с аргументом -cef-enable-debugging...");
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const DETACHED_PROCESS: u32 = 0x00000008;

        let mut cmd = Command::new(steam_exe_path);
        cmd.arg("-cef-enable-debugging");
        cmd.creation_flags(DETACHED_PROCESS);

        cmd.spawn()
            .map_err(|e| format!("Не удалось запустить steam.exe: {}", e))?;
    }

    #[cfg(not(target_os = "windows"))]
    {
        Command::new(steam_exe_path)
            .arg("-cef-enable-debugging")
            .spawn()
            .map_err(|e| format!("Не удалось запустить Steam: {}", e))?;
    }

    // 4. Активно опрашиваем порт отладки (до 15 секунд), пока CEF не ответит 200 OK
    let client = reqwest::Client::builder()
        .timeout(Duration::from_millis(800))
        .build()
        .unwrap_or_default();

    let check_url = format!("http://127.0.0.1:{}/json/version", port);
    for _ in 0..25 {
        tokio::time::sleep(Duration::from_millis(600)).await;
        if let Ok(resp) = client.get(&check_url).send().await {
            if resp.status().is_success() {
                log::info!("CDP порт {} успешно активен и отвечает!", port);
                return Ok(());
            }
        }
    }

    // Если порт не ответил за 15 секунд, но процесс Steam запущен
    if check_steam_process().is_running {
        Ok(())
    } else {
        Err("Steam был запущен, но процесс не обнаружен в системе.".to_string())
    }
}

pub fn create_desktop_shortcut(steam_exe: &Path) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let desktop = dirs::desktop_dir()
            .ok_or_else(|| "Не удалось определить папку Рабочего стола.".to_string())?;

        let shortcut_path = desktop.join("Steam (Кастомизация).lnk");
        let steam_exe_str = steam_exe.to_string_lossy();
        let shortcut_path_str = shortcut_path.to_string_lossy();

        let ps_script = format!(
            r#"$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('{shortcut}'); $Shortcut.TargetPath = '{target}'; $Shortcut.Arguments = '-cef-enable-debugging'; $Shortcut.IconLocation = '{target}, 0'; $Shortcut.Description = 'Запуск Steam с поддержкой тем Steamify'; $Shortcut.Save()"#,
            shortcut = shortcut_path_str.replace('\'', "''"),
            target = steam_exe_str.replace('\'', "''"),
        );

        let status = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", &ps_script])
            .status()
            .map_err(|e| format!("Ошибка создания ярлыка через PowerShell: {}", e))?;

        if status.success() {
            Ok(shortcut_path_str.to_string())
        } else {
            Err("Не удалось создать ярлык на рабочем столе.".to_string())
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err("Создание ярлыка поддерживается на Windows.".to_string())
    }
}
