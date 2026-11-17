use super::model::ThemeConfig;

pub fn generate_css(theme: &ThemeConfig) -> String {
    let font_import = if let Some(ref google_font) = theme.typography.google_font_family {
        let clean_name = google_font.replace(' ', "+");
        format!("@import url('https://fonts.googleapis.com/css2?family={}:wght@400;500;600;700&display=swap');\n\n", clean_name)
    } else {
        String::new()
    };

    let background_css = if theme.background.enabled && !theme.background.image_url.trim().is_empty() {
        format!(
            r#"
/* Фоновое изображение библиотеки Steamify */
div[class*="library_LibraryWindow"]::before,
div[class*="libraryhome_LibraryHome"]::before {{
    content: "" !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background-image: url('{}') !important;
    background-size: cover !important;
    background-position: center !important;
    filter: blur({}px) !important;
    opacity: {} !important;
    pointer-events: none !important;
    z-index: 0 !important;
}}
"#,
            theme.background.image_url,
            theme.background.blur_px,
            theme.background.opacity
        )
    } else {
        String::new()
    };

    let whats_new_toggle = if theme.toggles.hide_whats_new {
        r#"
/* Скрытие блока "Что нового" */
div[class*="libraryhomeshowcases_WhatIsNew"],
div[class*="libraryhomeshowcases_WhatIsNewContainer"],
div[class*="whatsnew_"] {
    display: none !important;
}
"#
    } else {
        ""
    };

    let bottom_bar_toggle = if theme.toggles.hide_bottom_download_bar {
        r#"
/* Скрытие нижней панели загрузки */
div[class*="bottombar_BottomBar"],
div[class*="bottombar_Container"],
footer[class*="bottombar_BottomBar"] {
    display: none !important;
}
"#
    } else {
        ""
    };

    let compact_sidebar_toggle = if theme.toggles.compact_sidebar {
        r#"
/* Компактный режим боковой панели */
div[class*="gamelistbar_Container"] {
    width: 210px !important;
    min-width: 210px !important;
    max-width: 210px !important;
}
div[class*="gamelistentry_Container"],
div[class*="gamelistentry_GameListEntry"] {
    height: 26px !important;
    min-height: 26px !important;
    padding-top: 2px !important;
    padding-bottom: 2px !important;
    font-size: 12px !important;
}
"#
    } else {
        ""
    };

    format!(
        r#"{font_import}/* === STEAMIFY GENERATED THEME: {name} (v{version}) === */
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

/* Типографика */
body, .DesktopUI, div[class*="steamdesktop_SteamDesktop"], div[class*="gamelistbar_Container"] {{
    font-family: var(--steamify-font) !important;
}}

/* Основной фон клиента и домашней библиотеки */
div[class*="library_LibraryWindow"],
div[class*="libraryhome_LibraryHome"],
div[class*="libraryhomeshowcases_OuterContainer"],
div[class*="steamdesktop_SteamDesktop"] {{
    background-color: var(--steamify-bg-primary) !important;
    color: var(--steamify-text-primary) !important;
}}

/* Боковая панель игр */
div[class*="gamelistbar_Container"],
div[class*="gamelistsectionheader_SectionHeader"],
div[class*="gamelistbar_GameList"] {{
    background-color: var(--steamify-bg-secondary) !important;
    border-color: rgba(255, 255, 255, 0.06) !important;
}}

/* Выделение активного пункта в списке игр */
div[class*="gamelistentry_Selected"] {{
    background: linear-gradient(90deg, var(--steamify-accent) 0%, transparent 100%) !important;
    color: #ffffff !important;
    border-radius: var(--steamify-card-radius) !important;
}}

/* Карточки игр и витрины */
div[class*="libraryhomelist_AppCapsule"],
div[class*="gamegrid_Card"],
div[class*="appportrait_PortraitImage"],
div[class*="allcollectionsgrid_AppCollection"] {{
    border-radius: var(--steamify-card-radius) !important;
    overflow: hidden !important;
    background-color: var(--steamify-bg-card) !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35) !important;
    transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease !important;
}}

div[class*="libraryhomelist_AppCapsule"]:hover,
div[class*="gamegrid_Card"]:hover {{
    transform: translateY(-3px) scale(1.02) !important;
    background-color: var(--steamify-bg-card-hover) !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
}}

/* Скругления и цвет кнопок */
button,
div[class*="DialogButton"],
div[class*="playbutton_PlayButton"],
div[class*="header_HeaderButton"] {{
    border-radius: var(--steamify-btn-radius) !important;
}}

/* Акцентная кнопка запуска / воспроизведения */
div[class*="playbutton_PlayButton"] button,
button[class*="playbutton_PlayButton"] {{
    background: var(--steamify-accent) !important;
    color: #ffffff !important;
}}

div[class*="playbutton_PlayButton"] button:hover,
button[class*="playbutton_PlayButton"]:hover {{
    background: var(--steamify-accent-hover) !important;
}}

/* Тексты */
div[class*="gamelistentry_GameName"],
div[class*="libraryhome_SectionTitle"] {{
    color: var(--steamify-text-primary) !important;
}}

div[class*="gamelistentry_Summary"],
div[class*="gamelistsectionheader_SectionHeader"] {{
    color: var(--steamify-text-secondary) !important;
}}

{background_css}
{whats_new_toggle}
{bottom_bar_toggle}
{compact_sidebar_toggle}
"#,
        font_import = font_import,
        name = theme.metadata.name,
        version = theme.metadata.version,
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
        font_family = theme.typography.font_family,
        background_css = background_css,
        whats_new_toggle = whats_new_toggle,
        bottom_bar_toggle = bottom_bar_toggle,
        compact_sidebar_toggle = compact_sidebar_toggle
    )
}
