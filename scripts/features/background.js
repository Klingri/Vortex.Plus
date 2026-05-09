async function checkVersion() {
    const GITHUB_MANIFEST_URL = 'https://raw.githubusercontent.com/Klingri/Vortex.Plus/main/manifest.json';
    
    try {
        const response = await fetch(GITHUB_MANIFEST_URL);
        const data = await response.json();
        const latestVersion = data.version;
        const currentVersion = chrome.runtime.getManifest().version;

        if (latestVersion !== currentVersion) {
            console.log(`Update available: ${latestVersion}`);
            // Option A: Change the badge text on the icon
            chrome.action.setBadgeText({ text: "NEW" });
            chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
            
            // Option B: Open your GitHub releases page automatically
            // chrome.tabs.create({ url: "https://github.com/YOUR_USER/YOUR_REPO/releases" });
        }
    } catch (error) {
        console.error("Failed to check for updates:", error);
    }
}

checkVersion();