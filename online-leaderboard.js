const ONLINE_LEADERBOARD = {
    SUPABASE_URL: 'https://ezopsdhrggolwffbwknb.supabase.co',
    SUPABASE_KEY: 'sb_publishable_5h0aollwcdkBZr3XxN4qCw_n4npr9X0',

    _getOrCreateUserToken: function() {
        let token = localStorage.getItem("user_token");
        if (!token) {
            token = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem("user_token", token);
        }
        return token;
    },

    submitScore: async function(username, score) {
        const url = `${this.SUPABASE_URL}/rest/v1/leaderboard`;
        const userToken = this._getOrCreateUserToken();
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({ username, score, user_token: userToken })
            });
            return response.ok ? await response.json() : null;
        } catch (e) { console.error(e); return null; }
    },

    getLeaderboardData: async function() {
        const myToken = this._getOrCreateUserToken();
        // Nota: Aggiungi ?order=score.desc per ordinare dal più alto al più basso
        const url = `${this.SUPABASE_URL}/rest/v1/leaderboard?order=score.desc`;
        try {
            const response = await fetch(url, {
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                }
            });
            if (!response.ok) throw new Error("Errore fetch Supabase");
            const allRecords = await response.json();
            
            let top10 = [];
            let currentUserRow = null;

            allRecords.forEach((record, index) => {
                const playerData = {
                    rank: index + 1,
                    username: record.username,
                    score: record.score,
                    isCurrentUser: (record.user_token === myToken)
                };
                if (playerData.rank <= 10) top10.push(playerData);
                if (playerData.isCurrentUser) currentUserRow = playerData;
            });

            return { top10, currentUserRow };
        } catch (e) {
            console.error("Errore caricamento classifica:", e);
            return null;
        }
    }
};

// Dentro ONLINE_LEADERBOARD, in online-leaderboard.js
getLeaderboardData: async function() {
    const url = `${this.SUPABASE_URL}/rest/v1/leaderboard?select=*&order=score.desc`;
    try {
        const response = await fetch(url, {
            headers: {
                'apikey': this.SUPABASE_KEY,
                'Authorization': `Bearer ${this.SUPABASE_KEY}`,
                'Range-Unit': 'items'
            }
        });

        if (!response.ok) {
            console.error("Errore HTTP:", response.status);
            return null;
        }

        const allRecords = await response.json();
        console.log("Record scaricati:", allRecords); // Controlla la console (F12)

        const myToken = this._getOrCreateUserToken();
        return {
            top10: allRecords.slice(0, 10).map((r, i) => ({
                rank: i + 1,
                username: r.username,
                score: r.score,
                isCurrentUser: (r.user_token === myToken)
            })),
            currentUserRow: allRecords.find(r => r.user_token === myToken)
        };
    } catch (e) {
        console.error("Errore critico:", e);
        return null;
    }
}