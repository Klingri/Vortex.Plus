(() => {
  const scriptURL = chrome.runtime.getURL('scripts/features/maploader.js');
  if (document.querySelector(`script[src="${scriptURL}"]`)) return;

  const script = document.createElement('script');
  script.src = scriptURL;
  script.defer = true;
  script.type = 'text/javascript';
  document.documentElement.appendChild(script);
})();
