use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SteamInstallInfo {
    pub steam_path: Option<String>,
    pub steam_exe: Option<String>,
    pub library_folders: Vec<String>,
    pub is_custom_path: bool,
}

pub fn detect_steam() -> SteamInstallInfo {
    let detected_path = detect_from_registry().or_else(detect_from_standard_paths);

    let (path_str, exe_str, libraries) = if let Some(path) = detected_path {
        let exe = find_steam_exe(&path);
        let libs = parse_library_folders(&path);
        (
            Some(path.to_string_lossy().to_string()),
            exe.map(|e| e.to_string_lossy().to_string()),
            libs,
        )
    } else {
        (None, None, Vec::new())
    };

    SteamInstallInfo {
        steam_path: path_str,
        steam_exe: exe_str,
        library_folders: libraries,
        is_custom_path: false,
    }
}

pub fn validate_and_inspect_path(path_str: &str) -> Result<SteamInstallInfo, String> {
    let path = PathBuf::from(path_str);
    if !path.exists() {
        return Err("Указанный путь не существует.".to_string());
    }

    let exe = find_steam_exe(&path)
        .ok_or_else(|| "В указанной папке не найден исполняемый файл steam.exe.".to_string())?;

    let libs = parse_library_folders(&path);

    Ok(SteamInstallInfo {
        steam_path: Some(path.to_string_lossy().to_string()),
        steam_exe: Some(exe.to_string_lossy().to_string()),
        library_folders: libs,
        is_custom_path: true,
    })
}

#[cfg(target_os = "windows")]
fn detect_from_registry() -> Option<PathBuf> {
    use winreg::enums::*;
    use winreg::RegKey;

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    if let Ok(key) = hkcu.open_subkey("Software\\Valve\\Steam") {
        if let Ok(val) = key.get_value::<String, _>("SteamPath") {
            let p = PathBuf::from(val.replace('/', "\\"));
            if p.exists() {
                return Some(p);
            }
        }
        if let Ok(val) = key.get_value::<String, _>("InstallPath") {
            let p = PathBuf::from(val.replace('/', "\\"));
            if p.exists() {
                return Some(p);
            }
        }
    }
    None
}

#[cfg(not(target_os = "windows"))]
fn detect_from_registry() -> Option<PathBuf> {
    None
}

fn detect_from_standard_paths() -> Option<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        let candidates = [
            r"C:\Program Files (x86)\Steam",
            r"C:\Program Files\Steam",
            r"D:\Steam",
            r"E:\Steam",
            r"D:\Games\Steam",
            r"E:\Games\Steam",
        ];

        for &c in &candidates {
            let p = PathBuf::from(c);
            if p.exists() && find_steam_exe(&p).is_some() {
                return Some(p);
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        if let Some(home) = dirs::home_dir() {
            let candidates = [
                home.join(".steam").join("steam"),
                home.join(".local").join("share").join("Steam"),
            ];
            for p in &candidates {
                if p.exists() {
                    return Some(p.clone());
                }
            }
        }
    }

    None
}

fn find_steam_exe(base: &Path) -> Option<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        let exe = base.join("steam.exe");
        if exe.exists() {
            return Some(exe);
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let exe = base.join("steam.sh");
        if exe.exists() {
            return Some(exe);
        }
        let exe_bin = base.join("steam");
        if exe_bin.exists() {
            return Some(exe_bin);
        }
    }

    None
}

fn parse_library_folders(steam_path: &Path) -> Vec<String> {
    let vdf_path = steam_path.join("steamapps").join("libraryfolders.vdf");
    if !vdf_path.exists() {
        return Vec::new();
    }

    let mut folders = Vec::new();
    if let Ok(content) = fs::read_to_string(&vdf_path) {
        for line in content.lines() {
            let trimmed = line.trim();
            // Look for "path" "..."
            if trimmed.starts_with("\"path\"") {
                let parts: Vec<&str> = trimmed.split('"').collect();
                if parts.len() >= 4 {
                    let folder = parts[3].replace("\\\\", "\\");
                    if !folder.is_empty() && Path::new(&folder).exists() {
                        folders.push(folder);
                    }
                }
            }
        }
    }

    folders
}
