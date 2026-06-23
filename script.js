const MAX_ATTEMPTS = 6;
let WORD_LENGTH = 5;

let totalScore = 0;
let streakCount = 0;
let isGameOverState = false;
let gameActive = false;

const urlParams = new URLSearchParams(window.location.search);
let isTimerMode = urlParams.get('mode') === 'timer';

let SECRET_WORD = "";
let currentAttemptPlayer = 0;
let currentTilePlayer = 0;
let isDebugMode = false;

let timerInterval = null;
let timeLeft = 60;
const MAX_TIME = 60;

const gameContainer = document.getElementById("game-container");
const boardPlayer = document.getElementById("game-board");
const messageEl = document.getElementById("message");
const restartBtn = document.getElementById("restart-btn");
const timerText = document.getElementById("timer-text");
const timerBar = document.getElementById("timer-bar");
const scoreEl = document.getElementById("current-score");
const streakEl = document.getElementById("current-streak");
const highScoreEl = document.getElementById("high-score");
const mobileInput = document.getElementById("mobile-keyboard-trigger");
const btnEasy = document.getElementById("btn-easy");
const btnHard = document.getElementById("btn-hard");
const btnStart = document.getElementById("start-session-btn");
const btnModeClassic = document.getElementById("btn-mode-classic");
const btnModeTimer = document.getElementById("btn-mode-timer");

const canvasPlayer = document.getElementById("hangman");
const ctxPlayer = canvasPlayer.getContext("2d");

// Elementi classifica mondiale
const globalRankTag = document.getElementById("global-rank-tag");
const globalSaveContainer = document.getElementById("global-save-container");
const leaderboardUsername = document.getElementById("leaderboard-username");
const btnSubmitGlobal = document.getElementById("btn-submit-global");

