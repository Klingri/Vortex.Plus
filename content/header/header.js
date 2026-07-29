// Version 2.7 Pre Alpha 29.07.2026

const navBar = document.querySelector('.navbar');

function createNavButton(text, url) {
    const btn = document.createElement('a');
    btn.innerText = text;
    btn.className = 'vpro-nav-btn';
    btn.href = url;

    navBar.appendChild(btn);
    return btn;
}

// Now creating a button takes just one clean line:
createNavButton('Vpro Settings', 'https://playvortex.io/settings');
createNavButton('Vpro GitHub', 'https://github.com/Klingri/VortexPro');
createNavButton('Friends', 'https://playvortex.io/social?user=&tab=friends');
createNavButton('Halos Profile', 'https://playvortex.io/users/1/profile');
createNavButton('Play Vortexia', 'https://playvortex.io/games/8/play');

const alerts = document.querySelector('.navbar-actions', '.navbar-pill-btn', 'vpro-nav-btn', 'btn-secondary');
alerts.addEventListener('click', function () {
    alert("Are you sure you want to click this button?");
});

const navLogo = document.querySelector('.navbar');
const navText = document.createElement('h6');

navText.innerText = 'VortexPro v2.7';
navText.className = 'nav-text';
navText.style.color = '#FFF';
navLogo.appendChild(navText);

const pageTitle = document.querySelector('.page-title');
const settingsButton = document.createElement('button');

settingsButton.innerText = 'VortexPro Settings';
settingsButton.className = 'vpro-nav-btn';
pageTitle.appendChild(settingsButton);

settingsButton.addEventListener('click', function () {
    // 1. Remove existing pages
    document.querySelectorAll(".page").forEach(item => item.remove());
    // 2. Create container and inject structure using a template string
    const settingsPage = document.createElement('div');
    settingsPage.className = 'settings-page';

    settingsPage.innerHTML = `
    <nav class="settings-navbar"></nav>
    <div class="settings-wrapper"></div>
    <h2 class="settings-text">VortexPro Settings // Work in Progress</h2>`;

    document.body.appendChild(settingsPage)

});

const clanTitle = document.querySelector('.page-title');
const clanButton = document.createElement('button');

clanButton.innerText = 'VortexPro Clans';
clanButton.className = 'vpro-nav-btn';
clanTitle.appendChild(clanButton);

clanButton.addEventListener('click', function () {
    // 1. Remove existing pages
    document.querySelectorAll(".page").forEach(item => item.remove());
    // 2. Create container and inject structure using a template string
    const clanPage = document.createElement('div');
    clanPage.className = 'clan-page';

    clanPage.innerHTML = `
    <nav class="settings-navbar"></nav>
    <div class="settings-wrapper"></div>
    <h2 class="settings-text">VortexPro Clans // Work in Progress</h2>`;

    document.body.appendChild(clanPage)

});

const debugTitle = document.querySelector('.page-title');
const debugButton = document.createElement('button');

debugButton.innerText = 'VortexPro Debug';
debugButton.className = 'vpro-nav-btn';
debugTitle.appendChild(debugButton);

debugButton.addEventListener('click', function () {
    // 1. Remove existing pages
    document.querySelectorAll(".page").forEach(item => item.remove());
    // 2. Create container and inject structure using a template string
    const debugPage = document.createElement('div');
    debugPage.className = 'debug-page';

    debugPage.innerHTML = `
    <nav class="settings-navbar"></nav>
    <div class="settings-wrapper"></div>
    <h2 class="settings-text">VortexPro Debug // Work in Progress</h2>`;

    document.body.appendChild(debugPage)

});