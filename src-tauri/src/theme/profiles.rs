use super::model::ThemeConfig;
use std::fs;
use std::path::{Path, PathBuf};

fn get_app_data_dir() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("Steamify")
}

fn get_profiles_file_path() -> PathBuf {
    get_app_data_dir().join("profiles.json")
}

pub fn load_saved_themes() -> Vec<ThemeConfig> {
    let path = get_profiles_file_path();
    if !path.exists() {
        return Vec::new();
    }

    match fs::read_to_string(&path) {
        Ok(content) => match serde_json::from_str::<Vec<ThemeConfig>>(&content) {
            Ok(themes) => themes,
            Err(e) => {
                log::warn!("Ошибка парсинга profiles.json: {}", e);
                Vec::new()
            }
        },
        Err(e) => {
            log::warn!("Не удалось прочитать profiles.json: {}", e);
            Vec::new()
        }
    }
}

pub fn save_custom_theme(theme: ThemeConfig) -> Result<(), String> {
    theme.validate()?;

    let mut themes = load_saved_themes();

    // If a theme with this ID exists, update it; otherwise append
    if let Some(pos) = themes.iter().position(|t| t.metadata.id == theme.metadata.id) {
        themes[pos] = theme;
    } else {
        themes.push(theme);
    }

    let dir = get_app_data_dir();
    fs::create_dir_all(&dir).map_err(|e| format!("Не удалось создать папку данных: {}", e))?;

    let json = serde_json::to_string_pretty(&themes).map_err(|e| e.to_string())?;
    fs::write(get_profiles_file_path(), json)
        .map_err(|e| format!("Не удалось сохранить profiles.json: {}", e))?;

    Ok(())
}

pub fn delete_custom_theme(id: &str) -> Result<(), String> {
    let mut themes = load_saved_themes();
    let initial_len = themes.len();
    themes.retain(|t| t.metadata.id != id);

    if themes.len() == initial_len {
        return Err("Тема с указанным идентификатором не найдена.".to_string());
    }

    let json = serde_json::to_string_pretty(&themes).map_err(|e| e.to_string())?;
    fs::write(get_profiles_file_path(), json)
        .map_err(|e| format!("Не удалось обновить profiles.json: {}", e))?;

    Ok(())
}

pub fn export_to_steamify_file(theme: &ThemeConfig, file_path: &Path) -> Result<(), String> {
    theme.validate()?;
    let json = serde_json::to_string_pretty(theme).map_err(|e| e.to_string())?;
    fs::write(file_path, json).map_err(|e| format!("Не удалось сохранить файл .steamify: {}", e))?;
    Ok(())
}

pub fn import_from_steamify_file(file_path: &Path) -> Result<ThemeConfig, String> {
    if !file_path.exists() {
        return Err("Выбранный файл не существует.".to_string());
    }

    let content = fs::read_to_string(file_path)
        .map_err(|e| format!("Ошибка чтения файла: {}", e))?;

    let theme: ThemeConfig = serde_json::from_str(&content).map_err(|e| {
        format!(
            "Некорректная структура файла .steamify или повреждённый JSON: {}",
            e
        )
    })?;

    theme.validate()?;
    Ok(theme)
}
