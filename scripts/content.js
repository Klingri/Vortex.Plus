// Created by Enk.
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

// Helper functions for profile enhancement
function el(tag, attrs = {}) {
    const element = document.createElement(tag);
    Object.assign(element, attrs);
    return element;
}

function statusDotHTML(status) {
    const colors = {
        'online': '#2ecc71',
        'idle': '#f39c12',
        'offline': '#7f8c8d'
    };
    const color = colors[status] || colors.offline;
    return `<div class="status-dot" style="background:${color};width:12px;height:12px;border-radius:50%;position:absolute;bottom:0;right:0;border:2px solid rgb(27, 26, 26);"></div>`;
}

function avatarColor(username) {
    const colors = ['rgb(8,145,178)', 'rgb(147,51,234)', 'rgb(217,119,6)', 'rgb(37,99,235)', 'rgb(26,26,26)'];
    return colors[username.charCodeAt(0) % colors.length];
}

function initial(username) {
    return username[0].toUpperCase();
}

function renderMutualFriends(friends) {
    const section = el('div', { className: 'section', id: 'vortex-mutual-friends-section' });

    const header = el('div', { className: 'section-header' });
    header.innerHTML = `<span class="section-title">Mutual Friends</span><span class="section-title" style="font-weight:400;font-size:0.85rem;color:#888;">${friends.length}</span>`;
    section.appendChild(header);

    const wrap = el('div', { className: 'carousel-wrap' });
    const row = el('div', { className: 'friends-row' });

    if (friends.length === 0) {
        row.innerHTML = '<span class="empty-msg">No mutual friends.</span>';
    } else {
        for (const f of friends) {
            const card = el('a', {
                className: 'friend-card',
                href: `/users/${f.id}/profile`
            });
            card.innerHTML = `
                    <div class="friend-avatar-wrap">
                        <div class="friend-avatar" style="background:${avatarColor(f.username)}">${initial(f.username)}</div>
                        ${statusDotHTML(f.online_status)}
                    </div>
                    <span class="friend-name">${f.username}</span>
                `;
            row.appendChild(card);
        }
    }

    wrap.appendChild(row);
    section.appendChild(wrap);
    if (typeof initCarousel === 'function') initCarousel(wrap);
    return section;
}

