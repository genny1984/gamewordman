/**
 * WORDMAN - Modulo Classifica Mondiale Online
 */
const ONLINE_LEADERBOARD = {
    // URL della funzione serverless di Netlify (la creeremo tra poco)
    ENDPOINT: '/.netlify/functions/leaderboard',

    /**
     * Invia un punteggio al database mondiale e restituisce la posizione globale
     * @param {string} username - Il nome del giocatore
     * @param {number} score - Il punteggio totale della sessione
     * @returns {Promise<object>} - Contiene { rank: posizione, totalPlayers: totale }
     */
    submitScore: async function(username, score) {
        try {
            const response = await fetch(this.ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, score: score })
            });
            if (!response.ok) throw new Error('Errore di rete');
            return await response.json(); // Restituisce { rank: X, totalPlayers: Y }
        } catch (error) {
            console.error("Impossibile salvare il record online:", error);
            return null;
        }
    },

    /**
     * Recupera la posizione globale attuale di un determinato punteggio senza registrarlo
     */
    getGlobalRank: async function(score) {
        try {
            const response = await fetch(`${this.ENDPOINT}?score=${score}`);
            if (!response.ok) throw new Error('Errore di rete');
            return await response.json(); // Restituisce { rank: X, totalPlayers: Y }
        } catch (error) {
            console.error("Impossibile recuperare il rank online:", error);
            return null;
        }
    }
};