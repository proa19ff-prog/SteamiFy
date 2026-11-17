import { ThemeConfig } from "../types/theme";

export function generatePreviewCssVariables(theme: ThemeConfig): React.CSSProperties {
  return {
    "--steamify-accent": theme.colors.accent,
    "--steamify-accent-hover": theme.colors.accentHover,
    "--steamify-bg-primary": theme.colors.primaryBackground,
    "--steamify-bg-secondary": theme.colors.secondaryBackground,
    "--steamify-bg-card": theme.colors.cardBackground,
    "--steamify-bg-card-hover": theme.colors.cardHoverBackground,
    "--steamify-text-primary": theme.colors.textPrimary,
    "--steamify-text-secondary": theme.colors.textSecondary,
    "--steamify-card-radius": `${theme.geometry.cardRadiusPx}px`,
    "--steamify-btn-radius": `${theme.geometry.buttonRadiusPx}px`,
    "--steamify-font": theme.typography.fontFamily,
  } as React.CSSProperties;
}
