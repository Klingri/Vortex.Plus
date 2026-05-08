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

// This checks if the page is already loaded, otherwise waits for it
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', openSettings);
} else {
  openSettings();
}