pub mod backup;
pub mod cdp;
pub mod state;
pub mod steam;
pub mod theme;

use backup::{create_backup_if_needed, execute_full_reset, ResetReport};
use cdp::CdpClient;
use serde::{Deserialize, Serialize};
use state::AppState;
use std::path::PathBuf;
use tauri::State;
use theme::{
    delete_custom_theme as del_theme, export_theme_to_directory, export_to_steamify_file,
    get_community_catalog, get_default_presets, import_from_steamify_file, load_saved_themes,
    save_custom_theme as save_theme, CommunityThemeItem, ThemeConfig,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FullSteamStatus {
    pub steam_detected: bool,
    pub steam_path: Option<String>,
    pub steam_exe: Option<String>,
    pub is_process_running: bool,
    pub process_pid: Option<u32>,
    pub is_cdp_active: bool,
    pub cdp_port: u16,
    pub active_theme_name: Option<String>,
    pub library_folders: Vec<String>,
}

#[tauri::command]
async fn get_steam_status(state: State<'_, AppState>) -> Result<FullSteamStatus, String> {
    let mut install_guard = state.steam_install.write().await;
    if install_guard.is_none() {
        let detected = steam::detect_steam();
        *install_guard = Some(detected);
    }
    let install = install_guard.clone().unwrap();

    let proc_status = steam::check_steam_process();
    let port = state.cdp.get_port().await;
    let cdp_client = CdpClient::new(port);
    let cdp_active = cdp_client.check_is_alive().await;

    let active_theme = state.cdp.active_theme.read().await;
    let active_name = active_theme.as_ref().map(|t| t.metadata.name.clone());

    Ok(FullSteamStatus {
        steam_detected: install.steam_path.is_some(),
        steam_path: install.steam_path,
        steam_exe: install.steam_exe,
        is_process_running: proc_status.is_running,
        process_pid: proc_status.pid,
        is_cdp_active: cdp_active,
        cdp_port: port,
        active_theme_name: active_name,
        library_folders: install.library_folders,
    })
}

#[tauri::command]
async fn set_manual_steam_path(
    path: String,
    state: State<'_, AppState>,
) -> Result<FullSteamStatus, String> {
    let inspected = steam::validate_and_inspect_path(&path)?;
    {
        let mut guard = state.steam_install.write().await;
        *guard = Some(inspected.clone());
    }
    {
        let mut custom = state.custom_steam_path.write().await;
        *custom = Some(path);
    }
    get_steam_status(state).await
}

#[tauri::command]
async fn set_cdp_port(port: u16, state: State<'_, AppState>) -> Result<(), String> {
    state.cdp.set_port(port).await;
    Ok(())
}

#[tauri::command]
async fn restart_steam_with_debugging(state: State<'_, AppState>) -> Result<(), String> {
    let install_guard = state.steam_install.read().await;
    let exe_path_str = install_guard
        .as_ref()
        .and_then(|i| i.steam_exe.clone())
        .ok_or_else(|| "Исполняемый файл Steam не найден. Укажите путь к Steam вручную.".to_string())?;

    let port = state.cdp.get_port().await;
    let exe_path = PathBuf::from(exe_path_str);
    steam::restart_steam_with_cef_debugging(&exe_path, port).await
}

#[tauri::command]
async fn create_steam_shortcut(state: State<'_, AppState>) -> Result<String, String> {
    let install_guard = state.steam_install.read().await;
    let exe_path_str = install_guard
        .as_ref()
        .and_then(|i| i.steam_exe.clone())
        .ok_or_else(|| "Исполняемый файл Steam не найден. Укажите путь к Steam вручную.".to_string())?;

    let exe_path = PathBuf::from(exe_path_str);
    steam::create_desktop_shortcut(&exe_path)
}

#[tauri::command]
fn get_community_themes() -> Vec<CommunityThemeItem> {
    get_community_catalog()
}

#[tauri::command]
async fn apply_theme_cdp(theme: ThemeConfig, state: State<'_, AppState>) -> Result<usize, String> {
    theme.validate()?;
    state.cdp.apply_theme(theme).await
}

#[tauri::command]
async fn remove_theme_cdp(state: State<'_, AppState>) -> Result<(), String> {
    state.cdp.remove_theme().await
}

#[tauri::command]
async fn export_theme_folder(
    theme: ThemeConfig,
    custom_target_dir: Option<String>,
    state: State<'_, AppState>,
) -> Result<String, String> {
    theme.validate()?;

    let target_dir = if let Some(dir_str) = custom_target_dir {
        PathBuf::from(dir_str)
    } else {
        let install_guard = state.steam_install.read().await;
        let steam_path_str = install_guard
            .as_ref()
            .and_then(|i| i.steam_path.clone())
            .ok_or_else(|| "Путь к Steam не определён. Выберите папку для экспорта вручную.".to_string())?;

        let steam_dir = PathBuf::from(steam_path_str);
        // Standard Millennium/SFP skin folder
        steam_dir.join("steamui").join("skins")
    };

    // Auto-backup before modifying files
    if let Some(parent) = target_dir.parent() {
        let _ = create_backup_if_needed(parent, &["steamui/skins"]);
    }

    let exported_path = export_theme_to_directory(&theme, &target_dir)?;
    Ok(exported_path.to_string_lossy().to_string())
}

#[tauri::command]
fn get_presets() -> Vec<ThemeConfig> {
    get_default_presets()
}

#[tauri::command]
fn get_saved_themes() -> Vec<ThemeConfig> {
    load_saved_themes()
}

#[tauri::command]
fn save_custom_theme(theme: ThemeConfig) -> Result<(), String> {
    save_theme(theme)
}

#[tauri::command]
fn delete_custom_theme(id: String) -> Result<(), String> {
    del_theme(&id)
}

#[tauri::command]
fn import_steamify_file(file_path: String) -> Result<ThemeConfig, String> {
    let path = PathBuf::from(file_path);
    import_from_steamify_file(&path)
}

#[tauri::command]
fn export_steamify_file(theme: ThemeConfig, file_path: String) -> Result<String, String> {
    let path = PathBuf::from(&file_path);
    export_to_steamify_file(&theme, &path)?;
    Ok(file_path)
}

#[tauri::command]
async fn pick_steamify_file() -> Result<Option<String>, String> {
    let file = rfd::AsyncFileDialog::new()
        .add_filter("Steamify Theme", &["steamify", "json"])
        .set_title("Выберите файл темы .steamify")
        .pick_file()
        .await;

    Ok(file.map(|f| f.path().to_string_lossy().to_string()))
}

#[tauri::command]
async fn save_steamify_file_dialog(default_name: String) -> Result<Option<String>, String> {
    let filename = format!("{}.steamify", default_name);
    let file = rfd::AsyncFileDialog::new()
        .add_filter("Steamify Theme", &["steamify"])
        .set_file_name(&filename)
        .set_title("Сохранить тему Steamify")
        .save_file()
        .await;

    Ok(file.map(|f| f.path().to_string_lossy().to_string()))
}

#[tauri::command]
async fn pick_directory_dialog() -> Result<Option<String>, String> {
    let dir = rfd::AsyncFileDialog::new()
        .set_title("Выберите папку Steam")
        .pick_folder()
        .await;

    Ok(dir.map(|d| d.path().to_string_lossy().to_string()))
}

#[tauri::command]
async fn reset_to_default_steam(state: State<'_, AppState>) -> Result<ResetReport, String> {
    let install_guard = state.steam_install.read().await;
    let steam_path = install_guard
        .as_ref()
        .and_then(|i| i.steam_path.as_ref())
        .map(PathBuf::from);

    execute_full_reset(&state.cdp, steam_path.as_deref()).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = AppState::new(8080);

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_steam_status,
            set_manual_steam_path,
            set_cdp_port,
            restart_steam_with_debugging,
            create_steam_shortcut,
            get_community_themes,
            apply_theme_cdp,
            remove_theme_cdp,
            export_theme_folder,
            get_presets,
            get_saved_themes,
            save_custom_theme,
            delete_custom_theme,
            import_steamify_file,
            export_steamify_file,
            pick_steamify_file,
            save_steamify_file_dialog,
            pick_directory_dialog,
            reset_to_default_steam,
        ])
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