const EASY_WORDS = ["TRENO", "GATTO", "PIZZA", "CORSA", "FUOCO", "MONDO", "TASTO", "LIBRO", "VERDE", "FIORE", "ACQUA", "AMICO", "ANIMA", "AEREO", "BARCA", "BOCCA", "BRAVO", "CAFFE", "CANTO", "CAPRA", "CARTA", "CERVO", "CIELO", "CLIMA", "COLPO", "COSTA", "CUORE", "DENTE", "DISCO", "DOLCE", "BANCO", "BARBA", "BASTA", "BENE", "BONUS", "BORSA", "BOZZA", "BUSTO", "CALDO", "CAMPO", "CARNE", "CASSA", "CENA", "CERTO", "CHILO", "CINTA", "CODA", "COLLO", "CONTO", "CORPO", "COSA", "CREMA", "CRISI", "CUOCO", "DANNO", "DONNA", "DOPO", "DRAMMA", "ERBA", "ESAME", "FALCO", "FATTO", "FILM", "FILO", "FIUME", "FOLLE", "FORMA", "FORNO", "FORTE", "FORZA", "FUMO", "FUNE", "GAMBA", "GIOCO", "GIOIA", "GIRO", "GONNA", "GRANO", "GRAVE", "GRIDO", "GUIDA", "GUSTO", "IDEA", "ISOLA", "LANCI", "LATTE", "LATO", "LEGNO", "LENTE", "LEONE", "LEGGE", "LINEA", "LUCE", "LUNA", "LUNGO", "LUSSO", "MADRE", "MAGO", "MANO", "MARE", "MASSA", "MATTO", "MENTE", "MESE", "METRO", "MIELE", "MIRA", "MITO", "MODA", "MODO", "NOME", "NATTU", "NODO", "NAVE", "NOTTE", "ONDA", "ORSO", "PACCO", "PADRE", "PAESE", "PANE", "PARCO", "PARTE", "PASSO", "PASTA", "PAURA", "PELLE", "PENA", "PENNA", "PESCE", "PESO", "PETTO", "PIANO", "PIEDE", "PINO", "PINZA", "PIUMA", "POETA", "POLLO", "POLPO", "POMPA", "PONTE", "PORTA", "POSTO", "PRATO", "PRIMA", "PRIMO", "PROVA", "PUNTA", "PUNTO", "QUALE", "QUOTA", "RADIO", "RAMO", "RAZZA", "REGNO", "RESTA", "RICCO", "RISO", "RITMO", "ROMA", "ROSA", "RUOTA", "RUOLO", "SACCO", "SALE", "SALTO", "SOLE", "SONNO", "SOPRA", "SORDO", "SOSTA", "SPADA", "SPIA", "SPINA", "SPOSA", "SUCCO", "SUOLO", "SUONO", "SUPER", "TANA", "TAPPO", "TASCA", "TEMA", "TESTA", "TESTO", "TIGRE", "TIPO", "TOCCO", "TOPO", "TUTTO", "UMANO", "UMORE", "UNICO", "UOMO", "UOVO", "URLO", "USATO", "VALLE", "VASCA", "VELO", "VINO", "VIOLA", "VISTA", "VITA", "VOCE", "VOLO", "VOLPE", "VOLTO", "VUOTO", "ZAINO", "ZAMPA", "ZUPPA"];
const HARD_WORDS = ["ALBERO", "BRUCO", "PADRE", "CHIAVE", "STRADA", "PIANTO", "PORTAI", "STADIO", "TEATRO", "TAVOLO", "QUADRO", "PRANZO", "SPUGNA", "SANGUE", "SOGNO", "STORIA", "VESTITO", "VIAGGIO", "SGUARDO", "SCUOLA", "ACCIAIO", "ACERBO", "AZIONE", "BAMBINO", "BANANA", "BARILE", "BARONE", "BLOCCO", "BREZZA", "BRIVIDO", "BRONZO", "CABINA", "CADUTA", "CALICE", "CAMINO", "CAMICE", "CAMMELLO", "CANALE", "CANDELA", "CANILE", "CATENA", "CAVALLO", "CELERE", "CENERE", "CERCHIO", "CERVO", "CESTO", "CHITARRA", "CIAMBILLA", "CICALA", "CILIEGIA", "CIMITERO", "CINEMA", "CINTURA", "CIOCCOLATO", "CIPRESSO", "CITTADINO", "CLASSE", "COLORE", "COMETA", "COMODO", "COMUNE", "CONIGLIO", "CONTADINO", "CORONA", "CORTILE", "CUGINO", "CULTURA", "CUSCINO", "DECORO", "DELFINO", "DESTRO", "DIARIO", "DISEGNO", "DIVANO", "DOCCIA", "DOPPIO", "DOVERE", "EDITORE", "EFFETTO", "ELENCO", "ENERGIA", "ERRORE", "ESTATE", "FALCONE", "FANGO", "FARFALLA", "FASCIA", "FAVORE", "FEBBRE", "FERRO", "FIAMMA", "FIANCO", "FIDUCIA", "FIGLIO", "FINALE", "FINESTRA", "FIOCCHIO", "FLAUTO", "FOCACCIA", "FOGLIA", "FORESTA", "FORTEZZA", "FRECCIA", "FREDDO", "FRESCO", "FRONTE", "FRUTTO", "FUCILE", "FUTURO", "GABBIA", "GAMBERO", "GARAGE", "GELATO", "GENTILE", "GESTATO", "GIACCA", "GIARDINO", "GIORNO", "GIOVANE", "GIRAFFA", "GIUDICE", "GLORIA", "GOMITO", "GONNA", "GRADINO", "GRAFFIO", "GRANDE", "GRASSO", "GRATIS", "GRAZIA", "GRIGIO", "GRUPPO", "GUANTO", "GUERRA", "GUSCIO", "IMPERO", "INVERNO", "INVIDIA", "IRONIA", "ISTANTE", "ITALIA", "LABBRO", "LADRO", "LAMPADA", "LANCIA", "LAVORO", "LEGUME", "LETTERA", "LEZIONE", "LIBERO", "LINGUA", "LIQUIDO", "LIVELLO", "LOCALE", "LODARE", "LONTANO", "LUCIDO", "LUGIO", "LUSSO", "MAESTRO", "MAGGIO", "MAGLIA", "MALATO", "MANICA", "MANTO", "MAPPA", "MARCIA", "MARINA", "MATITA", "MEDICO", "METODO", "MINUTO", "MISURA", "MODELLO", "MODERNO", "MONETA", "MOTORE", "MOSTRA", "MULINO", "MUSICA", "NATURA", "NEBBIA", "NEGOZIO", "NIPOTE", "NONNO", "NOTIZIA", "NUVOLA", "ONESTO", "OPERA", "ORARIO", "ORECCHIO", "ORGOGLIO", "ORIGINE", "OROLOGIO", "OSCURO", "OSPEDALE", "OTTIMO", "PAGINA", "PALAZZO", "PALUDE", "PANINO", "PAPERA", "PAROLA", "PASSATO", "PATATA", "PAURA", "PECORA", "PELO", "PENSIERO", "PERICOLO", "PERLA", "PESCATORE", "PIANETA", "PIANTO", "PIAZZA", "PICCOLO", "PIETRA", "PILOTA", "PITTORE", "PIOGGIA", "POESIA", "POLIZIA", "POLMONE", "POPOLO", "POSTA", "POTERE", "POVERO", "PRANZO", "PRATO", "PREZZO", "PRIMAVERA", "PULITO", "QUADRO", "RABBIA", "RAGAZZO", "RAGNO", "RAPIDO", "REGOLA", "REGINA", "RICCHEZZA", "RICORDO", "RIFUGIO", "RIPOSO", "RITORNO", "RIVALE", "ROCCIA", "SABATO", "SABBIA", "SACCHETTO", "SALUTE", "SANGUE", "SAPONE", "SARDA", "SBALZO", "SCALCO", "SCARPA", "SCATOLA", "SCHERMO", "SCHERZO", "SCHIENA", "SCIENZA", "SCOGLIO", "SCOPA", "SCRITTOR", "SCUDO", "SCUOLA", "SECOLO", "SEGRETO", "SEGNALE", "SEMINA", "SENTIERO", "SERPENTE", "SERVIZIO", "SFIDA", "SFONDO", "SGUARDO", "SICURO", "SIGNRE", "SILENZIO", "SIMBOLO", "SINDCO", "SISTEMA", "SOCIETA", "SOGNO", "SOLDATO", "SOLE", "SPADA", "SPAZIO", "SPECCHIO", "SPETTACOLO", "SPIAGGIA", "SPIRITO", "SPONDA", "SPOSA", "SQUADRA", "STADIO", "STAGIONE", "STAMPA", "STANZA", "STATUA", "STELLA", "STIVALE", "STORIA", "STRADA", "STRANO", "STUDIO", "STUFO", "SUCCESSO", "SUDORE", "SUOLO", "SUONO", "SUPER", "TAPPETO", "TARTUFO", "TAVOLO", "TEATRO", "TECNICA", "TEMPO", "TEMPESTA", "TENDA", "TENORE", "TERRA", "TERRORE", "TESORO", "TESTA", "TIGRE", "TIMORE", "TITOLO", "TOVAGLIA", "TRAFFICO", "TRAGUARDO", "TRENO", "TRONO", "TUTTO", "UCCELLO", "UFFICIO", "ULTIMO", "UMANO", "UMILE", "UNGHIA", "UNICO", "UNIONE", "URGENTE", "USANZA", "USCITA", "UTILE", "VALIGIA", "VALLE", "VALORE", "VAPORE", "VEICOLO", "VELOCE", "VENEZIA", "VENTO", "VERDE", "VERGOGNA", "VERITA", "VERME", "VESTITO", "VETRO", "VIAGGIO", "VIETATO", "VIGILE", "VILLA", "VINCITORE", "VINO", "VIOLA", "VISITA", "VITA", "VIVACE", "VOLANTE", "VOLPE", "ZAINO", "ZAMPA", "ZATTERA", "ZEBRA", "ZIO", "ZOCCOLO", "ZOO", "ZUCCHERO", "ZUPPA"];

