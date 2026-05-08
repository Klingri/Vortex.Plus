// Made by Slime King
(() => {
  const ext = chrome || browser;
  const scriptURL = ext.runtime.getURL('scripts/features/shaders.js');
  if (document.querySelector(`script[src="${scriptURL}"]`)) return;

  const script = document.createElement('script');
  script.src = scriptURL;
  script.defer = true;
  script.type = 'text/javascript';
  script.setAttribute('data-vortex-shader', 'true');
  document.documentElement.appendChild(script);
})();
