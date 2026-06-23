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

// Aggiungi questa funzione dentro ONLINE_LEADERBOARD, subito sotto a submitScore
    getLeaderboardData: async function() {
        const myToken = this._getOrCreateUserToken();
        // Ordiniamo la classifica dal punteggio più alto a quello più basso
        const url = `${this.SUPABASE_URL}/rest/v1/leaderboard?order=score.desc`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                }
            });

            if (!response.ok) return null;
            const allRecords = await response.json();

            let top10 = [];
            let currentUserRow = null;

            // Mappiamo tutti i record aggiungendo la posizione effettiva (Rank)
            allRecords.forEach((record, index) => {
                const playerRank = index + 1;
                const isMe = (record.user_token === myToken);

                const playerData = {
                    rank: playerRank,
                    username: record.username,
                    score: record.score,
                    isCurrentUser: isMe
                };

                // Se fa parte dei primi 10 lo inseriamo nella lista dei migliori
                if (playerRank <= 10) {
                    top10.push(playerData);
                }

                // Se questo record appartiene all'utente corrente, lo salviamo a parte
                if (isMe) {
                    currentUserRow = playerData;
                }
            });

            return {
                top10: top10,
                currentUserRow: currentUserRow
            };

        } catch (error) {
            console.error("Errore nel caricamento della classifica:", error);
            return null;
        }
    },