btnModeClassic.addEventListener("click", () => { location.href = "index.html"; });
btnModeTimer.addEventListener("click", () => { location.href = "index.html?mode=timer"; });

if (isTimerMode) {
    btnModeTimer.classList.add('active');
    btnModeClassic.classList.remove('active');
    document.getElementById('game-desc').innerHTML = "Indovina la parola in <strong>6 tentativi</strong> prima dello scadere del tempo! Ricevi punti per le lettere corrette, per la velocità e per i tentativi rimasti.";
} else {
    btnModeClassic.classList.add('active');
    btnModeTimer.classList.remove('active');
    timerText.innerText = "Modalità Classica";
    if(timerBar) timerBar.style.width = "100%";
}

let vsHighScore = localStorage.getItem("wordman_high_score") || 0;
highScoreEl.innerText = vsHighScore;

// Controllo iniziale della posizione del record locale nel mondo
async function fetchGlobalRank() {
    if (vsHighScore > 0 && typeof ONLINE_LEADERBOARD !== "undefined") {
        globalRankTag.innerText = "Calcolo rank globale...";
        const data = await ONLINE_LEADERBOARD.getGlobalRank(vsHighScore);
        if (data) {
            globalRankTag.innerText = `🌍 Posizione Globale: #${data.rank} di ${data.totalPlayers}`;
        } else {
            globalRankTag.innerText = "";
        }
    }
}
fetchGlobalRank();

