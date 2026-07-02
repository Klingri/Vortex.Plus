// Ported over VortexUltra 02/07/2026 Version 2.4 Pre-Alpha
// Function to add a Developer badge to specific users
function addBadges() {
    const usernameElement = document.querySelector('.profile-username');
    if (!usernameElement) return;

    const username = usernameElement.innerText.trim();

    // Feature: Add Dev badge to Klingri (based on your HTML snippet)
    if (username === "Klingri") {
        const badge = document.createElement('span');
        badge.className = 'vortex-badge badge-dev';
        badge.innerText = 'Extension Creator';
        usernameElement.appendChild(badge);
    }
}

// Feature: Format the Bio (turning dashes into styled list items)
function formatBio() {
    const bioText = document.getElementById('bio-text');
    if (bioText) {
        let content = bioText.innerHTML;
        // Simple regex to make lines starting with - look better
        content = content.replace(/^- (.*)/gm, '• <span style="color: #bbb;">$1</span>');
        bioText.innerHTML = content;
    }
}

// Feature: Quick Actions
function addQuickActions() {
    const actionsRow = document.getElementById('profile-actions');
    if (actionsRow) {
        const copyIdBtn = document.createElement('button');
        copyIdBtn.className = 'btn-secondary';
        copyIdBtn.style.marginLeft = '5px';
        copyIdBtn.innerText = 'Copy Profile Link';
        copyIdBtn.onclick = () => {
            navigator.clipboard.writeText(window.location.href);
            copyIdBtn.innerText = 'Copied!';
            setTimeout(() => copyIdBtn.innerText = 'Copy Profile Link', 2000);
        };
        actionsRow.appendChild(copyIdBtn);
    }
}

// Run functions
addBadges();
formatBio();
addQuickActions();