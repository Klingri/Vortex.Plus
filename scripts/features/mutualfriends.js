(async (targetUserId) => {
    try {
        const [myFriends, theirFriends] = await Promise.all([
            fetch('https://vortex.towerstats.com/api/friends').then(r => r.ok ? r.json() : []),
            fetch(`https://vortex.towerstats.com/api/friends/${targetUserId}`).then(r => r.ok ? r.json() : [])
            
        ]);

        const myFriendIds = new Set(myFriends.map(f => f.id));
        const theirFriendIds = new Set(theirFriends.map(f => f.id));

        const mutualFriends = theirFriends.filter(friend => myFriendIds.has(friend.id));

        return {
            count: mutualFriends.length,
            friends: mutualFriends,
            targetUserId: targetUserId
        };

    } catch (e) {
        console.error('Error getting mutual friends:', e);
        return { count: 0, friends: [], targetUserId };
    }
})();