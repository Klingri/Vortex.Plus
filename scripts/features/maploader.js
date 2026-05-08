let mapsLoaded = []

async function onLoad(name, url) {
    console.log("Loading map:", name, url);
    let f = await fetch('https://cors.io/?u=' + url)
    let r = await f.json()
    let mapData = JSON.parse(r.body)
    let deg2rad = 0.0174532925;
    mapsLoaded[name] = []
    for (let i = 0; i < mapData.length; i++) {
        let v = mapData[i]
        let mesh = addStud(v.S[0], v.S[1], v.S[2], Number('0x' + v.C), v.P[0], v.P[1] - v.S[1] * 0.5, v.P[2], v.R[0] * deg2rad, v.R[1] * deg2rad, v.R[2] * deg2rad)
        mapsLoaded[name][i] = mesh
    }
}

function unloadMap(name) {
    if (mapsLoaded[name]) {
        for (let i = 0; i < mapsLoaded[name].length; i++) {
            let mesh = mapsLoaded[name][i]
            scene.remove(mesh)
        }
    }
}



window.onload = () => {
    // maps, currently just crossroads. add more.
    const maps = [
        { name: "Crossroads", url: "https://pastebin.com/raw/wfEXaPTx" }, //added by Inuk, 6/5/2026, added a ramp to enter the map more easily
    ];

    // gui stuff
    const panel = document.createElement('div');
    panel.id = "maps-loader-panel";

    Object.assign(panel.style, {
        position: "fixed",
        bottom: "12px",
        right: "12px",
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

    // title
    const title = document.createElement('div');
    title.textContent = "Maps";
    Object.assign(title.style, {
        fontSize: "14px",
        fontWeight: "700",
        color: "#fff"
    });
    panel.appendChild(title);

    // Automatically unlock cursor when hovering over the Maploader
panel.onmouseenter = () => {
    if (document.pointerLockElement) {
        document.exitPointerLock();
    }
};

// Optional: If you want the game to re-capture the mouse when you leave the panel
// panel.onmouseleave = () => {
//    // Most browsers require a fresh click to re-lock, 
//    // so auto-locking here might not work without a user click.
// };

    // button styler
    function styleBtn(btn, type = "default") {
        Object.assign(btn.style, {
            padding: "6px 10px",
            border: "none",
            borderRadius: "5px",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: "600",
            cursor: "pointer",
            textAlign: "center",
            background: "rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)"
        });

        if (type === "primary") {
            btn.style.background = "#2563EB";
            btn.style.color = "#fff";
            btn.onmouseenter = () => btn.style.background = "#1d4ed8";
            btn.onmouseleave = () => btn.style.background = "#2563EB";
        }
    }
    // map buttons!!
    maps.forEach(map => {
        const btn = document.createElement('button');
        btn.innerHTML = map.name + ' (Not Loaded)';

        styleBtn(btn);
        let loaded = false;
        btn.onclick = () => {
            if (loaded) {
                unloadMap(map.name)
                btn.innerHTML = map.name + '(Not loaded)'
                loaded = false
            } else {
                onLoad(map.name, map.url);
                btn.innerHTML = map.name + '(Loaded)'
                loaded = true
            }
        };

        panel.appendChild(btn);
    });

    // custom url loader
    const input = document.createElement('input');
    input.placeholder = "Custom URL...";
    Object.assign(input.style, {
        padding: "6px",
        borderRadius: "5px",
        border: "none",
        fontSize: "12px",
        outline: "none",
        background: "rgba(255,255,255,0.08)",
        color: "#fff"
    });

    panel.appendChild(input);

    // custom url loader button
    const loadBtn = document.createElement('button');
    loadBtn.textContent = "Load URL";

    styleBtn(loadBtn, "primary");

    loadBtn.onclick = () => {
        const url = input.value.trim();
        if (!url) return;

        onLoad("Custom", url);
    };

    panel.appendChild(loadBtn);

    console.log('loading');
    // finally, add the gui to the page
    document.body.appendChild(panel);
}
