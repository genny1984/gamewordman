const ONLINE_LEADERBOARD = {
    SUPABASE_URL: 'https://ezopsdhrggolwffbwknb.supabase.co',
    SUPABASE_KEY: 'sb_publishable_5h0aollwcdkBZr3XxN4qCw_n4npr9X0',

    submitScore: async function(username, score) {
        const url = `${this.SUPABASE_URL}/rest/v1/leaderboard`;
        try {
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

            // Se Supabase restituisce un errore (es. RLS o violazioni), response.ok sarà false
            if (!response.ok) {
                console.error("Errore Supabase durante l'inserimento:", await response.text());
                return null; 
            }

            return await response.json();
        } catch (error) {
            console.error("Errore di rete nell'invio:", error);
            return null;
        }
    },

    calculateRank: async function(myScore) {
        const url = `${this.SUPABASE_URL}/rest/v1/leaderboard?score=gt.${myScore}&select=count`;
        try {
            const response = await fetch(url, {
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`,
                    'Range-Unit': 'items'
                }
            });
            if (!response.ok) return 1;
            const data = await response.json();
            return (data.length > 0 ? data[0].count : 0) + 1;
        } catch (error) {
            return 1;
        }
    }
};