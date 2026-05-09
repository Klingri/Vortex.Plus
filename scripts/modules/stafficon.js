const codeToInject = `(function () {
    // 1. Give the icon some actual content (e.g., an SVG or Emoji)
    const STAFF_ICON = '<span class="lb-staff-icon">★</span>';
    const FRIEND_RX = /\\s*/;

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
            if (!lb[fnName]) return;
            const orig = lb[fnName].bind(lb);
            lb[fnName] = function (...args) {
                mutator(args);
                return orig(...args);
            };
        };

        wrap('setPlayers', (args) => {
            const ps = args[0];
            if (Array.isArray(ps)) {
                ps.forEach(p => { if (p && p.id === myId) p.is_staff = true; });
            }
        });

        wrap('addPlayer', (args) => {
            const p = args[0];
            if (p && p.id === myId) p.is_staff = true;
        });
    }

    function injectIntoSelfRow() {
        const bodyEl = document.getElementById('lb-body');
        if (!bodyEl) return;
        
        const selfRow = bodyEl.querySelector('.lb-row.lb-self .lb-name');
        if (!selfRow || selfRow.querySelector('.lb-staff-icon')) return;

        const text = selfRow.textContent.trim();
        // Fixed the broken replace syntax
        const escaped = text.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
        selfRow.innerHTML = STAFF_ICON + ' ' + escaped;
    }

    function ensureCss() {
        if (document.getElementById('staff-icon-style')) return;
        const s = document.createElement('style');
        s.id = 'staff-icon-style';
        s.textContent = '.lb-staff-icon{color:#ff3b3b;margin-right:4px;font-weight:bold;}';
        document.head.appendChild(s);
    }

    function start() {
        ensureCss();
        patchPlayers();
        
        // Use a persistent observer on the body
        const observer = new MutationObserver(() => {
            patchPlayers(); // Try to patch if Leaderboard loads late
            injectIntoSelfRow();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();`;

// This part bypasses the "Isolated World" restriction
const script = document.createElement('script');
script.textContent = codeToInject;
(document.head || document.documentElement).appendChild(script);
script.remove();