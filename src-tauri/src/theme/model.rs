use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThemeMetadata {
    pub id: String,
    pub name: String,
    pub author: String,
    pub version: String,
    pub created_at: String,
    #[serde(default)]
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThemeColors {
    pub accent: String,
    pub accent_hover: String,
    pub primary_background: String,
    pub secondary_background: String,
    pub card_background: String,
    pub card_hover_background: String,
    pub text_primary: String,
    pub text_secondary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThemeGeometry {
    pub card_radius_px: u32,
    pub button_radius_px: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThemeTypography {
    pub font_family: String,
    #[serde(default)]
    pub google_font_family: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThemeBackground {
    pub enabled: bool,
    #[serde(default)]
    pub image_url: String,
    pub blur_px: u32,
    pub opacity: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThemeToggles {
    pub hide_whats_new: bool,
    pub hide_bottom_download_bar: bool,
    pub compact_sidebar: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThemeConfig {
    pub version: u32,
    pub metadata: ThemeMetadata,
    pub colors: ThemeColors,
    pub geometry: ThemeGeometry,
    pub typography: ThemeTypography,
    pub background: ThemeBackground,
    pub toggles: ThemeToggles,
}

impl ThemeConfig {
    pub fn validate(&self) -> Result<(), String> {
        if self.version != 1 {
            return Err(format!(
                "Неподдерживаемая версия схемы темы: {}. Ожидается версия 1.",
                self.version
            ));
        }

        if self.metadata.name.trim().is_empty() {
            return Err("Название темы не может быть пустым.".to_string());
        }

        // Validate hex colors
        let colors = [
            ("акцентный цвет", &self.colors.accent),
            ("акцентный цвет при наведении", &self.colors.accent_hover),
            ("основной фон", &self.colors.primary_background),
            ("вторичный фон", &self.colors.secondary_background),
            ("фон карточек", &self.colors.card_background),
            ("фон карточек при наведении", &self.colors.card_hover_background),
            ("основной текст", &self.colors.text_primary),
            ("вторичный текст", &self.colors.text_secondary),
        ];

        for (name, color) in colors {
            if !is_valid_hex_color(color) {
                return Err(format!("Некорректный HEX-формат для поля «{}»: «{}». Ожидается формат #RRGGBB или #RGB.", name, color));
            }
        }

        if self.geometry.card_radius_px > 48 {
            return Err("Радиус скругления карточек не может превышать 48px.".to_string());
        }
        if self.geometry.button_radius_px > 48 {
            return Err("Радиус скругления кнопок не может превышать 48px.".to_string());
        }

        if self.background.blur_px > 50 {
            return Err("Размытие фона не может превышать 50px.".to_string());
        }
        if self.background.opacity < 0.0 || self.background.opacity > 1.0 {
            return Err("Прозрачность фона должна быть в пределах от 0.0 до 1.0.".to_string());
        }

        Ok(())
    }
}

fn is_valid_hex_color(hex: &str) -> bool {
    if !hex.starts_with('#') {
        return false;
    }
    let s = &hex[1..];
    (s.len() == 3 || s.len() == 6 || s.len() == 8) && s.chars().all(|c| c.is_ascii_hexdigit())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_hex_colors() {
        assert!(is_valid_hex_color("#1DB954"));
        assert!(is_valid_hex_color("#FFF"));
        assert!(is_valid_hex_color("#12121280"));
        assert!(!is_valid_hex_color("1DB954"));
        assert!(!is_valid_hex_color("#12"));
        assert!(!is_valid_hex_color("#ZZZ"));
    }

    #[test]
    fn test_theme_validation_version() {
        let mut theme = crate::theme::presets::get_default_presets()[0].clone();
        assert!(theme.validate().is_ok());

        theme.version = 2;
        assert!(theme.validate().is_err());
    }

    #[test]
    fn test_theme_validation_colors() {
        let mut theme = crate::theme::presets::get_default_presets()[0].clone();
        theme.colors.accent = "invalid_color".to_string();
        assert!(theme.validate().is_err());
    }
}
