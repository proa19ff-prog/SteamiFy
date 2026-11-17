import { invoke } from "@tauri-apps/api/core";
import { FullSteamStatus } from "../types/steam";
import { CommunityThemeItem, ResetReport, ThemeConfig } from "../types/theme";

export const tauriBridge = {
  getSteamStatus: async (): Promise<FullSteamStatus> => {
    return await invoke<FullSteamStatus>("get_steam_status");
  },

  setManualSteamPath: async (path: string): Promise<FullSteamStatus> => {
    return await invoke<FullSteamStatus>("set_manual_steam_path", { path });
  },

  setCdpPort: async (port: number): Promise<void> => {
    return await invoke<void>("set_cdp_port", { port });
  },

  restartSteamWithDebugging: async (): Promise<void> => {
    return await invoke<void>("restart_steam_with_debugging");
  },

  createSteamShortcut: async (): Promise<string> => {
    return await invoke<string>("create_steam_shortcut");
  },

  getCommunityThemes: async (): Promise<CommunityThemeItem[]> => {
    return await invoke<CommunityThemeItem[]>("get_community_themes");
  },

  applyThemeCdp: async (theme: ThemeConfig): Promise<number> => {
    return await invoke<number>("apply_theme_cdp", { theme });
  },

  removeThemeCdp: async (): Promise<void> => {
    return await invoke<void>("remove_theme_cdp");
  },

  exportThemeFolder: async (theme: ThemeConfig, customTargetDir?: string): Promise<string> => {
    return await invoke<string>("export_theme_folder", {
      theme,
      customTargetDir: customTargetDir || null,
    });
  },

  getPresets: async (): Promise<ThemeConfig[]> => {
    return await invoke<ThemeConfig[]>("get_presets");
  },

  getSavedThemes: async (): Promise<ThemeConfig[]> => {
    return await invoke<ThemeConfig[]>("get_saved_themes");
  },

  saveCustomTheme: async (theme: ThemeConfig): Promise<void> => {
    return await invoke<void>("save_custom_theme", { theme });
  },

  deleteCustomTheme: async (id: string): Promise<void> => {
    return await invoke<void>("delete_custom_theme", { id });
  },

  importSteamifyFile: async (filePath: string): Promise<ThemeConfig> => {
    return await invoke<ThemeConfig>("import_steamify_file", { filePath });
  },

  exportSteamifyFile: async (theme: ThemeConfig, filePath: string): Promise<string> => {
    return await invoke<string>("export_steamify_file", { theme, filePath });
  },

  pickSteamifyFile: async (): Promise<string | null> => {
    return await invoke<string | null>("pick_steamify_file");
  },

  saveSteamifyFileDialog: async (defaultName: string): Promise<string | null> => {
    return await invoke<string | null>("save_steamify_file_dialog", { defaultName });
  },

  pickDirectoryDialog: async (): Promise<string | null> => {
    return await invoke<string | null>("pick_directory_dialog");
  },

  resetToDefaultSteam: async (): Promise<ResetReport> => {
    return await invoke<ResetReport>("reset_to_default_steam");
  },
};
