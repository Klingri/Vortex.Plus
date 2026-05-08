(() => {
  const scriptURL = chrome.runtime.getURL('scripts/features/maploader.js');

  const checkAndInject = () => {
    // 1. Check if already injected
    if (document.querySelector(`script[src="${scriptURL}"]`)) return;

    // 2. Identify the game state: 
    // We check if the 'scene' div exists AND if we aren't on the main games list.
    const gameScene = document.getElementById('scene');
    const isGameURL = !window.location.pathname.startsWith('/games/');

    if (gameScene && isGameURL) {
      const script = document.createElement('script');
      script.src = scriptURL;
      script.defer = true;
      script.type = 'text/javascript';
      document.documentElement.appendChild(script);

      console.log("Vortex+: Game scene detected. Injecting Maploader.");

      // Once injected, we can stop the observer to save resources
      observer.disconnect();
    }
  };

  // Run immediately in case the page is already loaded
  checkAndInject();

  // Watch for the SPA transition (where the 'scene' div is injected dynamically)
  const observer = new MutationObserver((mutations) => {
    checkAndInject();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();