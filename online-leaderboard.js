/**
 * WORDMAN - Modulo Classifica Mondiale Online
 * Questo file definisce l'oggetto globale ONLINE_LEADERBOARD
 */
const ONLINE_LEADERBOARD = {
    // Il percorso punta alla funzione che hai pubblicato su Netlify
    ENDPOINT: '/.netlify/functions/leaderboard',

    /**
     * Invia un punteggio al database mondiale
     * @param {string} username - Il nome del giocatore
     * @param {number} score - Il punteggio totale
     */
    submitScore: async function(username, score) {
        try {
            const response = await fetch(this.ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, score: score })
            });
            if (!response.ok) throw new Error('Errore di rete');
            return await response.json(); 
        } catch (error) {
            console.error("Impossibile salvare il record online:", error);
            return null;
        }
    },

    /**
     * Recupera la posizione globale attuale
     */
    getGlobalRank: async function(score) {
        try {
            const response = await fetch(`${this.ENDPOINT}?score=${score}`);
            if (!response.ok) throw new Error('Errore di rete');
            return await response.json();
        } catch (error) {
            console.error("Impossibile recuperare il rank online:", error);
            return null;
        }
    }
};