// Created by Enk
(async function listUsersInfiniteScroll() {
    // Find the highest existing user ID dynamically
    async function userExists(id) {
        const res = await fetch(`/api/users/${id}`);
        return res.status !== 404;
    }

    async function findHighestUserId(max = 10000) {
        let low = 1, high = max, highest = 0;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (await userExists(mid)) {
                highest = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return highest;
    }

    const maxUserId = await findHighestUserId();

    const batchSize = 11;
    let currentId = 1;
    let loading = false;
    let oldestFirst = true;

    let container = document.getElementById('my-user-list-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'my-user-list-container';
        container.style.padding = '12px';
        container.style.background = 'rgb(27, 26, 26)';
        container.style.borderRadius = '6px';
        const resultsArea = document.getElementById('results-area');
        resultsArea.insertAdjacentElement('afterend', container);
    }
    container.innerHTML = '';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.marginBottom = '12px';
    header.style.gap = '6px';

    const input = document.createElement('input');
    input.type = 'number';
    input.placeholder = 'User ID';
    input.style.width = '80px';
    input.style.padding = '4px 6px';
    input.style.background = 'rgb(53,53,56)';
    input.style.color = 'white';
    input.style.border = '0';
    input.style.borderRadius = '4px';

    const searchBtn = document.createElement('button');
    searchBtn.textContent = 'Search';
    searchBtn.style.padding = '4px 6px';
    searchBtn.style.background = 'rgb(53,53,56)';
    searchBtn.style.color = 'white';
    searchBtn.style.border = '0';
    searchBtn.style.borderRadius = '4px';
    searchBtn.style.cursor = 'pointer';

    const upBtn = document.createElement('button');
    upBtn.textContent = '^';
    upBtn.style.padding = '4px 6px';
    upBtn.style.background = 'rgb(53,53,56)';
    upBtn.style.color = 'white';
    upBtn.style.border = '0';
    upBtn.style.borderRadius = '4px';
    upBtn.style.cursor = 'pointer';

    const downBtn = document.createElement('button');
    downBtn.textContent = 'v';
    downBtn.style.padding = '4px 6px';
    downBtn.style.background = 'rgb(53,53,56)';
    downBtn.style.color = 'white';
    downBtn.style.border = '0';
    downBtn.style.borderRadius = '4px';
    downBtn.style.cursor = 'pointer';

    header.appendChild(input);
    header.appendChild(searchBtn);
    header.appendChild(upBtn);
    header.appendChild(downBtn);
    container.appendChild(header);

    const list = document.createElement('div');
    list.className = 'user-list';
    container.appendChild(list);

    let friends = new Set();
    try {
        const meFriends = await fetch('/api/friends').then(r => r.ok ? r.json() : []);
        friends = new Set(meFriends.map(f => f.id));
    } catch { }

    function avatarColor(username) {
        const colors = ['rgb(8,145,178)', 'rgb(147,51,234)', 'rgb(217,119,6)', 'rgb(37,99,235)', 'rgb(26,26,26)'];
        return colors[username.charCodeAt(0) % colors.length];
    }

    function initial(username) {
        return username[0].toUpperCase();
    }

    function buildActions(user) {
        const wrap = document.createElement('div');
        wrap.className = 'user-row-actions';
        wrap.dataset.userId = user.id;
        wrap.dataset.status = friends.has(user.id) ? 'friends' : 'none';
        wrap.innerHTML = '';
        const status = wrap.dataset.status;
        if (status === 'friends') {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = 'Friends';
            wrap.appendChild(tag);
        } else if (status === 'none') {
            const btn = document.createElement('button');
            btn.className = 'btn-primary';
            btn.textContent = 'Add Friend';
            btn.onclick = async () => {
                btn.disabled = true;
                btn.textContent = '...';
                const res = await fetch(`/api/friends/request/${user.id}`, { method: 'POST' });
                const data = await res.json();
                if (data.result === 'accepted') {
                    friends.add(user.id);
                    wrap.innerHTML = '<span class="tag">Friends</span>';
                } else if (res.ok) {
                    btn.textContent = 'Requested';
                    btn.className = 'btn-secondary';
                } else {
                    btn.disabled = false;
                    btn.textContent = 'Add Friend';
                }
            };
            wrap.appendChild(btn);
        }
        return wrap;
    }

    async function fetchUser(id) {
        try {
            const res = await fetch(`/api/users/${id}`);
            if (!res.ok) return null;
            const user = await res.json();
            if (!user || !user.username) return null;
            return user;
        } catch { return null; }
    }

    async function loadBatch() {
        if (loading || (oldestFirst && currentId > maxUserId) || (!oldestFirst && currentId < 1)) return;
        loading = true;

        const batchEnd = oldestFirst ? Math.min(currentId + batchSize - 1, maxUserId) : Math.max(currentId - batchSize + 1, 1);
        const placeholders = [];

        for (let id = currentId; oldestFirst ? id <= batchEnd : id >= batchEnd; oldestFirst ? id++ : id--) {
            const row = document.createElement('div');
            row.className = 'user-row';
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.marginBottom = '6px';
            row.style.padding = '4px';
            row.style.borderRadius = '6px';
            row.style.background = 'rgb(37,37,37)';

            const idBox = document.createElement('div');
            idBox.textContent = `#${id}`;
            idBox.style.marginRight = '8px';
            idBox.style.color = '#aaa';
            row.appendChild(idBox);

            const avatar = document.createElement('div');
            avatar.style.width = '36px';
            avatar.style.height = '36px';
            avatar.style.borderRadius = '50%';
            avatar.style.marginRight = '8px';
            avatar.style.background = '#666';
            avatar.style.display = 'flex';
            avatar.style.alignItems = 'center';
            avatar.style.justifyContent = 'center';
            avatar.style.color = 'white';
            avatar.style.fontWeight = 'bold';
            row.appendChild(avatar);

            const name = document.createElement('div');
            name.style.flex = '1';
            name.style.color = 'white';
            name.style.fontWeight = '500';
            name.style.textDecoration = 'none';
            row.appendChild(name);

            const actions = document.createElement('div');
            actions.className = 'user-row-actions';
            row.appendChild(actions);

            list.appendChild(row);
            placeholders.push({ row, id, avatar, name, actions });
        }

        currentId = oldestFirst ? batchEnd + 1 : batchEnd - 1;
        const users = await Promise.all(placeholders.map(ph => fetchUser(ph.id)));

        for (let i = 0; i < placeholders.length; i++) {
            const ph = placeholders[i];
            const u = users[i];
            if (!u) continue;

            const avatarLink = document.createElement('a');
            avatarLink.href = `/users/${u.id}/profile`;
            avatarLink.textContent = initial(u.username);
            avatarLink.style.background = avatarColor(u.username);
            avatarLink.style.width = '36px';
            avatarLink.style.height = '36px';
            avatarLink.style.display = 'flex';
            avatarLink.style.alignItems = 'center';
            avatarLink.style.justifyContent = 'center';
            avatarLink.style.borderRadius = '50%';
            avatarLink.style.color = 'white';
            avatarLink.style.fontWeight = 'bold';
            avatarLink.style.marginRight = '8px';
            ph.row.replaceChild(avatarLink, ph.avatar);

            const nameLink = document.createElement('a');
            nameLink.href = `/users/${u.id}/profile`;
            nameLink.textContent = u.username;
            nameLink.style.color = 'white';
            nameLink.style.textDecoration = 'none';
            nameLink.style.fontWeight = '500';
            ph.row.replaceChild(nameLink, ph.name);

            const actions = buildActions(u);
            ph.row.replaceChild(actions, ph.actions);
        }

        loading = false;
    }

    function checkScroll() {
        if (loading) return;
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        if (scrollTop + windowHeight > docHeight - 300 || docHeight <= windowHeight) loadBatch();
    }

    window.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    setInterval(checkScroll, 200);

    searchBtn.onclick = () => {
        const id = parseInt(input.value);
        if (id > 0 && id <= maxUserId) {
            currentId = id;
            list.innerHTML = '';
            loadBatch();
        }
    };

    input.addEventListener('keypress', e => { if (e.key === 'Enter') searchBtn.click(); });
    upBtn.onclick = () => { oldestFirst = true; currentId = 1; list.innerHTML = ''; loadBatch(); };
    downBtn.onclick = () => { oldestFirst = false; currentId = maxUserId; list.innerHTML = ''; loadBatch(); };

    await loadBatch();
})();

function enhanceProfile() {
    // 1. Add a "Copy Username" button next to the name
    const usernameElement = document.querySelector('.profile-username');
    if (usernameElement && !document.getElementById('vortex-copy-btn')) {
        const copyBtn = document.createElement('button');
        copyBtn.id = 'vortex-copy-btn';
        copyBtn.className = 'vortex-copy-btn';
        copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
        copyBtn.title = 'Copy Username';
        
        copyBtn.onclick = () => {
            const name = usernameElement.innerText.trim();
            navigator.clipboard.writeText(name);
            copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #2ecc71;"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
            }, 2000);
        };
        usernameElement.appendChild(copyBtn);
    }

    // 2. Highlight high-visit profiles (e.g., over 1,000 visits)
    const visitValue = document.querySelector('.join-date-value');
    if (visitValue) {
        const count = parseInt(visitValue.textContent.replace(/,/g, ''));
        if (count > 1000) {
            visitValue.style.color = '#f1c40f'; // Gold color for popular users
            visitValue.style.fontWeight = 'bold';
        }
    }
}