btnEasy.addEventListener("click", () => { if (gameActive) return; WORD_LENGTH = 5; btnEasy.classList.add("active"); btnHard.classList.remove("active"); });
btnHard.addEventListener("click", () => { if (gameActive) return; WORD_LENGTH = 6; btnHard.classList.add("active"); btnEasy.classList.remove("active"); });

btnStart.addEventListener("click", () => { startGameSession(); });

function startGameSession() {
    document.getElementById("difficulty-container").classList.add("hidden");
    gameContainer.classList.remove("hidden");
    gameActive = true;
    initRound();
    setTimeout(focusMobileInput, 200);
}

function initRound() {
    isGameOverState = false;
    currentAttemptPlayer = 0;
    currentTilePlayer = 0;
    messageEl.innerText = "";
    restartBtn.classList.add("hidden");
    globalSaveContainer.classList.add("hidden");

    if (isTimerMode) {
        clearInterval(timerInterval);
        timeLeft = MAX_TIME;
        updateTimerUI();
        startTimer();
    }

    const pool = (WORD_LENGTH === 5) ? EASY_WORDS : HARD_WORDS;
    let selectedWord = "";
    let safetyCounter = 0;
    while (selectedWord.length !== WORD_LENGTH && safetyCounter < 500) {
        selectedWord = pool[Math.floor(Math.random() * pool.length)].toUpperCase().trim();
        safetyCounter++;
    }
    SECRET_WORD = selectedWord;

    updateDebugVisibility();
    createGrid(boardPlayer, "p");
    ctxPlayer.clearRect(0, 0, canvasPlayer.width, canvasPlayer.height);
    if (mobileInput) mobileInput.value = "";
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (isGameOverState || !gameActive) { clearInterval(timerInterval); return; }
        timeLeft--;
        updateTimerUI();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame(false, `⏰ Tempo Scaduto! La parola era: ${SECRET_WORD}`);
        }
    }, 1000);
}

function updateTimerUI() {
    if (!isTimerMode) return;
    timerText.innerText = timeLeft + "s";
    const percentage = (timeLeft / MAX_TIME) * 100;
    if (timerBar) timerBar.style.width = percentage + "%";
}

