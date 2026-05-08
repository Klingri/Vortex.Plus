document.getElementById('theme-switch-panel')?.remove();

const panel = document.createElement('div');
panel.id = "theme-switch-panel";

Object.assign(panel.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "160px",
    background: "rgba(18, 18, 26, 0.95)",
    borderRadius: "8px",
    padding: "12px",
    zIndex: "999999",
    fontFamily: "system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
});

const label = document.createElement('span');
label.textContent = "🎨 Theme";

Object.assign(label.style, {
    color: "white",
    fontSize: "13px",
    fontWeight: "bold"
});

panel.appendChild(label);

["Light", "Dark", "System"].forEach(theme => {
    const btn = document.createElement('button');

    btn.textContent = theme;

    Object.assign(btn.style, {
        background: "#2a2a3a",
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "6px 10px",
        cursor: "pointer",
        fontSize: "13px"
    });
    
    btn.onclick = () => alert(`Switched to ${theme}`);

    panel.appendChild(btn);
});

document.body.appendChild(panel);
