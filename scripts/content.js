chrome.tabs.create({ url: chrome.runtime.getURL("thankyou.html") });

function changeFavicon(src) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = src;
}

// Run once on load
changeFavicon('icons/icon32.png');

// Find the element with the class 'navbar-logo'
const logoLink = document.querySelector('.navbar-logo');

// Check if it exists to avoid errors, then change the text
if (logoLink) {
  logoLink.textContent = 'New Brand Name';
}

const cursorUrl = chrome.runtime.getURL('cursorpack/Normal Select.png'); // Convert to PNG first!
document.body.style.cursor = `url('${cursorUrl}'), auto`;
{
window.onload = () => {
        initialize()

        if (typeof connect != 'undefined') connect()

        let watermark = document.createElement('a')
        watermark.innerHTML = 'VortexPro v0.2.0'
        Object.assign(watermark.style, {
            position: 'fixed',
            bottom: '5px',
            left: '5px',
            color: 'white',
            fontSize: 'x-small',
            opacity: '0.1',
        })
        document.body.appendChild(watermark)
        let vortexprimary = document.getElementsByClassName('navbar-logo')[0];
        if (!vortexprimary) vortexprimary = document.getElementsByClassName('logo')[0]
        if (!vortexprimary) return;
        let vortexsecondary = vortexprimary.cloneNode()
        vortexsecondary.className = 'navbar-logo navbar-logo-secondary'
        vortexsecondary.innerHTML = ' + v0.2.0'
        vortexprimary.appendChild(vortexsecondary)
    }
};