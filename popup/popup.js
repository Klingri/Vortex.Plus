// popup.js
const openSettings = () => {
  const settingsBtn = document.getElementById('open-settings');

  if (settingsBtn) {
    settingsBtn.onclick = () => {
      chrome.tabs.create({ url: 'settings/options.html' });
    };
    console.log("Vortex+: Settings listener attached.");
  } else {
    console.error("Vortex+: Button not found in DOM.");
  }
};

const openWebsite = () => {
  const websiteBtn = document.getElementById('open-website');

  if (websiteBtn) {
    websiteBtn.onclick = () => {
      chrome.tabs.create({ url: 'https://klingri.github.io/Vortex.Plus/' });
    };
    console.log("Vortex+: Settings listener attached.");
  } else {
    console.error("Vortex+: Button not found in DOM.");
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