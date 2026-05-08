(function () {
    const STAFF_ICON = ``;

    const bodyEl = document.getElementById('lb-body');
    const FRIEND_RX = /\s*/;

    function getMyId() {
        const lb = window.Leaderboard;
        if (!lb) return null;
        const probe = Symbol('probe');
        let id = null;
        try {
            const fn = lb.setMyId;
            const orig = fn;
            lb.setMyId = function (v) { id = v; return orig.call(this, v); };
        } catch { }
        return id;
    }

    function patchPlayers() {
        const lb = window.Leaderboard;
        if (!lb || lb.__staffPatched) return;
        lb.__staffPatched = true;

        let myId = null;
        const origSetMyId = lb.setMyId.bind(lb);
        lb.setMyId = function (id) {
            myId = id;
            return origSetMyId(id);
        };

        const wrap = (fnName, mutator) => {
            const orig = lb[fnName].bind(lb);
            lb[fnName] = function (...args) {
                mutator(args);
                return orig(...args);
            };
        };

        wrap('setPlayers', (args) => {
            const ps = args[0];
            if (Array.isArray(ps)) {
                for (const p of ps) {
                    if (p && p.id === myId) p.is_staff = true;
                }
            }
        });

        wrap('addPlayer', (args) => {
            const p = args[0];
            if (p && p.id === myId) p.is_staff = true;
        });
    }

    function injectIntoSelfRow() {
        if (!bodyEl) return;
        const selfRow = bodyEl.querySelector('.lb-row.lb-self .lb-name');
        if (!selfRow) return;
        if (selfRow.querySelector('.lb-staff-icon')) return;
        let html = selfRow.innerHTML;
        html = html.replace(FRIEND_RX, '');
        const text = selfRow.textContent.trim();
        const escaped = text.replace(/&/g, '&').replace//g, '>');
        selfRow.innerHTML = STAFF_ICON + ' ' + escaped;
    }

    function ensureCss() {
        if (document.getElementById('staff-icon-style')) return;
        const s = document.createElement('style');
        s.id = 'staff-icon-style';
        s.textContent = `.lb-staff-icon{color:#ff3b3b;margin-right:4px;}`;
        document.head.appendChild(s);
    }

    function start() {
        ensureCss();
        patchPlayers();
        injectIntoSelfRow();

        if (bodyEl) {
            const mo = new MutationObserver(() => injectIntoSelfRow());
            mo.observe(bodyEl, { childList: true, subtree: true });
        }

        setInterval(injectIntoSelfRow, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();