async function enhanceProfile() {
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

    // 3. Fetch and display mutual friends
    try {
        // Extract user ID from the current profile URL
        const urlMatch = window.location.pathname.match(/\/users\/(\d+)/);
        if (!urlMatch) return;

        const userId = urlMatch[1];
        const res = await fetch(`/api/users/${userId}/mutual-friends`);
        const mutualFriends = res.ok ? await res.json() : [];

        document.getElementById('vortex-mutual-friends-section')?.remove();
        const mutualSection = renderMutualFriends(mutualFriends);
        const friendHeader = Array.from(document.querySelectorAll('.section-header')).find(header => header.textContent.trim().startsWith('Friends'));
        if (friendHeader?.parentNode) {
            friendHeader.parentNode.insertAdjacentElement('afterend', mutualSection);
        } else {
            const friendsSection = document.querySelector('.section');
            if (friendsSection?.parentNode) {
                friendsSection.parentNode.insertBefore(mutualSection, friendsSection.nextSibling);
            } else {
                document.body.appendChild(mutualSection);
            }
        }
    } catch (err) {
        console.error('Error loading mutual friends:', err);
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

(function () {

    if (window.__vortexLoaded) return;
    window.__vortexLoaded = true;

    /* ── fonts ── */
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@500;700&display=swap";
    document.head.appendChild(link);
});
/* ── styles ── NOTE: NO body/html overrides so the host page bg is untouched ── */
var style = document.createElement("style");
style.textContent = `
    #vortex-gui {
      position: fixed;
      top: 50%;
      right: 24px;
      transform: translateY(-50%);
      z-index: 99999;
      width: 320px;
      border-radius: 14px;
      overflow: hidden;
      box-shadow:
        0 0 0 1px rgba(120,180,255,0.12),
        0 0 60px rgba(90,140,255,0.12),
        0 40px 100px rgba(0,0,0,0.85);
      transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1), visibility 0.3s;
      font-family: 'Rajdhani', sans-serif;
      visibility: visible;
    }
    #vortex-gui.v-hidden {
      opacity: 0;
      visibility: hidden;
      transform: translateY(-50%) scale(0.93) translateX(18px);
      pointer-events: none;
    }
    #space-canvas {
      position: absolute;
      top: 0; left: 0;
      display: block;
    }
    #gui-content {
      position: relative;
      z-index: 2;
      padding: 28px 26px 22px;
    }
    #v-close-btn {
      position: absolute;
      top: 10px; right: 10px;
      z-index: 10;
      width: 24px; height: 24px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(148,163,184,0.06);
      border: 1px solid rgba(148,163,184,0.18);
      border-radius: 4px;
      color: rgba(148,163,184,0.6);
      font-family: 'Orbitron', monospace;
      font-size: 0.62rem;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
      line-height: 1;
    }
    #v-close-btn:hover {
      background: rgba(125,211,252,0.12);
      border-color: rgba(125,211,252,0.4);
      color: #7dd3fc;
      box-shadow: 0 0 10px rgba(125,211,252,0.18);
    }

    /* ── toast hint shown after closing ── */
    #v-toast {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 100000;
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'Orbitron', monospace;
      font-size: 0.5rem;
      letter-spacing: 0.08em;
      color: #bae6fd;
      background: rgba(5, 8, 22, 0.94);
      border: 1px solid rgba(125,211,252,0.25);
      border-radius: 8px;
      padding: 10px 16px;
      box-shadow: 0 0 24px rgba(125,211,252,0.12), 0 8px 32px rgba(0,0,0,0.7);
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
      white-space: nowrap;
    }
    #v-toast.v-toast-show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
      cursor: pointer;
    }
    #v-toast .v-toast-key {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px; height: 18px;
      background: rgba(125,211,252,0.1);
      border: 1px solid rgba(125,211,252,0.35);
      border-radius: 3px;
      color: #7dd3fc;
      font-size: 0.55rem;
      flex-shrink: 0;
    }

    .v-title {
      font-family: 'Orbitron', monospace;
      font-size: clamp(1.5rem, 5vw, 2.1rem);
      font-weight: 900;
      letter-spacing: 0.16em;
      text-align: center;
      background: linear-gradient(105deg, #e0f2fe 0%, #93c5fd 22%, #c084fc 52%, #fbbf24 78%, #e0f2fe 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: vx-shimmer 5s linear infinite;
      display: block;
      line-height: 1;
      filter: drop-shadow(0 0 24px rgba(147,197,253,0.3));
      margin-bottom: 4px;
    }
    .v-subtitle {
      font-family: 'Orbitron', monospace;
      font-size: 0.42rem;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      color: rgba(148,163,184,0.4);
      text-align: center;
      margin-bottom: 20px;
    }
    .v-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(147,197,253,0.3), rgba(192,132,252,0.3), transparent);
      margin-bottom: 18px;
    }
    .v-section { margin-bottom: 16px; }
    .v-section-label {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 8px;
    }
    .v-section-label span {
      font-family: 'Orbitron', monospace;
      font-size: 0.42rem; font-weight: 700;
      letter-spacing: 0.3em; text-transform: uppercase;
      color: rgba(148,163,184,0.42); white-space: nowrap;
    }
    .v-line { flex: 1; height: 1px; background: rgba(148,163,184,0.1); }
    .v-badges { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
    .v-badge {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 6px 12px; border-radius: 5px;
      border: 1px solid rgba(125,211,252,0.16);
      background: rgba(125,211,252,0.05);
      cursor: default;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
                  box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
    }
    .v-badge:hover {
      transform: translateY(-2px) scale(1.05);
      border-color: rgba(125,211,252,0.55);
      background: rgba(125,211,252,0.12);
      box-shadow: 0 0 18px rgba(125,211,252,0.18), 0 6px 20px rgba(0,0,0,0.4);
    }
    .v-badge.owner { padding: 8px 16px; border-color: rgba(192,132,252,0.18); background: rgba(192,132,252,0.06); }
    .v-badge.owner:hover { border-color: rgba(192,132,252,0.55); background: rgba(192,132,252,0.14); box-shadow: 0 0 20px rgba(192,132,252,0.22), 0 6px 20px rgba(0,0,0,0.45); }
    .v-dot { width: 5px; height: 5px; border-radius: 50%; background: #7dd3fc; box-shadow: 0 0 5px #7dd3fc; flex-shrink: 0; }
    .v-badge.owner .v-dot { width: 6px; height: 6px; background: #c084fc; box-shadow: 0 0 6px #c084fc; animation: vx-pulse 2.5s ease-in-out infinite; }
    .v-name { font-family: 'Rajdhani', sans-serif; font-size: 0.85rem; font-weight: 600; color: #bae6fd; letter-spacing: 0.05em; }
    .v-badge.owner .v-name { font-size: 1rem; font-weight: 700; color: #ede9fe; }
    .v-owner-tag { font-family: 'Orbitron', monospace; font-size: 0.4rem; letter-spacing: 0.2em; text-transform: uppercase; color: #c084fc; background: rgba(192,132,252,0.14); border: 1px solid rgba(192,132,252,0.3); border-radius: 2px; padding: 1px 5px; }
    .v-footer { margin-top: 4px; padding-top: 14px; border-top: 1px solid rgba(148,163,184,0.08); text-align: center; }
    .v-footer p { font-size: 0.75rem; color: rgba(148,163,184,0.36); line-height: 1.7; margin-bottom: 10px; }
    .v-dc-btn {
      display: inline-flex; align-items: center; gap: 6px;
      font-family: 'Orbitron', monospace; font-size: 0.52rem; letter-spacing: 0.07em;
      color: #7dd3fc; background: rgba(125,211,252,0.06);
      border: 1px solid rgba(125,211,252,0.18); border-radius: 4px;
      padding: 5px 12px; cursor: pointer; outline: none; transition: all 0.25s;
    }
    .v-dc-btn:hover { background: rgba(125,211,252,0.12); border-color: rgba(125,211,252,0.4); box-shadow: 0 0 12px rgba(125,211,252,0.15); }
    .v-dc-btn.copied { color: #86efac; background: rgba(134,239,172,0.07); border-color: rgba(134,239,172,0.28); box-shadow: 0 0 12px rgba(134,239,172,0.14); }

    @keyframes vx-shimmer { 0% { background-position: 0% center } 100% { background-position: 200% center } }
    @keyframes vx-pulse { 0%,100% { box-shadow: 0 0 6px #c084fc, 0 0 12px #c084fc } 50% { box-shadow: 0 0 12px #c084fc, 0 0 28px rgba(192,132,252,0.55) } }
  `;

document.head.appendChild(style);

/* ── DOM ── */
var gui = document.createElement("div");
gui.id = "vortex-gui";

var closeBtn = document.createElement("div");
closeBtn.id = "v-close-btn";
closeBtn.title = "Close (press / to reopen)";
closeBtn.textContent = "/";
gui.appendChild(closeBtn);

var canvas = document.createElement("canvas");
canvas.id = "space-canvas";
gui.appendChild(canvas);

var content = document.createElement("div");
content.id = "gui-content";

var titleEl = document.createElement("span");
titleEl.className = "v-title";
titleEl.textContent = "VORTEX+";
content.appendChild(titleEl);

var subEl = document.createElement("p");
subEl.className = "v-subtitle";
subEl.textContent = "\u2736  credits & contributors  \u2736";
content.appendChild(subEl);

var divEl = document.createElement("div");
divEl.className = "v-divider";
content.appendChild(divEl);

function makeSection(label, names) {
    var sec = document.createElement("div");
    sec.className = "v-section";
    var lrow = document.createElement("div");
    lrow.className = "v-section-label";
    lrow.innerHTML = '<div class="v-line"></div><span>' + label + '</span><div class="v-line"></div>';
    sec.appendChild(lrow);
    var badges = document.createElement("div");
    badges.className = "v-badges";
    for (var i = 0; i < names.length; i++) {
        var item = names[i];
        var b = document.createElement("div");
        b.className = item.owner ? "v-badge owner" : "v-badge";
        var dot = document.createElement("span"); dot.className = "v-dot"; b.appendChild(dot);
        var nm = document.createElement("span"); nm.className = "v-name"; nm.textContent = item.name; b.appendChild(nm);
        if (item.owner) {
            var tag = document.createElement("span"); tag.className = "v-owner-tag"; tag.textContent = "owner"; b.appendChild(tag);
        }
        badges.appendChild(b);
    }
    sec.appendChild(badges);
    return sec;
}

content.appendChild(makeSection("Owner", [{ name: "Klingri", owner: true }]));
content.appendChild(makeSection("Non-Random", [{ name: "Idk" }]));
content.appendChild(makeSection("Randoms Trust!!", [
    { name: "enk" }, { name: "duck" }, { name: "pl1t" }, { name: "inuk" }
]));

var footer = document.createElement("div");
footer.className = "v-footer";
footer.innerHTML = "<p>if u helped and i didn't mention you<br>js message me on dc</p>";

var dcBtn = document.createElement("button");
dcBtn.className = "v-dc-btn";
dcBtn.innerHTML = "<span>\u2606</span> bjkbxbjdjdbkfkncskbej";
dcBtn.addEventListener("click", function () {
    if (navigator.clipboard) navigator.clipboard.writeText("bjkbxbjdjdbkfkncskbej").catch(function () { });
    dcBtn.className = "v-dc-btn copied";
    dcBtn.innerHTML = "<span>\u2713</span> copied!";
    setTimeout(function () {
        dcBtn.className = "v-dc-btn";
        dcBtn.innerHTML = "<span>\u2606</span> bjkbxbjdjdbkfkncskbej";
    }, 2200);
});
footer.appendChild(dcBtn);
content.appendChild(footer);
gui.appendChild(content);
document.body.appendChild(gui);

/* ── toast ── */
var toast = document.createElement("div");
toast.id = "v-toast";
toast.innerHTML = '<span class="v-toast-key">/</span> press <span class="v-toast-key">/</span> to reopen VORTEX+';
toast.title = "Click to reopen";
document.body.appendChild(toast);

var toastTimer = null;
function showToast() {
    toast.classList.add("v-toast-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 4000);
}
function hideToast() {
    toast.classList.remove("v-toast-show");
}

/* ── toggle via / key or close btn ── */
function closePanel() {
    gui.classList.add("v-hidden");
    showToast();
}
function openPanel() {
    gui.classList.remove("v-hidden");
    hideToast();
}

closeBtn.addEventListener("click", closePanel);
toast.addEventListener("click", openPanel);

document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        if (gui.classList.contains("v-hidden")) {
            openPanel();
        } else {
            closePanel();
        }
    }
});

