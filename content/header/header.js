// Empty as of Version 2.5 Pre Alpha 05.07.2026
const navButton = document.querySelector('.navbar');
const newElement = document.createElement("a");
newElement.innerText = 'Vpro Github';
newElement.className = 'btn-discord';
newElement.style.backgroundColor = '#4c87af';
navButton.appendChild(newElement);
newElement.addEventListener('click', function () {
    window.location.href = "https://github.com/Klingri/VortexPro";
});

const navArea = document.querySelector('.navbar');
const vproSettings = document.createElement("a");
vproSettings.innerText = 'Vpro Settings';
vproSettings.className = 'btn-discord';
vproSettings.style.backgroundColor = '#4c87af';
navArea.appendChild(vproSettings);
vproSettings.addEventListener('click', function () {
    window.location.href = "https://playvortex.io/settings";
});

const navPlace = document.querySelector('.navbar');
const friendShortcut = document.createElement("a");
friendShortcut.innerText = 'Friends';
friendShortcut.className = 'btn-discord';
friendShortcut.style.backgroundColor = '#4c87af';
navPlace.appendChild(friendShortcut);
friendShortcut.addEventListener('click', function () {
    window.location.href = "https://playvortex.io/social?user=&tab=friends";
});

const navLogo = document.querySelector('.navbar');
const navText = document.createElement('h6');
navText.innerText = 'VortexPro v2.5';
navText.className = 'nav-text';
navText.style.color = '#FFF';
navLogo.appendChild(navText);

const pageTitle = document.querySelector('.page-title');
const settingsButton = document.createElement('button');
settingsButton.innerText = 'VortexPro Settings';
settingsButton.className = 'btn-discord';
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
    settingsPage.appendChild(settingsTitle);
    theBody.appendChild(settingsPage)

});

const alertTest = document.querySelector('.navbar-actions')
alertTest.addEventListener('click', function () {
    alert("Are you sure you want to click this?");
});

const alertTest2 = document.querySelector('.item-image-wrap')
alertTest2.addEventListener('click', function () {
    alert("Are you sure you want to click this?");
});

// Creating a new element out of thin air
const versionText = document.createElement('div');
versionText.className = 'custom-feature-box';
versionText.innerText = 'VortexPro Pre-Alpha v2.5';

// Appending it to the body of the page/popup
document.body.appendChild(versionText);

const saveButton = document.querySelector('.avatar-panel')
const resetButton = document.createElement('button');
resetButton.className = '#save-btn';
resetButton.innerText = 'Reset';
saveButton.appendChild(resetButton);