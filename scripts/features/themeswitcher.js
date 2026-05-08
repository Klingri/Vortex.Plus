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
        zIndex: "300",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    });

document.body.appendChild(panel);