/* ── canvas animation ── */
var c = canvas.getContext("2d");
function rng(a, b) { return Math.random() * (b - a) + a; }
var W = 0, H = 0, tick = 0;
var stars = [], nebulas = [], meteors = [];
var animRunning = false;

function spawnMeteor(df) {
    return { x: rng(W * 0.05, W * 0.95), y: rng(-60, H * 0.3), len: rng(60, 140), spd: rng(6, 14), alpha: rng(0.5, 1), ang: rng(0.38, 0.62), prog: -(df || 0), life: rng(80, 160) };
}

function buildScene(w, h) {
    W = w; H = h; stars = []; nebulas = []; meteors = [];
    var counts = [40, 80, 120], sizes = [0.5, 0.9, 1.4], alphas = [0.38, 0.55, 0.82];
    for (var li = 0; li < 3; li++) for (var i = 0; i < counts[li]; i++)
        stars.push({ x: rng(0, W), y: rng(0, H), r: sizes[li] + rng(0, 0.25), tw: rng(0, Math.PI * 2), ts: rng(0.004, 0.018), a: alphas[li] });
    nebulas = [
        { x: W * 0.15, y: H * 0.20, rx: W * 0.45, ry: H * 0.35, rgb: "55,0,130", a: 0.18 },
        { x: W * 0.82, y: H * 0.72, rx: W * 0.40, ry: H * 0.38, rgb: "0,60,160", a: 0.15 },
        { x: W * 0.50, y: H * 0.50, rx: W * 0.55, ry: H * 0.45, rgb: "80,10,140", a: 0.10 },
        { x: W * 0.88, y: H * 0.10, rx: W * 0.30, ry: H * 0.28, rgb: "140,40,0", a: 0.11 },
        { x: W * 0.20, y: H * 0.88, rx: W * 0.32, ry: H * 0.26, rgb: "0,100,90", a: 0.09 }
    ];
    for (var m = 0; m < 4; m++) meteors.push(spawnMeteor(m * 110 + rng(0, 60)));
}

