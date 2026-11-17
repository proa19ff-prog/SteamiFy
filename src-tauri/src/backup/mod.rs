pub mod manager;

pub use manager::{
    create_backup_if_needed, execute_full_reset, list_backups, restore_latest_backup,
    BackupManifest, ResetReport,
};
