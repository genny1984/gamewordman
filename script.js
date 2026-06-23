/**
 * WORDMAN - Script principale - Integrato con Supabase
 */

// ... (tutte le tue variabili iniziali restano invariate) ...

// --- INVIO RECORD SUPABASE ---
btnSubmitGlobal.addEventListener("click", async () => {
    const username = leaderboardUsername.value.trim().toUpperCase();
    if (!username) { alert("Inserisci un nome valido!"); return; }

    btnSubmitGlobal.innerText = "Invio...";
    btnSubmitGlobal.disabled = true;

    // 1. Inviamo il punteggio al database
    const saveResult = await ONLINE_LEADERBOARD.submitScore(username, totalScore);
    
    // 2. Se il salvataggio è andato a buon fine
    if (saveResult) {
        // Ricalcoliamo il rank basandoci sul punteggio appena inviato
        const nuovoRank = await ONLINE_LEADERBOARD.calculateRank(totalScore);
        
        // Aggiorniamo il messaggio per l'utente
        messageEl.innerText = `🌍 Record registrato! Sei in posizione #${nuovoRank} globale!`;
        
        // Aggiorniamo il tag in alto
        fetchGlobalRank(); 
    } else {
        messageEl.innerText = "❌ Errore durante il salvataggio online.";
    }

    // Reset UI
    globalSaveContainer.classList.add("hidden");
    restartBtn.classList.remove("hidden");
    btnSubmitGlobal.innerText = "Invia Record";
    btnSubmitGlobal.disabled = false;
    
    // Resetta il punteggio di sessione
    totalScore = 0;
    scoreEl.innerText = totalScore;
});

// Assicurati che fetchGlobalRank usi la funzione nel nuovo online-leaderboard.js
async function fetchGlobalRank() {
    const elementoRank = document.getElementById("global-rank-tag");
    if (!elementoRank) return;
    
    elementoRank.innerText = "Calcolo rank globale...";
    try {
        const rank = await ONLINE_LEADERBOARD.calculateRank(vsHighScore);
        elementoRank.innerText = `🌍 Rank Globale: #${rank}`;
    } catch (error) {
        elementoRank.innerText = "Rank non disponibile";
    }
}

// ... (resto del tuo codice originale) ...