function initThemeUI() {

    document.getElementById('theme-switch-panel')?.remove();

    var themes = [
        { name: 'Dark', cssname: ''},
        { name: 'Ocean', cssname: 'ocean'},
        { name: 'Brown', cssname: 'poop'},
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

    themes.forEach(theme => {
        var btn = document.createElement('button');
        btn.textContent = theme.name;

        Object.assign(btn.style, {
            background: '#1e1e2e',
            color: 'white',
            border: '1px solid #555',
            padding: '6px',
            cursor: 'pointer'
        });

        btn.onclick = () => {
            document.documentElement.setAttribute('data-theme', theme.cssname);
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
