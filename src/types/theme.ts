export interface ThemeMetadata {
  id: string;
  name: string;
  author: string;
  version: string;
  createdAt: string;
  description?: string;
}

export interface ThemeColors {
  accent: string;
  accentHover: string;
  primaryBackground: string;
  secondaryBackground: string;
  cardBackground: string;
  cardHoverBackground: string;
  textPrimary: string;
  textSecondary: string;
}

export interface ThemeGeometry {
  cardRadiusPx: number;
  buttonRadiusPx: number;
}

export interface ThemeTypography {
  fontFamily: string;
  googleFontFamily?: string;
}

export interface ThemeBackground {
  enabled: boolean;
  imageUrl: string;
  blurPx: number;
  opacity: number;
}

export interface ThemeToggles {
  hideWhatsNew: boolean;
  hideBottomDownloadBar: boolean;
  compactSidebar: boolean;
}

export interface ThemeConfig {
  version: number;
  metadata: ThemeMetadata;
  colors: ThemeColors;
  geometry: ThemeGeometry;
  typography: ThemeTypography;
  background: ThemeBackground;
  toggles: ThemeToggles;
}

export interface CommunityThemeItem {
  id: string;
  name: string;
  author: string;
  description: string;
  category: string;
  tags: string[];
  downloads: string;
  stars: number;
  previewGradient: string[];
  theme: ThemeConfig;
}

export interface ResetReport {
  cdpCleaned: boolean;
  filesRestoredCount: number;
  message: string;
}
