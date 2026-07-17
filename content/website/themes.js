(function () {
    const prsts = [
        { nm: "Vortex Purple", bg: "#ccccca", ac: "#4B0082", tx: "#111", br: "#B19CD9" },
        { nm: "Red Tomato", bg: "#b30000", ac: "#2b2b2b", tx: "#990000", br: "#ff1a1a" },
        { nm: "Cyan Diamond", bg: "#00a2cc", ac: "#3198aa", tx: "#111", br: "#00b8d8" },
        { nm: "Navy Blue", bg: "#1a56db", ac: "#3931aa", tx: "#111", br: "#001cbd" },
        { nm: "Pink Flower", bg: "#c864a7", ac: "#aa3190", tx: "#111", br: "#bd00bd" },
        { nm: "Purple Lilac", bg: "#9a46ff", ac: "#9631aa", tx: "#111", br: "#8100bd" },
        { nm: "Grey Stone", bg: "#BDB7B3", ac: "#161616", tx: "#111", br: "#8b8b8b" },
        { nm: "Total Darkness", bg: "#000000", ac: "#0e0000", tx: "#111", br: "#070000" },
        { nm: "Dimmed Beige", bg: "#e0d2b2", ac: "#6b5a44", tx: "#333", br: "#8e8671" },
        { nm: "Swampy Green", bg: "#287c1c", ac: "#8e49aa", tx: "#0c011f", br: "#0c0900" },
        { nm: "Sunflower Yellow", bg: "#FFD700", ac: "#9caa49", tx: "#0c011f", br: "#0c0900" },
        { nm: "Orange Carrot", bg: "#d97706", ac: "#805e00", tx: "#0c011f", br: "#0c0900" },
        { nm: "Dark Mode", bg: "#181818", ac: "#333", tx: "#e0e0e0", br: "#927447" },
        { nm: "Deep Sea", bg: "#041424", ac: "#145299", tx: "#9cf", br: "#0a2e54" },
        { nm: "Midnight", bg: "#0a0a0a", ac: "#444", tx: "#fff", br: "#222" },
        { nm: "Vortex Purple", bg: "#130b1c", ac: "#592d8f", tx: "#d4b3ff", br: "#3a1c5e" },
        { nm: "Terminal", bg: "#050505", ac: "#050", tx: "#0f0", br: "#0f380f" },
        { nm: "Blood Moon", bg: "#1a0505", ac: "#801818", tx: "#fcc", br: "#4a0e0e" },
        { nm: "Desert", bg: "#2b1408", ac: "#a34a1f", tx: "#fb8", br: "#5c2a11" },
        { nm: "Ghost", bg: "#f9f9f9", ac: "#000", tx: "#000", br: "#ddd" }
    ];

    let usr_thms = JSON.parse(localStorage.getItem('v_usr_thms')) || [];

    const appl_thm = (thm) => {
        localStorage.setItem('v_lst_thm', JSON.stringify(thm));
        let styl = document.getElementById('v-dyn-css') || document.createElement('style');
        styl.id = 'v-dyn-css';
        (document.head || document.documentElement).appendChild(styl);

        styl.innerHTML = `
        body, .navbar, .page, .navbar-search input, .bio-textarea { background:${thm.bg}!important; color:${thm.tx}!important; }
        .btn-primary, .navbar-search bttn, .badge, .btn-play, .status-dot.online { background:${thm.ac}!important; color:${thm.bg}!important; border:none!important; }
        .navbar { border-bottom: 1px solid ${thm.br}!important; }
        .game-card, .user-row, .bio-box, .section-sep, .game-description-box, .profile-info-panel { border: 1px solid ${thm.br} !important; }
        .friend-avatar, .user-row-avatar, .friend-avatar-wrap, .friend-avatar img { border: 1px solid ${thm.br} !important; border-radius: 50% !important; overflow: hidden !important; }
        `;

        // Update the input fields right away if they are drawn on the page
        const box = document.getElementById('e-background');
        if (box) {
            box.value = thm.bg;
            document.getElementById('e-accent').value = thm.ac;
            document.getElementById('e-text').value = thm.tx;
            document.getElementById('e-border').value = thm.br;
        }
    };

    const bld_mn = () => {
        // 1. CHOOSE YOUR TARGET: Find the settings block container on your page
        // Replace '.settings-container' with the actual class or ID of your settings area
        const targetContainer = document.querySelector('.settings-page') || document.body;

        if (document.getElementById('v-thm-mn') || !targetContainer) return;

        const gui = document.createElement('div');
        gui.id = 'v-thm-mn';
        gui.innerHTML = `<div class="m-tp">Theme Settings</div>
        <div class="m-body">
            ${['Background', 'Accent', 'Text', 'Border'].map(lbl => `<div class="ed-r"><label>${lbl}</label><input id="e-${lbl.toLowerCase()}" type="text"></div>`).join('')}
            <button id="v-appl" style="width:100%;margin:5px 0;border:none;border-radius:0;background:#111;color:white;">Apply Changes</button>
            <div style="display:flex;gap:2px;"><input id="v-nm-inp" type="text" placeholder="Theme Name" style="flex:1;border:none;border-radius:0;"><button id="v-sv-bttn" style="border:none;border-radius:0;background:#111;color:white;">Save Theme</button></div>
        </div>
        <div class="m-bt">
            <div class="cl-hd" id="h-prst">▼ Presets</div><div class="cl-cntnt" id="c-prst" style="display: flex;"></div>
            <div style="height:4px"></div>
            <div class="cl-hd" id="h-usr">▼ My Themes</div><div class="cl-cntnt" id="c-usr" style="display: flex;"></div>
        </div>`;

        targetContainer.appendChild(gui);

        const tgl_sect = (hd, cnt) => {
            let h = document.getElementById(hd), c = document.getElementById(cnt);
            h.onclick = () => {
                let opn = c.style.display === 'flex';
                c.style.display = opn ? 'none' : 'flex';
                h.innerText = (opn ? '▶ ' : '▼ ') + h.innerText.slice(2);
            };
        };
        tgl_sect('h-prst', 'c-prst'); tgl_sect('h-usr', 'c-usr');

        prsts.forEach(p => {
            let bttn = document.createElement('div');
            bttn.className = 'thm-bttn';
            bttn.style = `background:${p.bg};color:${p.tx};border:none;border-radius:0;`;
            bttn.innerText = p.nm;
            bttn.onclick = () => appl_thm(p);
            document.getElementById('c-prst').appendChild(bttn);
        });

        const rndr_usr_thms = () => {
            let lst = document.getElementById('c-usr');
            lst.innerHTML = '';
            usr_thms.forEach((thm, i) => {
                let rw = document.createElement('div'); rw.style = "display:flex;gap:2px;";
                let bttn = document.createElement('div'); bttn.className = 'thm-bttn';
                bttn.style = `flex:1;background:${thm.bg};color:${thm.tx};border:none;border-radius:0;`;
                bttn.innerText = thm.nm; bttn.onclick = () => appl_thm(thm);
                let del = document.createElement('button'); del.innerText = 'X'; del.style = "border:none;border-radius:0;background:#111;color:white;";
                del.onclick = () => { usr_thms.splice(i, 1); localStorage.setItem('v_usr_thms', JSON.stringify(usr_thms)); rndr_usr_thms(); };
                rw.append(bttn, del); lst.appendChild(rw);
            });
        };
        rndr_usr_thms();

        document.getElementById('v-appl').onclick = () => appl_thm({
            nm: "Custom",
            bg: document.getElementById('e-background').value,
            ac: document.getElementById('e-accent').value,
            tx: document.getElementById('e-text').value,
            br: document.getElementById('e-border').value
        });

        document.getElementById('v-sv-bttn').onclick = () => {
            usr_thms.push({
                nm: document.getElementById('v-nm-inp').value || "Thm",
                bg: document.getElementById('e-background').value,
                ac: document.getElementById('e-accent').value,
                tx: document.getElementById('e-text').value,
                br: document.getElementById('e-border').value
            });
            localStorage.setItem('v_usr_thms', JSON.stringify(usr_thms));
            rndr_usr_thms();
        };

        // Populate initial values into fields when page loads
        const curr = localStorage.getItem('v_lst_thm');
        if (curr) {
            const thm = JSON.parse(curr);
            document.getElementById('e-background').value = thm.bg;
            document.getElementById('e-accent').value = thm.ac;
            document.getElementById('e-text').value = thm.tx;
            document.getElementById('e-border').value = thm.br;
        }
    };

    // Automatically build the panel ONLY if we are on the settings URL path
    const init_thm_manager = () => {
        // Change '/settings' to whatever matches your settings page URL path
        // For example, if the URL is 'roblox.com/settings' or 'localhost/settings.html'
        if (window.location.href.includes('/settings')) {
            bld_mn();
        }
    };

    // Keep theme loading persistent everywhere, but restrict the GUI builder
    const lst_thm = localStorage.getItem('v_lst_thm');
    if (lst_thm) {
        appl_thm(JSON.parse(lst_thm));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init_thm_manager);
    } else {
        init_thm_manager();
    }
})();