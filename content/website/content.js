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

const cursorUrl = chrome.runtime.getURL('cursorpack/Normal Select.png'); // Convert to PNG first!
document.body.style.cursor = `url('${cursorUrl}'), auto`;