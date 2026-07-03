// Ported over VortexGalactic 02/07/2026 Version 2.4 Pre-Alpha
// Made by Klingri | Optimized by You
// Function to inject new features
function upgradeNavbar() {
    // 1. Target the exact elements we need
    const actionsArea = document.querySelector('.navbar-actions');
    const navLogo = document.querySelector('.navbar-logo');

    // 2. Safely exit if elements are missing or already injected
    if (!actionsArea || document.getElementById('vortex-plus-injected')) {
        return;
    }

    // 3. Mark as injected
    const tracker = document.createElement('div');
    tracker.id = 'vortex-plus-injected';
    tracker.style.display = 'none'; // Keeps the DOM clean
    document.body.appendChild(tracker);

    // 4. TODO: Add your custom features here

    // 5. Disconnect the observer once features have been successfully injected
    if (window.vortexObserver) {
        window.vortexObserver.disconnect();
    }
}

// Run when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', upgradeNavbar);
} else {
    upgradeNavbar();
}

// Run safely for SPAs, saving performance by targeting the exact parent (e.g., body)
const observerTarget = document.body;
const observerConfig = { childList: true, subtree: true };

window.vortexObserver = new MutationObserver(upgradeNavbar);
window.vortexObserver.observe(observerTarget, observerConfig);
