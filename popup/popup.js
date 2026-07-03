// popup.js - Optimized & Consolidated
const openOptions = () => chrome.runtime.openOptionsPage();
const openWebsite = () => chrome.tabs.create({ url: 'https://klingri.github.io/VortexPro/' });

document.addEventListener('DOMContentLoaded', () => {
  const settingsBtn = document.getElementById('open-settings');
  const websiteBtn = document.getElementById('open-website');

  // Attach listeners only if the elements exist
  settingsBtn?.addEventListener('click', openOptions);
  websiteBtn?.addEventListener('click', openWebsite);
});