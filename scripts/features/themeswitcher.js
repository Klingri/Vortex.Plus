window.addEventListener("load", () => {

    document.getElementById("theme-switch-panel")?.remove();

    const panel = document.createElement("div");

    panel.id = "theme-switch-panel";

    Object.assign(panel.style, {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "160px",
        background: "red",
        color: "white",
        padding: "12px",
        zIndex: "2147483647",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        border: "4px solid yellow"
    });

    panel.innerHTML = `
        <div>THE PANEL EXISTS</div>
        <button>Light</button>
        <button>Dark</button>
        <button>System</button>
    `;

    document.body.appendChild(panel);

    console.log("PANEL ADDED");
});

//WOR KWO TKOWRKKOWKR AOPFDLKJGS
