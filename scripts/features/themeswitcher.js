function initThemeUI() {

    document.getElementById('theme-switch-panel')?.remove();
    document.getElementById('theme-injected-style')?.remove();

    var styleEl = document.createElement('style');
    styleEl.id = 'theme-injected-style';
    (document.head || document.documentElement).appendChild(styleEl);

    var galaxyInterval = null;

    function applyTheme(bg, accent) {
        if (galaxyInterval) clearInterval(galaxyInterval);

        styleEl.textContent = `
html, body { background-color: ${bg} !important; color: #fff !important; }
a { color: ${accent} !important; }
input, textarea, select { background-color: ${bg} !important; color: #fff !important; }
`;
    }

    var themes = [
        { name: 'Dark', bg: '#121212', accent: '#bb86fc' },
        { name: 'Blue', bg: '#0d1b2a', accent: '#60b4ff' },
        { name: 'Reset', bg: null, accent: null }
    ];

    var panel = document.createElement('div');
    panel.id = 'theme-switch-panel';

    Object.assign(panel.style, {
        position: 'fixed',
        bottom: '500px',
        right: '24px',
        width: '160px',
        background: 'rgba(18,18,26,0.97)',
        padding: '12px',
        zIndex: '999999',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    });

    var label = document.createElement('div');
    label.textContent = '🎨 Themes';
    label.style.color = 'white';
    panel.appendChild(label);

    themes.forEach(t => {
        var btn = document.createElement('button');
        btn.textContent = t.name;

        Object.assign(btn.style, {
            background: '#1e1e2e',
            color: 'white',
            border: '1px solid #555',
            padding: '6px',
            cursor: 'pointer'
        });

        btn.onclick = () => {
            if (t.name === 'Reset') {
                styleEl.textContent = '';
            } else {
                applyTheme(t.bg, t.accent);
            }
        };

        panel.appendChild(btn);
    });

    document.body.appendChild(panel);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeUI);
} else {
    initThemeUI();
}
