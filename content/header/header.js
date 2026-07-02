// Ported over VortexGalactic 02/07/2026 Version 2.4 Pre-Alpha
// Made by Klingri
// Function to inject new features
function upgradeNavbar() {
    const actionsArea = document.querySelector('.navbar-actions');
    const navLogo = document.querySelector('.navbar-logo');

    if (!actionsArea || document.getElementById('vortex-plus-injected')) return;

    // 1. Add a "Leaderboard" Quick Link
    const leaderboardBtn = document.createElement('a');
    leaderboardBtn.href = '/leaderboards';
    leaderboardBtn.className = 'custom-nav-btn';
    leaderboardBtn.innerText = 'Leaderboards';
    actionsArea.prepend(leaderboardBtn);

    // 2. Add a Theme Toggle (Dark/Light)
    const themeBtn = document.createElement('button');
    themeBtn.innerText = '🌙';
    themeBtn.className = 'btn-signout-sm';
    themeBtn.style.cursor = 'pointer';
    themeBtn.onclick = () => {
        document.body.classList.toggle('light-theme');
        themeBtn.innerText = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
    };
    actionsArea.appendChild(themeBtn);

    // 3. Add a pulse effect to the logo
    navLogo.style.fontWeight = 'bold';
    navLogo.style.color = '#00c3ff';

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