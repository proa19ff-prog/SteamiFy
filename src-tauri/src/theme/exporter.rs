use super::css_builder::generate_css;
use super::model::ThemeConfig;
use std::fs;
use std::path::{Path, PathBuf};

pub fn export_theme_to_directory(theme: &ThemeConfig, output_parent_dir: &Path) -> Result<PathBuf, String> {
    // Sanitize folder name
    let clean_name: String = theme
        .metadata
        .name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();

    let target_folder = output_parent_dir.join(&clean_name);
    fs::create_dir_all(&target_folder)
        .map_err(|e| format!("Не удалось создать папку экспорта темы {}: {}", target_folder.display(), e))?;

    // 1. skin.json
    let skin_json = serde_json::json!({
        "name": theme.metadata.name,
        "version": theme.metadata.version,
        "author": theme.metadata.author,
        "description": theme.metadata.description.as_deref().unwrap_or("Сгенерировано в Steamify Studio"),
        "splash": "libraryroot.custom.css",
        "Components": {
            "Library": {
                "Css": "libraryroot.custom.css"
            },
            "Webkit": {
                "Css": "webkit.css"
            }
        }
    });
    let skin_json_path = target_folder.join("skin.json");
    fs::write(
        &skin_json_path,
        serde_json::to_string_pretty(&skin_json).map_err(|e| e.to_string())?,
    )
    .map_err(|e| format!("Не удалось записать skin.json: {}", e))?;

    // 2. webkit.css (root variables and font import)
    let font_import = if let Some(ref google_font) = theme.typography.google_font_family {
        let clean = google_font.replace(' ', "+");
        format!("@import url('https://fonts.googleapis.com/css2?family={}:wght@400;500;600;700&display=swap');\n\n", clean)
    } else {
        String::new()
    };

    let webkit_css = format!(
        r#"{font_import}/* Steamify Global Variables */
:root {{
    --steamify-accent: {accent};
    --steamify-accent-hover: {accent_hover};
    --steamify-bg-primary: {bg_primary};
    --steamify-bg-secondary: {bg_secondary};
    --steamify-bg-card: {bg_card};
    --steamify-bg-card-hover: {bg_card_hover};
    --steamify-text-primary: {text_primary};
    --steamify-text-secondary: {text_secondary};
    --steamify-card-radius: {card_radius}px;
    --steamify-btn-radius: {btn_radius}px;
    --steamify-font: {font_family};
}}
"#,
        font_import = font_import,
        accent = theme.colors.accent,
        accent_hover = theme.colors.accent_hover,
        bg_primary = theme.colors.primary_background,
        bg_secondary = theme.colors.secondary_background,
        bg_card = theme.colors.card_background,
        bg_card_hover = theme.colors.card_hover_background,
        text_primary = theme.colors.text_primary,
        text_secondary = theme.colors.text_secondary,
        card_radius = theme.geometry.card_radius_px,
        btn_radius = theme.geometry.button_radius_px,
        font_family = theme.typography.font_family
    );

    let webkit_path = target_folder.join("webkit.css");
    fs::write(&webkit_path, webkit_css)
        .map_err(|e| format!("Не удалось записать webkit.css: {}", e))?;

    // 3. libraryroot.custom.css
    let full_css = generate_css(theme);
    let libraryroot_css = format!("@import url('webkit.css');\n\n{}", full_css);
    let libraryroot_path = target_folder.join("libraryroot.custom.css");
    fs::write(&libraryroot_path, libraryroot_css)
        .map_err(|e| format!("Не удалось записать libraryroot.custom.css: {}", e))?;

    Ok(target_folder)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::theme::presets::get_default_presets;

    #[test]
    fn test_all_presets_are_valid() {
        let presets = get_default_presets();
        assert!(presets.len() >= 3);
        for p in presets {
            assert!(p.validate().is_ok(), "Preset {} failed validation", p.metadata.name);
        }
    }

    #[test]
    fn test_theme_export_directory_structure() {
        let presets = get_default_presets();
        let theme = &presets[0];
        let temp_dir = std::env::temp_dir().join(format!("steamify_test_export_{}", uuid::Uuid::new_v4()));

        let result = export_theme_to_directory(theme, &temp_dir);
        assert!(result.is_ok());

        let exported_folder = result.unwrap();
        assert!(exported_folder.join("skin.json").exists());
        assert!(exported_folder.join("webkit.css").exists());
        assert!(exported_folder.join("libraryroot.custom.css").exists());

        // Verify skin.json content
        let skin_content = fs::read_to_string(exported_folder.join("skin.json")).unwrap();
        assert!(skin_content.contains("libraryroot.custom.css"));
        assert!(skin_content.contains("webkit.css"));

        // Cleanup
        let _ = fs::remove_dir_all(&temp_dir);
    }
}