function updateDebugVisibility() {
    if (isDebugMode && gameActive && !isGameOverState) {
        timerText.innerHTML = `🛠️ DEBUG: <span style="color: #ff9f43; letter-spacing: 2px; font-weight: bold;">${SECRET_WORD}</span>`;
    } else if (gameActive && !isGameOverState && !isTimerMode) {
        timerText.innerText = "Modalità Classica";
    }
}

function createGrid(board, prefix) {
    board.innerHTML = "";
    board.style.setProperty('--cols', WORD_LENGTH);
    for (let i = 0; i < MAX_ATTEMPTS * WORD_LENGTH; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.id = `${prefix}-${Math.floor(i / WORD_LENGTH)}-${i % WORD_LENGTH}`;
        board.appendChild(tile);
    }
}

function focusMobileInput() {
    if (mobileInput && gameActive && !isGameOverState) mobileInput.focus();
}

document.addEventListener("click", (e) => {
    if (gameContainer.contains(e.target) && e.target !== restartBtn && e.target !== btnSubmitGlobal && e.target !== leaderboardUsername) focusMobileInput();
});

if (mobileInput) {
    mobileInput.addEventListener("input", (e) => {
        if (!gameActive || isGameOverState) { mobileInput.value = ""; return; }
        const data = e.data;
        if (!data) return;
        const keyUpper = data.toUpperCase();
        if (/^[A-Z]$/.test(keyUpper)) {
            if (currentTilePlayer < WORD_LENGTH) {
                const tile = document.getElementById(`p-${currentAttemptPlayer}-${currentTilePlayer}`);
                if (tile) { tile.innerText = keyUpper; currentTilePlayer++; }
            }
        }
        mobileInput.value = "";
    });
}

document.addEventListener("keydown", (e) => {
    if (isGameOverState && e.key === "Enter" && globalSaveContainer.classList.contains("hidden")) { initRound(); setTimeout(focusMobileInput, 100); return; }
    if (!gameActive || isGameOverState) return;

    if (e.key === "Enter") {
        if (currentTilePlayer === WORD_LENGTH) checkPlayerWord();
    } else if (e.key === "Backspace") {
        if (currentTilePlayer > 0) {
            currentTilePlayer--;
            const tile = document.getElementById(`p-${currentAttemptPlayer}-${currentTilePlayer}`);
            if (tile) tile.innerText = "";
        }
    } else if (/^[a-zA-Z]$/.test(e.key) && !mobileInput) {
        const keyUpper = e.key.toUpperCase();
        if (currentTilePlayer < WORD_LENGTH) {
            const tile = document.getElementById(`p-${currentAttemptPlayer}-${currentTilePlayer}`);
            if (tile) { tile.innerText = keyUpper; currentTilePlayer++; }
        }
    }
});

function checkPlayerWord() {
    let guess = "";
    for (let i = 0; i < WORD_LENGTH; i++) {
        guess += document.getElementById(`p-${currentAttemptPlayer}-${i}`).innerText;
    }

    if (WORD_LENGTH === 5 && guess === "DEBUG") {
        isDebugMode = !isDebugMode;
        updateDebugVisibility();
        for (let i = 0; i < WORD_LENGTH; i++) document.getElementById(`p-${currentAttemptPlayer}-${i}`).innerText = "";
        currentTilePlayer = 0;
        return;
    }

    let letterStatuses = revealRowAndGetStatuses("p", currentAttemptPlayer, guess);
    let puntiLettere = SCORING.calculateRowPoints(letterStatuses, WORD_LENGTH);
    totalScore += puntiLettere;
    scoreEl.innerText = totalScore;

    if (guess === SECRET_WORD) {
        let bonusVittoria = SCORING.calculateVictoryBonus(currentAttemptPlayer, WORD_LENGTH, isTimerMode, timeLeft);
        endGame(true, `🏆 Vittoria! Parola indovinata!`, bonusVittoria);
        return;
    }

    drawHangman(ctxPlayer, currentAttemptPlayer);
    currentAttemptPlayer++;
    currentTilePlayer = 0;

    if (currentAttemptPlayer === MAX_ATTEMPTS) {
        endGame(false, `💥 Game Over! Parola: ${SECRET_WORD}`);
    }
}

