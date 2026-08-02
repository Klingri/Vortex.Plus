// Version 2.9 Pre Alpha 29.07.2026

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
createNavButton('Vpro Update', 'https://github.com/Klingri/VortexPro/releases');
createNavButton('Friends', 'https://playvortex.io/social?user=&tab=friends');
createNavButton('Halos Profile', 'https://playvortex.io/users/1/profile');
createNavButton('Play Vortexia', 'https://playvortex.io/games/8/play');

const alerts = document.querySelector('.navbar-actions', '.navbar-pill-btn', 'vpro-nav-btn', 'btn-secondary');
alerts.addEventListener('click', function () {
    alert("Are you sure you want to click this button?");
});

const navLogo = document.querySelector('.navbar');
const navText = document.createElement('h6');

navText.innerText = 'VortexPro v2.9';
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
    <nav class="settings-navbar"><button class="vpro-set-btn">Go Back</button></nav>
    <div class="settings-wrapper">
        <div class="setting-box">
                <p class="setting-txt">Test Setting</p>
                <button id="setting-btn">On</button>
        </div>
    
    </div>
    <div id="v-thm-mn">
    <div class="m-tp">Theme Settings</div>
        <div class="m-body">
            ${['Background', 'Accent', 'Text', 'Border'].map(lbl => `<div class="ed-r"><label>${lbl}</label><input id="e-${lbl.toLowerCase()}" type="text"></div>`).join('')}
            <button id="v-appl" style="width:100%;margin:5px 0;border:none;border-radius:0;background:#111;color:white;">Apply Changes</button>
            <div style="display:flex;gap:2px;"><input id="v-nm-inp" type="text" placeholder="Theme Name" style="flex:1;border:none;border-radius:0;"><button id="v-sv-bttn" style="border:none;border-radius:0;background:#111;color:white;">Save Theme</button></div>
        </div>
        <div class="m-bt">
            <div class="cl-hd" id="h-prst">▼ Presets</div><div class="cl-cntnt" id="c-prst" style="display: flex;"></div>
            <div style="height:4px"></div>
            <div class="cl-hd" id="h-usr">▼ My Themes</div><div class="cl-cntnt" id="c-usr" style="display: flex;"></div>
        </div>
    </div>
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
    document.querySelectorAll("#v-thm-mn").forEach(item => item.remove());
    // 2. Create container and inject structure using a template string
    const clanPage = document.createElement('div');
    clanPage.className = 'clan-page';

    clanPage.innerHTML = `
    <nav class="clans-navbar">
        <ul class="button-list">
                <li class="stn-nav-btn">Clan1</li>
                <li class="stn-nav-btn">Clan2</li>
                <li class="stn-nav-btn">Clan3</li>
                <li class="stn-nav-btn">Clan4</li>
        </ul>
    </nav>
    <div class="clans-wrapper">
        <div class="clans-header">
                <div class="clan-welcome">
                        <span class="clan-img">Clan Image & Banner</span>
                        <h2 class="clan-title">Clan title</h2>
                        <h4 class="clan-creator">Klingri</h4>
                        <p class="clan-detail">Members:</p>
                        <a class="clan-a">100</a>
                        <p class="clan-detail">Rank:</p>
                        <a class="clan-a">Tester</a>
                        <button class="clan-create">Create Clan</button>
                        <button class="clan-menu">Clan Menu</button>
                </div>

                <div class="clan-submenus">
                    <ul class="clan-submenu-list">
                        <li class="clan-submenu">About</li>
                        <li class="clan-submenu">Store</li>
                        <li class="clan-submenu">Games</li>
                        <li class="clan-submenu">Affiliates</li>
                    
                    </ul>
                </div>

                <div class="clan-shout-box">
                    <h3 class="clan-shout-msg">Shout</h3>
                    <input class="shout-box" placeholder="Enter your shout"></input>
                    <button class="clan-shout-btn">Clan Shout</button>
                </div>

                <div class="clan-descrp-box">
                    <h3 class="clan-descrp-msg">Description</h3>
                    <p class="clan-description">Lorem Ipsum Clan</p>
                </div>

                <div class="members-box">
                    <h3 class="members-msg">Members (100)</h3>
                    <p class="clan-description">Lorem Ipsum Clan</p>
                </div>

        </div>
    
    
    </div>
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
    document.querySelectorAll("#v-thm-mn").forEach(item => item.remove());
    // 2. Create container and inject structure using a template string
    const debugPage = document.createElement('div');
    debugPage.className = 'debug-page';

    debugPage.innerHTML = `
    <nav class="settings-navbar"></nav>
    <div class="settings-wrapper"></div>
    <h2 class="settings-text">VortexPro Debug // Work in Progress</h2>`;

    document.body.appendChild(debugPage)

});

const gobackBtn = document.querySelector('.vpro-set-btn');
gobackBtn.addEventListener('click', function () {
    window.location.href = "https://playvortex.io/settings";
});

const greetingTxt = document.querySelector('#home-greeting');
const dismissGreeting = document.createElement('button');
dismissGreeting.innerText = 'Dismiss greeting';
dismissGreeting.className = 'vpro-nav-btn';
greetingTxt.append(dismissGreeting);

/*dismissGreeting.addEventListener('click', function () {
  greetingTxt.remove();
});*/

// 2. Select the button NOW that it exists in the DOM
const myButton = document.querySelector('vpro-set-btn');

// 3. Attach your event listener
myButton.addEventListener('click', () => {
    window.location.href = "https://playvortex.io/settings";
});

const settingbtn = document.getElementById('#setting-btn');

settingbtn.addEventListener('click', () => {
  if (settingbtn.textContent === 'On') {
    settingbtn.textContent = 'Off';
  } else {
    settingbtn.textContent = 'On';
  }
});
