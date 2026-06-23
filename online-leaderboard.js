/**
 * WORDMAN - Modulo Classifica Mondiale (Supabase)
 */
const ONLINE_LEADERBOARD = {
    // Credenziali Supabase
    SUPABASE_URL: 'https://ezopsdhrggolwffbwknb.supabase.co',
    SUPABASE_KEY: 'sb_publishable_5h0aollwcdkBZr3XxN4qCw_n4npr9X0',

    /**
     * Salva un punteggio nel database
     */
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
            
            if (!response.ok) throw new Error('Errore nel salvataggio');
            return await response.json();
        } catch (error) {
            console.error("Impossibile salvare il record:", error);
            return null;
        }
    },

    /**
     * Recupera i primi 10 punteggi dalla classifica
     */
    getTopScores: async function() {
        // Query: seleziona tutto, ordina per score decrescente, limita a 10
        const url = `${this.SUPABASE_URL}/rest/v1/leaderboard?select=*&order=score.desc&limit=10`;
        try {
            const response = await fetch(url, {
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error("Impossibile recuperare la classifica:", error);
            return [];
        }
    }
};