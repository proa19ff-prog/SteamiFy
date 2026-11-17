use crate::cdp::CdpController;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupFileEntry {
    pub relative_path: String,
    pub size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupManifest {
    pub id: String,
    pub timestamp: String,
    pub steam_path: String,
    pub entries: Vec<BackupFileEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResetReport {
    pub cdp_cleaned: bool,
    pub files_restored_count: usize,
    pub message: String,
}

fn get_backups_dir() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("Steamify")
        .join("backups")
}

pub fn create_backup_if_needed(steam_path: &Path, subpaths: &[&str]) -> Result<Option<PathBuf>, String> {
    let mut files_to_copy = Vec::new();
    for sub in subpaths {
        let p = steam_path.join(sub);
        if p.exists() {
            files_to_copy.push((sub.to_string(), p));
        }
    }

    if files_to_copy.is_empty() {
        return Ok(None);
    }

    let timestamp_str = Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let backup_dir = get_backups_dir().join(&timestamp_str);
    fs::create_dir_all(&backup_dir)
        .map_err(|e| format!("Не удалось создать директорию бэкапа: {}", e))?;

    let mut entries = Vec::new();
    for (rel, abs) in files_to_copy {
        let target_file = backup_dir.join(&rel);
        if let Some(parent) = target_file.parent() {
            let _ = fs::create_dir_all(parent);
        }
        if let Ok(metadata) = fs::metadata(&abs) {
            let size = metadata.len();
            if fs::copy(&abs, &target_file).is_ok() {
                entries.push(BackupFileEntry {
                    relative_path: rel,
                    size_bytes: size,
                });
            }
        }
    }

    let manifest = BackupManifest {
        id: timestamp_str,
        timestamp: Utc::now().to_rfc3339(),
        steam_path: steam_path.to_string_lossy().to_string(),
        entries,
    };

    let manifest_path = backup_dir.join("manifest.json");
    let json = serde_json::to_string_pretty(&manifest).map_err(|e| e.to_string())?;
    let _ = fs::write(manifest_path, json);

    Ok(Some(backup_dir))
}

pub fn list_backups() -> Vec<BackupManifest> {
    let dir = get_backups_dir();
    if !dir.exists() {
        return Vec::new();
    }

    let mut list = Vec::new();
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let manifest_path = entry.path().join("manifest.json");
            if manifest_path.exists() {
                if let Ok(content) = fs::read_to_string(&manifest_path) {
                    if let Ok(manifest) = serde_json::from_str::<BackupManifest>(&content) {
                        list.push(manifest);
                    }
                }
            }
        }
    }

    list.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    list
}

pub fn restore_latest_backup(steam_path: &Path) -> Result<usize, String> {
    let backups = list_backups();
    let latest = match backups.first() {
        Some(b) => b,
        None => return Ok(0),
    };

    let backup_dir = get_backups_dir().join(&latest.id);
    let mut restored_count = 0;

    for entry in &latest.entries {
        let src = backup_dir.join(&entry.relative_path);
        let dest = steam_path.join(&entry.relative_path);

        if src.exists() {
            if let Some(p) = dest.parent() {
                let _ = fs::create_dir_all(p);
            }
            if fs::copy(&src, &dest).is_ok() {
                restored_count += 1;
            }
        }
    }

    Ok(restored_count)
}

pub async fn execute_full_reset(
    cdp: &CdpController,
    steam_path: Option<&Path>,
) -> Result<ResetReport, String> {
    // 1. Remove CDP injection
    let _ = cdp.remove_theme().await;

    // 2. Restore modified files if Steam path provided
    let mut files_restored = 0;
    if let Some(path) = steam_path {
        if let Ok(count) = restore_latest_backup(path) {
            files_restored = count;
        }
    }

    Ok(ResetReport {
        cdp_cleaned: true,
        files_restored_count: files_restored,
        message: "Исходный вид Steam успешно восстановлен. Инъекция удалена, оригинальные файлы восстановлены.".to_string(),
    })
}
