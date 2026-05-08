document.getElementById('theme-switch-panel')?.remove();
document.getElementById('theme-injected-style')?.remove();

var styleEl = document.createElement('style');
styleEl.id = 'theme-injected-style';
(document.head || document.documentElement).appendChild(styleEl);

var galaxyInterval = null;

function applyTheme(bg, accent) {
    if (galaxyInterval) { clearInterval(galaxyInterval); galaxyInterval = null; }
    styleEl.textContent = [
        'html, body { background-color: ' + bg + ' !important; color: #ffffff !important; }',
        'div:not([style*="background"]):not([style*="border-radius: 50%"]):not([style*="border-radius:50%"]), ' +
        'main, article, section, aside, header, footer, nav {',
        '  background-color: ' + bg + ' !important;',
        '  color: #ffffff !important;',
        '}',
        'p, span, li, td, th, h1, h2, h3, h4, h5, h6 {',
        '  color: #ffffff !important;',
        '}',
        'a { color: ' + accent + ' !important; }',
        'input, textarea, select {',
        '  background-color: ' + bg + ' !important;',
        '  color: #ffffff !important;',
        '  border-color: ' + accent + ' !important;',
        '}',
        '[style*="border-radius: 50%"], [style*="border-radius:50%"],',
        '[style*="border-radius: 9999"], [style*="border-radius:9999"] {',
        '  background-color: revert !important;',
        '  color: revert !important;',
        '}',
        'img, video, iframe { filter: brightness(0.85); }'
    ].join('\n');
}

function applyGalaxy() {
    if (galaxyInterval) { clearInterval(galaxyInterval); }
    var colors = ['#0d0221','#0a1045','#1a0533','#001a33','#0d1b2a','#1b0033'];
    var i = 0;
    function tick() {
        var bg = colors[i % colors.length];
        var textColor = '#ffffff';
        styleEl.textContent = [
            'html, body { background-color: ' + bg + ' !important; color: ' + textColor + ' !important; transition: background-color 1s !important; }',
            'div:not([style*="background"]):not([style*="border-radius: 50%"]):not([style*="border-radius:50%"]), main, article, section, aside, header, footer, nav {',
            '  background-color: ' + bg + ' !important;',
            '  color: ' + textColor + ' !important;',
            '  transition: background-color 1s !important;',
            '}',
            'p, span, li, td, th, h1, h2, h3, h4, h5, h6 { color: ' + textColor + ' !important; }',
            'a { color: ' + textColor + ' !important; }',
            '[style*="border-radius: 50%"], [style*="border-radius:50%"] { background-color: revert !important; color: revert !important; }',
            'img, video, iframe { filter: brightness(0.75) hue-rotate(' + (i * 30) + 'deg); }'
        ].join('\n');
        i++;
    }
    tick();
    galaxyInterval = setInterval(tick, 1500);
}

var themes = [
    { name: 'Dark',   bg: '#121212', accent: '#bb86fc' },
    { name: 'Blue',   bg: '#0d1b2a', accent: '#60b4ff' },
    { name: 'Navy',   bg: '#001f3f', accent: '#4da6ff' },
    { name: 'Green',  bg: '#0d1f0d', accent: '#4caf50' },
    { name: 'Mint',   bg: '#0a1f1a', accent: '#2dd4bf' },
    { name: 'Galaxy', bg: null,      accent: null      },
    { name: 'Reset',  bg: null,      accent: null      }
];

var panel = document.createElement('div');
panel.id = 'theme-switch-panel';
Object.assign(panel.style, {
    position: 'fixed', bottom: '24px', right: '24px',
    width: '150px', background: 'rgba(18,18,26,0.97)',
    borderRadius: '10px', padding: '12px', zIndex: '999999',
    fontFamily: 'system-ui, sans-serif', display: 'flex',
    flexDirection: 'column', gap: '7px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.08)'
});

var label = document.createElement('div');
label.textContent = '🎨 Themes  [F6]';
Object.assign(label.style, { color: '#aaa', fontSize: '11px', marginBottom: '2px', letterSpacing: '0.5px' });
panel.appendChild(label);

themes.forEach(function(t) {
    var btn = document.createElement('button');
    btn.textContent = t.name === 'Galaxy' ? '🌌 Galaxy' : t.name === 'Reset' ? '↩ Reset' : t.name;
    Object.assign(btn.style, {
        background: t.name === 'Reset' ? '#2a1a1a' : '#1e1e2e',
        color: t.accent || '#ffffff',
        border: '1px solid ' + (t.accent || '#555'),
        borderRadius: '6px', padding: '6px 10px',
        cursor: 'pointer', fontSize: '13px', textAlign: 'left'
    });
    btn.onmouseover = function() { btn.style.opacity = '0.8'; };
    btn.onmouseout  = function() { btn.style.opacity = '1'; };
    btn.onclick = function() {
        if (t.name === 'Galaxy') { applyGalaxy(); }
        else if (t.name === 'Reset') { if (galaxyInterval) { clearInterval(galaxyInterval); galaxyInterval = null; } styleEl.textContent = ''; }
        else { applyTheme(t.bg, t.accent); }
    };
    panel.appendChild(btn);
});

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
        bottom: '24px',
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