// Since the site uses an async init() function to render the UI,
// we use a MutationObserver to wait for the content to actually appear.
const observer = new MutationObserver((mutations, obs) => {
    const profile = document.querySelector('.profile-username');
    if (profile) {
        enhanceProfile();
        // We don't disconnect because the user might navigate to other profiles
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// da

// Function to add features
async function enhanceVortex() {
    const page = document.querySelector('.page');
    const actions = document.getElementById('profile-actions');
    const usernameHeader = document.querySelector('.profile-username');
    
    if (!usernameHeader || document.getElementById('vortex-enhanced')) return;
    usernameHeader.id = 'vortex-enhanced';

    const userId = location.pathname.split('/')[2];

    // 1. ADD FRIEND NOTES (Saved to Chrome Storage)
    const bioBox = document.querySelector('.bio-box');
    if (bioBox) {
        const noteContainer = document.createElement('div');
        noteContainer.className = 'vortex-note-container';
        
        const noteLabel = document.createElement('div');
        noteLabel.className = 'bio-label';
        noteLabel.innerHTML = '<span>Private Note (Only you see this)</span>';
        
        const noteArea = document.createElement('textarea');
        noteArea.className = 'vortex-note-input';
        noteArea.placeholder = 'Add a private note about this player...';
        
        // Load existing note
        chrome.storage.local.get([`note_${userId}`], (res) => {
            if (res[`note_${userId}`]) noteArea.value = res[`note_${userId}`];
        });

        // Save note on type
        noteArea.addEventListener('input', (e) => {
            chrome.storage.local.set({ [`note_${userId}`]: e.target.value });
        });

        noteContainer.appendChild(noteLabel);
        noteContainer.appendChild(noteArea);
        bioBox.parentNode.insertBefore(noteContainer, bioBox.nextSibling);
    }

    // 2. QUICK SOCIAL LINKS
    if (actions) {
        const discordBtn = document.createElement('a');
        discordBtn.href = "https://discord.gg/ncNzKqeJrh";
        discordBtn.target = "_blank";
        discordBtn.className = 'btn-secondary';
        discordBtn.innerHTML = '<i class="fa-brands fa-discord"></i> Community Discord';
        discordBtn.style.marginLeft = '10px';
        actions.appendChild(discordBtn);
    }

    // 3. ENHANCED STATS CARDS
    const statLinks = document.querySelectorAll('.profile-stat');
    statLinks.forEach(link => {
        link.classList.add('vortex-stat-card');
    });

    // 4. COPY USERNAME BUTTON
    const copyBtn = document.createElement('button');
    copyBtn.className = 'vortex-copy-btn';
    copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
    copyBtn.onclick = () => {
        const name = usernameHeader.innerText.split('\n')[0].trim();
        navigator.clipboard.writeText(name);
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>', 2000);
    };
    usernameHeader.appendChild(copyBtn);
}

// Global Search Shortcut (Press '/' to search)
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
    }
});

// Run enhancement
const observer = new MutationObserver(() => enhanceVortex());
observer.observe(document.body, { childList: true, subtree: true });