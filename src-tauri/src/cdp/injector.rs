use serde_json::json;

pub fn build_inject_payload(css_content: &str) -> String {
    let escaped_css = serde_json::to_string(css_content).unwrap_or_else(|_| "\"\"".to_string());
    format!(
        r#"(function() {{
    const STYLE_ID = 'steamify-injected';
    let style = document.getElementById(STYLE_ID);
    if (!style) {{
        style = document.createElement('style');
        style.id = STYLE_ID;
        (document.head || document.documentElement).appendChild(style);
    }}
    style.textContent = {escaped_css};
}})();"#
    )
}

pub fn build_remove_payload() -> String {
    r#"(function() {
    const el = document.getElementById('steamify-injected');
    if (el) {
        el.remove();
    }
})();"#
        .to_string()
}

pub fn create_runtime_evaluate_message(id: u64, expression: &str) -> String {
    let msg = json!({
        "id": id,
        "method": "Runtime.evaluate",
        "params": {
            "expression": expression,
            "returnByValue": true
        }
    });
    msg.to_string()
}

pub fn create_enable_events_messages(base_id: u64) -> (String, String) {
    let page_enable = json!({
        "id": base_id,
        "method": "Page.enable"
    })
    .to_string();

    let runtime_enable = json!({
        "id": base_id + 1,
        "method": "Runtime.enable"
    })
    .to_string();

    (page_enable, runtime_enable)
}
