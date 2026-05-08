

function initThemeUI() {

    document.getElementById('theme-switch-panel')?.remove();
    document.getElementById('theme-injected-style')?.remove();

    var styleEl = document.createElement('style');
    styleEl.id = 'theme-injected-style';

    (document.head || document.documentElement).appendChild(styleEl);
    
    var galaxyInterval = null;

    function applyTheme(bg, accent) {
        if (galaxyInterval) { clearInterval(galaxyInterval); galaxyInterval = null; }

        styleEl.textContent = `
html, body { background-color: ${bg} !important; color: #fff !important; }
a { color: ${accent} !important; }
input, textarea, select { background-color: ${bg} !important; color: #fff !important; border-color: ${accent} !important; }
`;
    }

    var panel = document.createElement('div');
    panel.id = 'theme-switch-panel';

    Object.assign(panel.style, {
        position: 'fixed',
        bottom: '500px',
        right: '24px',
        width: '150px',
        background: 'rgba(18,18,26,0.97)',
        zIndex: '999999',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    });

    panel.innerHTML = `<div style="color:white">Themes</div>`;

    document.body.appendChild(panel);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeUI);
} else {
    initThemeUI();
}
