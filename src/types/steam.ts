export interface FullSteamStatus {
  steamDetected: boolean;
  steamPath: string | null;
  steamExe: string | null;
  isProcessRunning: boolean;
  processPid: number | null;
  isCdpActive: boolean;
  cdpPort: number;
  activeThemeName: string | null;
  libraryFolders: string[];
}

export type SteamStatus = FullSteamStatus;

