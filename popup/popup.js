// popup.js
const openSettings = () => {
  const settingsBtn = document.getElementById('open-settings');

  if (settingsBtn) {
    settingsBtn.onclick = () => {
      chrome.tabs.create({ url: 'settings/options.html' });
    };
    console.log("VortexPro: Settings listener attached.");
  } else {
    console.error("VortexPro: Button not found in DOM.");
  }
};

const openWebsite = () => {
  const websiteBtn = document.getElementById('open-website');

  if (websiteBtn) {
    websiteBtn.onclick = () => {
      chrome.tabs.create({ url: 'https://klingri.github.io/VortexPro/' });
    };
    console.log("VortexPro: Settings listener attached.");
  } else {
    console.error("VortexPro: Button not found in DOM.");
  }
};

// This checks if the page is already loaded, otherwise waits for it
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', openWebsite);
} else {
  openWebsite();
}

// This checks if the page is already loaded, otherwise waits for it
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', openSettings);
} else {
  openSettings();
}