use crate::cdp::CdpController;
use crate::steam::detector::SteamInstallInfo;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct AppState {
    pub cdp: Arc<CdpController>,
    pub steam_install: Arc<RwLock<Option<SteamInstallInfo>>>,
    pub custom_steam_path: Arc<RwLock<Option<String>>>,
}

impl AppState {
    pub fn new(default_port: u16) -> Self {
        Self {
            cdp: Arc::new(CdpController::new(default_port)),
            steam_install: Arc::new(RwLock::new(None)),
            custom_steam_path: Arc::new(RwLock::new(None)),
        }
    }
}