function revealRowAndGetStatuses(prefix, row, guess) {
    let secretLettersCount = {};
    for (let char of SECRET_WORD) secretLettersCount[char] = (secretLettersCount[char] || 0) + 1;
    let statuses = new Array(WORD_LENGTH).fill("absent");

    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guess[i] === SECRET_WORD[i]) { statuses[i] = "correct"; secretLettersCount[guess[i]]--; }
    }
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (statuses[i] !== "correct") {
            let char = guess[i];
            if (SECRET_WORD.includes(char) && secretLettersCount[char] > 0) { statuses[i] = "present"; secretLettersCount[char]--; }
        }
    }
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = document.getElementById(`${prefix}-${row}-${i}`);
        if (tile) tile.classList.add(statuses[i]);
    }
    return statuses;
}

function endGame(playerWon, msg, bonusFinale = 0) {
    isGameOverState = true;
    clearInterval(timerInterval);
    messageEl.innerText = msg;
    
    if (playerWon) {
        totalScore += bonusFinale; 
        streakCount++;
        scoreEl.innerText = totalScore;
        streakEl.innerText = streakCount;
        if (totalScore > vsHighScore) {
            vsHighScore = totalScore;
            localStorage.setItem("wordman_high_score", vsHighScore);
            highScoreEl.innerText = vsHighScore;
        }
        restartBtn.classList.remove("hidden");
    } else {
        // Se c'è un Game Over definitivo, mostriamo l'invio globale dei punti accumulati fino ad ora
        streakCount = 0;
        streakEl.innerText = streakCount;
        
        if (totalScore > 0) {
            globalSaveContainer.classList.remove("hidden");
        } else {
            restartBtn.classList.remove("hidden");
        }
    }

    const li = document.createElement("li");
    li.innerHTML = `${playerWon ? '✅' : '❌'} Parola: <b>${SECRET_WORD}</b> (+${playerWon ? bonusFinale : 0}pt)`;
    document.getElementById("words-list").prepend(li);
}

// Gestione invio record al Database Mondiale
btnSubmitGlobal.addEventListener("click", async () => {
    const username = leaderboardUsername.value.trim().toUpperCase();
    if (!username) { alert("Inserisci un nome valido!"); return; }

    btnSubmitGlobal.innerText = "Invio...";
    btnSubmitGlobal.disabled = true;

    const result = await ONLINE_LEADERBOARD.submitScore(username, totalScore);
    if (result) {
        messageEl.innerText = `🌍 Record registrato! Sei in posizione #${result.rank} globale su ${result.totalPlayers} giocatori!`;
        fetchGlobalRank(); // Aggiorna il tag in alto
    } else {
        messageEl.innerText = "❌ Errore durante il salvataggio online.";
    }

    globalSaveContainer.classList.add("hidden");
    restartBtn.classList.remove("hidden");
    btnSubmitGlobal.innerText = "Invia Record";
    btnSubmitGlobal.disabled = false;
    
    // Resetta il punteggio di sessione per la nuova serie
    totalScore = 0;
    scoreEl.innerText = totalScore;
});

restartBtn.addEventListener("click", () => { initRound(); setTimeout(focusMobileInput, 100); });

function drawHangman(ctx, step) {
    ctx.strokeStyle = "#ff4757"; ctx.lineWidth = 4; ctx.beginPath();
    switch (step) {
        case 0: ctx.arc(120, 70, 20, 0, Math.PI * 2); break;
        case 1: ctx.moveTo(120, 90); ctx.lineTo(120, 160); break;
        case 2: ctx.moveTo(120, 110); ctx.lineTo(90, 130); break;
        case 3: ctx.moveTo(120, 110); ctx.lineTo(150, 130); break;
        case 4: ctx.moveTo(120, 160); ctx.lineTo(90, 200); break;
        case 5: ctx.moveTo(120, 160); ctx.lineTo(150, 200); break;
    }
    ctx.stroke();
}