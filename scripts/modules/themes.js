// The Comments Explain The Code.
// Have fun reading. the vovels were deleted for faster coding and shortening.
// Press ' TO OPEN MENU'.
// Purple Horse is an outlier.
//Made by Myro.
(function () {
    const prsts = [
        { nm: "Old Roblox Purple", bg: "#f2f2f2", ac: "#6E31AA", tx: "#111", br: "#d6d6d6" },//Default Themes.
        { nm: "Dimmed Beige", bg: "#c2b9a3", ac: "#6b5a44", tx: "#333", br: "#8e8671" },// Old Roblox is Work In Progress.
        { nm: "Swampy Green", bg: "#1f5017", ac: "#8e49aa", tx: "#0c011f", br: "#0c0900" },// Added by Klingri
        { nm: "Dark Mode", bg: "#181818", ac: "#333", tx: "#e0e0e0", br: "#927447" },
        { nm: "Deep Sea", bg: "#041424", ac: "#145299", tx: "#9cf", br: "#0a2e54" },
        { nm: "Midnight", bg: "#0a0a0a", ac: "#444", tx: "#fff", br: "#222" },
        { nm: "Vortex Purple", bg: "#130b1c", ac: "#592d8f", tx: "#d4b3ff", br: "#3a1c5e" },
        { nm: "Terminal", bg: "#050505", ac: "#050", tx: "#0f0", br: "#0f380f" },
        { nm: "Blood Moon", bg: "#1a0505", ac: "#801818", tx: "#fcc", br: "#4a0e0e" },
        { nm: "Desert", bg: "#2b1408", ac: "#a34a1f", tx: "#fb8", br: "#5c2a11" },
        { nm: "Ghost", bg: "#fff", ac: "#000", tx: "#000", br: "#ddd" }
    ];

    let usr_thms = JSON.parse(localStorage.getItem('v_usr_thms')) || [];

    const appl_thm = (thm) => {
        localStorage.setItem('v_lst_thm', JSON.stringify(thm));
        let styl = document.getElementById('v-dyn-css') || document.createElement('style');
        styl.id = 'v-dyn-css';
        (document.head || document.documentElement).appendChild(styl);
        // Code injection defines which one belongs to which group eg. what it tagets.
        styl.innerHTML = `
        body, .navbar, .page, .navbar-search input, .bio-textarea { background:${thm.bg}!important; color:${thm.tx}!important; }
        .btn-primary, .navbar-search bttn, .badge, .btn-play, .status-dot.online { background:${thm.ac}!important; color:${thm.bg}!important; border:none!important; }
        .navbar { border-bottom: 1px solid ${thm.br}!important; }
        .game-card, .user-row, .bio-box, .section-sep, .game-description-box, .profile-info-panel {
            border: 1px solid ${thm.br} !important;
        }
        /* FIX FOR THE SQUARE AVATARS */
        .friend-avatar, .user-row-avatar, .friend-avatar-wrap, .friend-avatar img {
            border: 1px solid ${thm.br} !important;
            border-radius: 50% !important;
            overflow: hidden !important;
        }
        `;

        // Fix: only update boxes if the gui is actually open/exists.
        const box = document.getElementById('e-background');
        if (box) {
            box.value = thm.bg;
            document.getElementById('e-accent').value = thm.ac;
            document.getElementById('e-text').value = thm.tx;
            document.getElementById('e-border').value = thm.br;
        }
    };
    // What you see .map is the stuff you see at the top presets and themes are at the bottom of innerhtml.
    const bld_mn = () => {
        if (document.getElementById('v-thm-mn')) return;
        const gui = document.createElement('div');
        gui.id = 'v-thm-mn';
        gui.innerHTML = `<div class="m-tp">
        ${['Background', 'Accent', 'Text', 'Border'].map(lbl => `<div class="ed-r"><label>${lbl}</label><input id="e-${lbl.toLowerCase()}" type="text"></div>`).join('')}
        <button id="v-appl" style="width:100%;margin:5px 0;border:none;border-radius:0;background:#111;color:white;">Apply</button>
        <div style="display:flex;gap:2px;"><input id="v-nm-inp" type="text" placeholder="Theme Name" style="flex:1;border:none;border-radius:0;"><button id="v-sv-bttn" style="border:none;border-radius:0;background:#111;color:white;">Save</button></div>
        </div>
        <div class="m-bt">
        <div class="cl-hd" id="h-prst" style="border:none;border-radius:0;">▶ Presets</div><div class="cl-cntnt" id="c-prst"></div>
        <div style="height:4px"></div>
        <div class="cl-hd" id="h-usr" style="border:none;border-radius:0;">▶ My Themes</div><div class="cl-cntnt" id="c-usr"></div>
        </div>`;
        document.body.appendChild(gui);

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
        //User theme rendering (x on line 89 is a button which deletes ur theme).
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
        //See the values.
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
    };
    // Which key opens the menu if you want to change (if (e.key === " ' ")).
    const lst_thm = localStorage.getItem('v_lst_thm');
    if (lst_thm) {
        appl_thm(JSON.parse(lst_thm));
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === "'" && document.querySelector('.navbar')) {
            bld_mn();
            let gui = document.getElementById('v-thm-mn');
            gui.style.display = gui.style.display === 'flex' ? 'none' : 'flex';

            // Re-fill boxes when menu opens so they aren't empty
            const curr = localStorage.getItem('v_lst_thm');
            if (curr && gui.style.display === 'flex') {
                const thm = JSON.parse(curr);
                const box = document.getElementById('e-background');
                if (box) {
                    box.value = thm.bg;
                    document.getElementById('e-accent').value = thm.ac;
                    document.getElementById('e-text').value = thm.tx;
                    document.getElementById('e-border').value = thm.br;
                }
            }
        }
    });
})();