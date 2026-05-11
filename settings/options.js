// List of IDs we want to track
const ids = ['toggle1', 'toggle2', 'toggle3', 'toggle4', 'toggle5'];

// Saves the state of all checkboxes
function saveOptions() {
    const settings = {};
    ids.forEach(id => {
        settings[id] = document.getElementById(id).checked;
    });

    chrome.storage.sync.set(settings, () => {
        console.log('Settings saved');
    });
}

// Restores the state of all checkboxes
function restoreOptions() {
    // Pass the ids array to get all values at once
    chrome.storage.sync.get(ids, (items) => {
        ids.forEach(id => {
            // If items[id] is undefined (first time run), default to false
            document.getElementById(id).checked = items[id] || false;
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    restoreOptions();

    // Add an event listener to every checkbox
    ids.forEach(id => {
        document.getElementById(id).addEventListener('change', saveOptions);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Handle toggle switches console logging (for testing)
    const toggles = document.querySelectorAll('input[type="checkbox"]');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const settingName = e.target.closest('.setting-item, .setting-group')
                                .querySelector('span, h3').innerText;
            console.log(`${settingName} is now ${e.target.checked ? 'Enabled' : 'Disabled'}`);
        });
    });

    // Simple search filter simulation
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const settings = document.querySelectorAll('.setting-item, .setting-group');
        
        settings.forEach(item => {
            const text = item.innerText.toLowerCase();
            item.style.display = text.includes(query) ? 'flex' : 'none';
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.settings-view');
    const breadcrumbSpan = document.querySelector('.breadcrumb span');

    // 1. Navigation Logic
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const target = link.getAttribute('data-target');

            // Update sidebar active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Switch content views
            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === `view-${target}`) {
                    view.classList.add('active');
                }
            });

            // Update Breadcrumb text
            if (breadcrumbSpan) {
                breadcrumbSpan.innerText = link.innerText;
            }
        });
    });

    // 2. Functional Toggles
    // Using event delegation for better performance
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const label = e.target.closest('.setting-item, .setting-group')?.querySelector('span, h3');
            if (label) {
                console.log(`[RoSeal] ${label.innerText.trim()}: ${e.target.checked}`);
            }
        }
    });

    // 3. Search Filter (Refined)
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        // Only search items within the currently visible view
        const activeView = document.querySelector('.settings-view.active');
        const items = activeView.querySelectorAll('.setting-item, .setting-group');
        
        items.forEach(item => {
            const text = item.innerText.toLowerCase();
            item.style.display = text.includes(query) ? 'flex' : 'none';
        });
    });
});