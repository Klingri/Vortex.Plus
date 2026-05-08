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