function syncSize() {
    var w = gui.offsetWidth, h = gui.offsetHeight;
    if (!w || !h) return false;
    if (canvas.width === w && canvas.height === h) return true;
    canvas.width = w; canvas.height = h;
    buildScene(w, h);
    return true;
}

function drawFrame() {
    if (!W || !H) { syncSize(); requestAnimationFrame(drawFrame); return; }
    tick++;
    c.clearRect(0, 0, W, H);
    c.fillStyle = "#02040f"; c.fillRect(0, 0, W, H);

    var bg = c.createRadialGradient(W * 0.3, H * 0.25, 0, W * 0.5, H * 0.5, W * 0.9);
    bg.addColorStop(0, "rgba(10,4,40,0.75)"); bg.addColorStop(0.5, "rgba(4,8,28,0.5)"); bg.addColorStop(1, "rgba(0,0,8,0)");
    c.fillStyle = bg; c.fillRect(0, 0, W, H);

    for (var ni = 0; ni < nebulas.length; ni++) {
        var n = nebulas[ni], pulse = 0.82 + 0.18 * Math.sin(tick * 0.003 + n.x * 0.01), maxR = Math.max(n.rx, n.ry);
        c.save(); c.translate(n.x, n.y);
        var g = c.createRadialGradient(0, 0, 0, 0, 0, maxR);
        g.addColorStop(0, "rgba(" + n.rgb + "," + (n.a * pulse) + ")");
        g.addColorStop(0.45, "rgba(" + n.rgb + "," + (n.a * pulse * 0.3) + ")");
        g.addColorStop(1, "rgba(" + n.rgb + ",0)");
        c.scale(n.rx / maxR, n.ry / maxR); c.beginPath(); c.arc(0, 0, maxR, 0, Math.PI * 2); c.fillStyle = g; c.fill(); c.restore();
    }

    for (var si = 0; si < stars.length; si++) {
        var s = stars[si], tw = 0.5 + 0.5 * Math.sin(tick * s.ts + s.tw), a = s.a * (0.55 + 0.45 * tw);
        if (s.r > 1.1) {
            var sg = c.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
            sg.addColorStop(0, "rgba(210,225,255," + (a * 0.3) + ")"); sg.addColorStop(1, "rgba(0,0,0,0)");
            c.beginPath(); c.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2); c.fillStyle = sg; c.fill();
        }
        c.beginPath(); c.arc(s.x, s.y, s.r, 0, Math.PI * 2); c.fillStyle = "rgba(215,228,255," + a + ")"; c.fill();
    }

    for (var mi = 0; mi < meteors.length; mi++) {
        var m = meteors[mi]; m.prog++;
        if (m.prog < 0) continue;
        if (m.prog > m.life) { meteors[mi] = spawnMeteor(rng(180, 480)); continue; }
        var pct = m.prog / m.life, fade = pct < 0.12 ? pct / 0.12 : pct > 0.72 ? 1 - (pct - 0.72) / 0.28 : 1;
        var hx = m.x + Math.cos(m.ang) * m.spd * m.prog, hy = m.y + Math.sin(m.ang) * m.spd * m.prog;
        var tx = hx - Math.cos(m.ang) * m.len, ty = hy - Math.sin(m.ang) * m.len;
        var tr = c.createLinearGradient(tx, ty, hx, hy);
        tr.addColorStop(0, "rgba(180,210,255,0)");
        tr.addColorStop(0.55, "rgba(200,220,255," + (0.1 * fade * m.alpha) + ")");
        tr.addColorStop(1, "rgba(255,255,255," + (0.9 * fade * m.alpha) + ")");
        c.beginPath(); c.moveTo(tx, ty); c.lineTo(hx, hy); c.strokeStyle = tr; c.lineWidth = 1.5; c.stroke();
        c.beginPath(); c.arc(hx, hy, 1.6, 0, Math.PI * 2); c.fillStyle = "rgba(255,255,255," + (0.95 * fade * m.alpha) + ")"; c.fill();
        var hg = c.createRadialGradient(hx, hy, 0, hx, hy, 6);
        hg.addColorStop(0, "rgba(220,235,255," + (0.35 * fade * m.alpha) + ")"); hg.addColorStop(1, "rgba(0,0,0,0)");
        c.beginPath(); c.arc(hx, hy, 6, 0, Math.PI * 2); c.fillStyle = hg; c.fill();
    }

    var eg = c.createLinearGradient(0, 0, 0, H);
    eg.addColorStop(0, "rgba(125,211,252,0.05)"); eg.addColorStop(0.5, "rgba(0,0,0,0)"); eg.addColorStop(1, "rgba(192,132,252,0.04)");
    c.fillStyle = eg; c.fillRect(0, 0, W, H);

    requestAnimationFrame(drawFrame);
}

function init() {
    if (syncSize()) {
        if (!animRunning) { animRunning = true; drawFrame(); }
    } else {
        setTimeout(init, 30);
    }
}

if (window.ResizeObserver) new ResizeObserver(function () { syncSize(); }).observe(gui);

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 0); });
} else {
    setTimeout(init, 0);
}

chrome.tabs.create({ url: chrome.runtime.getURL("thankyou.html") });

function changeFavicon(src) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = src;
}

// Run once on load
changeFavicon('icons/icon32.png');

// Find the element with the class 'navbar-logo'
const logoLink = document.querySelector('.navbar-logo');

// Check if it exists to avoid errors, then change the text
if (logoLink) {
  logoLink.textContent = 'New Brand Name';
}

const cursorUrl = chrome.runtime.getURL('cursorpack/Normal Select.png'); // Convert to PNG first!
document.body.style.cursor = `url('${cursorUrl}'), auto`;