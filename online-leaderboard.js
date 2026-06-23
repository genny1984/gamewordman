const ONLINE_LEADERBOARD = {
    SUPABASE_URL: 'https://ezopsdhrggolwffbwknb.supabase.co',
    SUPABASE_KEY: 'sb_publishable_5h0aollwcdkBZr3XxN4qCw_n4npr9X0',

    submitScore: async function(username, score) {
        const url = `${this.SUPABASE_URL}/rest/v1/leaderboard`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': this.SUPABASE_KEY,
                'Authorization': `Bearer ${this.SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ username: username, score: score })
        });
        return await response.json();
    },

    calculateRank: async function(myScore) {
        try {
            const url = `${this.SUPABASE_URL}/rest/v1/leaderboard?score=gt.${myScore}&select=count`;
            const response = await fetch(url, {
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`,
                    'Range-Unit': 'items'
                }
            });
            const data = await response.json();
            return (data.length > 0 ? data[0].count : 0) + 1;
        } catch (e) {
            return "--";
        }
    }
};