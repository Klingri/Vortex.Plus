// Ported over VortexUltra 02/07/2026 Version 2.4 Pre-Alpha
function initVortexProfileTweaks() {
    // 1. Manage Developer Badges
    const usernameElement = document.querySelector('.profile-username');
    if (usernameElement) {
        // Use textContent for safety; trim to clean up spacing
        const username = usernameElement.textContent.trim();

        if (username === "Klingri") {
            const badge = document.createElement('span');
            badge.className = 'vortex-badge badge-dev';
            badge.textContent = 'Extension Creator';
            usernameElement.appendChild(badge);
        }
    }

    // 2. Format the Bio
    const bioText = document.getElementById('bio-text');
    if (bioText) {
        // Replace dashes with custom list items in a single regex operation
        bioText.innerHTML = bioText.innerHTML.replace(
            /^- (.*)/gm,
            '• <span style="color: #bbb;">$1</span>'
        );
    }

    // 3. Add Quick Actions
    const actionsRow = document.getElementById('profile-actions');
    if (actionsRow) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn-secondary';
        copyBtn.style.marginLeft = '5px';
        copyBtn.textContent = 'Copy Profile Link';

        // Save original text in a variable to avoid hardcoding twice
        const originalText = copyBtn.textContent;

        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(window.location.href);
                copyBtn.textContent = 'Copied!';
                setTimeout(() => copyBtn.textContent = originalText, 2000);
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        });

        actionsRow.appendChild(copyBtn);
    }
}

// Initialize all features once the page has finished parsing
document.addEventListener('DOMContentLoaded', initVortexProfileTweaks);
