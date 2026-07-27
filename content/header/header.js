// Empty as of Version 2.5 Pre Alpha 05.07.2026
const navButton = document.querySelector('.navbar');
const newElement = document.createElement("a");
newElement.innerText = 'Vpro Github';
newElement.className = 'vpro-nav-btn';
newElement.style.padding = '4px';
newElement.style.backgroundColor = '#4c87af';
navButton.appendChild(newElement);
newElement.addEventListener('click', function () {
    window.location.href = "https://github.com/Klingri/VortexPro";
});

const navArea = document.querySelector('.navbar');
const vproSettings = document.createElement("a");
vproSettings.innerText = 'Vpro Settings';
vproSettings.className = 'vpro-nav-btn';
vproSettings.style.backgroundColor = '#4c87af';
navArea.appendChild(vproSettings);
vproSettings.addEventListener('click', function () {
    window.location.href = "https://playvortex.io/settings";
});

const navPlace = document.querySelector('.navbar');
const friendShortcut = document.createElement("a");
friendShortcut.innerText = 'Friends';
friendShortcut.className = 'vpro-nav-btn';
friendShortcut.style.backgroundColor = '#4c87af';
navPlace.appendChild(friendShortcut);
friendShortcut.addEventListener('click', function () {
    window.location.href = "https://playvortex.io/social?user=&tab=friends";
});

const navProfilePlace = document.querySelector('.navbar');
const profileShortcut = document.createElement("a");
profileShortcut.innerText = 'Halos Profile';
profileShortcut.className = 'vpro-nav-btn';
profileShortcut.style.backgroundColor = '#4c87af';
navProfilePlace.appendChild(profileShortcut);
profileShortcut.addEventListener('click', function () {
    window.location.href = "https://playvortex.io/users/1/profile";
});

const navGamePlace = document.querySelector('.navbar');
const playShortcut = document.createElement("a");
playShortcut.innerText = 'Play Vortexia';
playShortcut.className = 'vpro-nav-btn';
playShortcut.style.backgroundColor = '#4c87af';
navGamePlace.appendChild(playShortcut);
playShortcut.addEventListener('click', function () {
    window.location.href = "https://playvortex.io/games/8/play";
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
settingsButton.style.backgroundColor = '#014f8f';
pageTitle.appendChild(settingsButton);

settingsButton.addEventListener('click', function () {
    const items = document.querySelectorAll(".page");
    items.forEach(item => item.remove());;
    const theBody = document.querySelector('body');
    const settingsPage = document.createElement('div');
    settingsPage.className = 'settings-page';
    const settingsTitle = document.createElement('h2');
    settingsTitle.innerText = 'VortexPro Settings // Work in Progress'
    settingsTitle.className = 'settings-text';
    settingsTitle.style.textAlign = "center";
    const navStnBar = document.createElement('div');
    const navbar2 = document.createElement('nav');
    navbar2.className = 'settings-navbar';
    navStnBar.className = 'settings-navbar';
    navStnBar.style.alignContent = 'left';
    navStnBar.style.alignItems = 'left';
    navStnBar.style.alignSelf = 'left';
    navStnBar.style.justifyContent = 'left';
    navStnBar.style.justifySelf = 'left';
    navStnBar.style.justifyItems = 'left';
    navStnBar.appendChild(settingsTitle);
    settingsPage.appendChild(settingsTitle);
    theBody.appendChild(settingsPage)

});

const alertTest = document.querySelector('.btn-secondary')
alertTest.addEventListener('click', function () {
    alert("Are you sure you want to click this?");
});

const alertTest3 = document.querySelector('.navbar-actions')
alertTest3.addEventListener('click', function () {
    alert("Are you sure you want to click this?");
});


const alertTest2 = document.querySelector('.item-image-wrap')
alertTest2.addEventListener('click', function () {
    alert("Are you sure you want to click this?");
});

const alertTest4 = document.querySelector('.avatar-render-box')
alertTest2.addEventListener('click', function () {
    alert("Are you sure you want to click this?");
    window.location.href = "https://playvortex.io/games/8";
});

// Creating a new element out of thin air
const versionText = document.createElement('div');
versionText.className = 'custom-feature-box';
versionText.innerText = 'VortexPro Pre-Alpha v2.6';

// Appending it to the body of the page/popup
document.body.appendChild(versionText);

const saveButton = document.querySelector('.avatar-panel')
const resetButton = document.createElement('button');
resetButton.className = '#save-btn';
resetButton.innerText = 'Reset';
saveButton.appendChild(resetButton);

document.addEventListener('DOMContentLoaded', () => {
    const targetElement = document.querySelector('.btn-download-nav');

    if (targetElement) {
        targetElement.addEventListener('click', function () {
            targetElement.remove();
        });
    }
});