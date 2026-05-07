console.log("VORTEX+ DEBUG: Script starting...");

// This will turn the entire website background red for 1 second
// if the script is actually running.
document.body.style.border = "10px solid red";

function inject() {
    // We will try to find the navbar, but if we can't, 
    // we'll just put the button at the very top of the body.
    const navbar = document.querySelector('nav.navbar') || document.querySelector('.navbar');

    if (navbar && !document.getElementById('vplus-settings-nav')) {
        console.log("VORTEX+ DEBUG: Navbar found!");

        const settingsLink = document.createElement('a');
        settingsLink.id = 'vplus-settings-nav';
        settingsLink.innerText = '⚙️ V+ Settings';
        settingsLink.style.cssText = `
            color: #00ff00 !important;
            font-weight: bold;
            cursor: pointer;
            padding: 10px;
            z-index: 9999;
        `;

        navbar.appendChild(settingsLink);
    } else if (!navbar) {
        console.log("VORTEX+ DEBUG: Navbar NOT found yet...");
    }
}

// Run immediately and then every second
inject();
setInterval(inject, 1000);