// popup.js - Optimized & Consolidated
const initPopup = () => {
  const settingsBtn = document.getElementById('open-settings');
  const websiteBtn = document.getElementById('open-website');

  // Attach Settings Listener
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      // Best practice for manifest v3 options pages
      chrome.runtime.openOptionsPage();
    });
  }

  // Attach Website Listener
  if (websiteBtn) {
    websiteBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://klingri.github.io/VortexPro/' });
    });
  }

  // Optional: Debugging log (can be removed for production)
  console.log("VortexPro: Popup listeners initialized.");
};

// Single listener for DOM content
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPopup);
} else {
  initPopup();
}