// Ported over VortexGalactic 02/07/2026 Version 2.4 Pre-Alpha
// Made by Klingri
// Function to inject new features
function upgradeNavbar() {
    const actionsArea = document.querySelector('.navbar-actions');
    const navLogo = document.querySelector('.navbar-logo');

    if (!actionsArea || document.getElementById('vortex-plus-injected')) return;

    // Mark as injected
    const tracker = document.createElement('div');
    tracker.id = 'vortex-plus-injected';
    document.body.appendChild(tracker);
}

// Run when the page loads
upgradeNavbar();

// Also run if the page content updates (for SPAs)
const observer = new MutationObserver(upgradeNavbar);
observer.observe(document.body, { childList: true, subtree: true });