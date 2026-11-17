pub mod detector;
pub mod process;

pub use detector::{detect_steam, validate_and_inspect_path, SteamInstallInfo};
pub use process::{
    check_steam_process, create_desktop_shortcut, restart_steam_with_cef_debugging,
    SteamProcessStatus,
};
