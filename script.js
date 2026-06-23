if (new URLSearchParams(window.location.search).get('mode') !== 'timer') {
    
    document.getElementById("timer-wrapper").classList.add("hidden");
    document.getElementById("btn-mode-classic").classList.add("active");
    
    document.getElementById("btn-mode-timer").addEventListener("click", () => {
        window.location.href = "index.html?mode=timer";
    });

    const MAX_ATTEMPTS = 6;
    let WORD_LENGTH = 5; 
    let totalScore = 0;
    let streakCount = 0; 
    let isGameOverState = false; 
    let isDebugMode = false;

    const EASY_WORDS = ["TRENO", "GATTO", "PIZZA", "CORSA", "FUOCO", "MONDO", "TASTO", "LIBRO", "VERDE", "FIORE", "ACQUA", "AMICO", "ANIMA", "AEREO", "BARCA", "BOCCA", "BRAVO", "CAFFE", "CANTO", "CAPRA", "CARTA", "CERVO", "CIELO", "CLIMA", "COLPO", "COSTA", "CUORE", "DENTE", "DISCO", "DOLCE", "DONNA", "FANGO", "FESTA", "FIUME", "FORMA", "FORTE", "FUSTO", "GAMBA", "GIOCO", "GONNA", "GRANO", "GRAVE", "GUIDA", "GUSTO", "ISOLA", "LARGO", "LATTE", "LEGNO", "LENTO", "LINEA", "PADRE", "PANE", "PAESE", "PELLE", "PENNA", "PIANO", "PIEDE", "PORTO", "POSTO", "PRATO", "PRIMA", "PUNTO", "RADIO", "RAGNO", "REGNO", "ROSSO", "RUOTA", "SCALA", "SOGNO", "SOLDI", "SPINA", "SUOLO", "TASCA", "TERRA", "TESTA", "TORRE", "VENTO", "VETRO", "VOLTO", "ZAINO", "ZUPPA", "CORDA", "PORTA", "CREMA", "TASSE", "SCAFO", "PARCO", "CORPO", "PRONO", "ORAFO"];
    const HARD_WORDS = ["ALBERO", "LAVORO", "STRADA", "CHIESA", "PIANTO", "SABBIA", "STORIA", "SANGUE", "SCARPA", "SCUOLA", "GIORNO", "TEATRO", "POESIA", "FRUTTO", "TAVOLO", "STADIO", "SVOLTA", "PATRIA", "FUTURO", "MEDICO", "NATURA", "PREZZO", "PIETRA", "BLOCCO", "CUGINO", "DOTTOR", "BRUTTO", "FREDDO", "PULITO", "CHIARO", "OSCURO", "FELICE", "STANCO", "PRONTO", "ONESTO", "SICURO", "ANANAS", "AVVISO", "AZIENDA", "ANELLO", "CACCIA", "CATENA", "CLASSE", "CUCINA", "DIVISA", "DOCCIA", "DOMANI", "ESTATE", "FAVOLA", "FEBBRE", "FRECCIA", "FRONTE", "GELATO", "GIACCA", "GIRAFFA", "GOMITO", "GRAZIA", "GUANTO", "LABBRO", "LANCIA", "MOSTRO", "MOTORE", "NUMERO", "PAGINA", "PAROLA", "PATATA", "PECORA", "PILOTA", "POSTER", "PRANZO", "QUADRO", "REGINA", "SABATO", "SALUTE", "SAPONE", "SATINO", "SCOPA", "SECOLO", "SIRENA", "SPEZIA", "SAPORE", "STAMPA", "STELLA", "TENDA", "TIGRE", "TIMONE", "TOMBA", "VIAGGIO", "SCONTO", "STREGA", "BRONZO", "BIANCO", "BIONDO", "DIVANO", "FASCIA", "FOGLIA", "SGUARDO", "CANDELA", "NUVOLA", "SANGUE"];

    let SECRET_WORD = ""; 
    let currentAttempt = 0; 
    let currentTile = 0;    

    const board = document.getElementById("game-board");
    const canvas = document.getElementById("hangman");
    const ctx = canvas.getContext("2d");
    const restartBtn = document.getElementById("restart-btn");
    const currentScoreEl = document.getElementById("current-score");
    const highScoreEl = document.getElementById("high-score");
    const wordsListEl = document.getElementById("words-list");
    const currentStreakEl = document.getElementById("current-streak");
    const globalSaveContainer = document.getElementById("global-save-container");
    const messageEl = document.getElementById("message");

    const btnEasy = document.getElementById("btn-easy");
    const btnHard = document.getElementById("btn-hard");
    const btnStart = document.getElementById("start-session-btn");

    let highScore = localStorage.getItem("wordman_high_score") || 0;
    highScoreEl.innerText = highScore;

    async function fetchGlobalRank() {
        const el = document.getElementById("global-rank-tag");
        if (!el) return;
        el.innerText = "Calcolo rank globale...";
        try {
            const rank = await ONLINE_LEADERBOARD.calculateRank(highScore);
            el.innerText = `🌍 Rank Globale: #${rank}`;
        } catch (e) {
            el.innerText = "Rank non disponibile";
        }
    }
    fetchGlobalRank();

    btnEasy.addEventListener("click", () => {
        WORD_LENGTH = 5;
        btnEasy.classList.add("active");
        btnHard.classList.remove("active");
    });

    btnHard.addEventListener("click", () => {
        WORD_LENGTH = 6;
        btnHard.classList.add("active");
        btnEasy.classList.remove("active");
    });

    btnStart.addEventListener("click", () => {
        document.getElementById("difficulty-container").classList.add("hidden");
        document.getElementById("game-container").classList.remove("hidden");
        startNewRound();
    });

    function generateBoardOnly() {
        board.style.setProperty('--cols', WORD_LENGTH);
        board.innerHTML = "";
        for (let i = 0; i < MAX_ATTEMPTS * WORD_LENGTH; i++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.setAttribute("id", `tile-${i}`);
            board.appendChild(tile);
        }
    }

    function updateDebugDisplay() {
        let debugEl = document.getElementById("debug-display");
        if (isDebugMode) {
            if (!debugEl) {
                debugEl = document.createElement("div");
                debugEl.id = "debug-display";
                debugEl.style = "color:#00ff00; font-weight:bold; font-size:1.2rem; margin-bottom:15px; background:rgba(0,255,0,0.1); padding:5px 15px; border-radius:4px; border:1px dashed #00ff00; text-align:center; width:100%;";
                document.getElementById("difficulty-container").after(debugEl);
            }
            debugEl.innerText = `🔍 [DEBUG CLASSICA] Parola: ${SECRET_WORD}`;
        } else { if (debugEl) debugEl.remove(); }
    }

    function startNewRound() {
        const pool = (WORD_LENGTH === 5) ? EASY_WORDS : HARD_WORDS;
        SECRET_WORD = pool[Math.floor(Math.random() * pool.length)];

        currentAttempt = 0;
        currentTile = 0;
        showMessage("");
        updateDebugDisplay();
        
        restartBtn.classList.add("hidden");
        globalSaveContainer.classList.add("hidden");

        generateBoardOnly();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "white"; ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(10, 240); ctx.lineTo(150, 240);
        ctx.moveTo(40, 240); ctx.lineTo(40, 20);
        ctx.moveTo(40, 20);  ctx.lineTo(120, 20);
        ctx.moveTo(120, 20); ctx.lineTo(120, 50);
        ctx.stroke();
    }

    window.addEventListener("keydown", (e) => {
        const key = e.key.toUpperCase();

        // SE IL PULSANTE DI CONTINUAZIONE È ATTIVO, L'INVIO AVANZA ALLA PROSSIMA PAROLA
        if (!restartBtn.classList.contains("hidden")) {
            if (key === "ENTER") {
                restartBtn.click();
            }
            return;
        }

        if (currentAttempt >= MAX_ATTEMPTS) return;
        
        if (key.length === 1 && key >= "A" && key <= "Z") addLetter(key);
        if (key === "BACKSPACE") removeLetter();
        if (key === "ENTER") checkRow();
    });

    function addLetter(letter) {
        const maxInput = isDebugMode ? 10 : WORD_LENGTH;
        if (currentTile < maxInput) {
            const tile = document.getElementById(`tile-${currentAttempt * WORD_LENGTH + currentTile}`);
            if (tile) tile.innerText = letter; 
            currentTile++; 
        }
    }

    function removeLetter() {
        if (currentTile > 0) {
            currentTile--;
            const tile = document.getElementById(`tile-${currentAttempt * WORD_LENGTH + currentTile}`);
            if (tile) tile.innerText = "";
        }
    }

    function checkRow() {
        let guess = "";
        const startIndex = currentAttempt * WORD_LENGTH;
        
        for (let i = 0; i < currentTile; i++) {
            const tile = document.getElementById(`tile-${startIndex + i}`);
            if (tile && tile.innerText) guess += tile.innerText;
        }

        // INTERCETTAZIONE DEBUG PRIMA DEL CONTROLLO LUNGHEZZA
        if (guess === "DEBUG") {
            isDebugMode = !isDebugMode; 
            updateDebugDisplay();
            for (let i = 0; i < currentTile; i++) {
                const tile = document.getElementById(`tile-${startIndex + i}`);
                if (tile) tile.innerText = "";
            }
            currentTile = 0; 
            showMessage(isDebugMode ? "🔧 Debug attivato!" : "🔒 Debug disattivato.");
            return; 
        }

        if (currentTile !== WORD_LENGTH) {
            showMessage(`La parola deve avere ${WORD_LENGTH} lettere!`); 
            return;
        }

        let tileStatuses = new Array(WORD_LENGTH).fill("absent");
        let secretLettersRemaining = SECRET_WORD.split("");

        for (let i = 0; i < WORD_LENGTH; i++) {
            if (guess[i] === SECRET_WORD[i]) {
                tileStatuses[i] = "correct"; secretLettersRemaining[i] = null;
            }
        }

        for (let i = 0; i < WORD_LENGTH; i++) {
            if (tileStatuses[i] === "correct") continue;
            const indexInRemaining = secretLettersRemaining.indexOf(guess[i]);
            if (indexInRemaining !== -1) {
                tileStatuses[i] = "present"; secretLettersRemaining[indexInRemaining] = null;
            }
        }

        let roundPoints = 0;
        if (typeof SCORING !== 'undefined') {
            roundPoints += SCORING.calculateRowPoints(tileStatuses, WORD_LENGTH);
        }

        for (let i = 0; i < WORD_LENGTH; i++) {
            const tile = document.getElementById(`tile-${startIndex + i}`);
            if (tile) tile.classList.add(tileStatuses[i]);
        }

        if (guess === SECRET_WORD) {
            if (typeof SCORING !== 'undefined') {
                roundPoints += SCORING.calculateVictoryBonus(currentAttempt, WORD_LENGTH, false, 0);
            }
            totalScore += roundPoints;
            streakCount++; 
            
            currentScoreEl.innerText = totalScore;
            currentStreakEl.innerText = streakCount;

            const li = document.createElement("li");
            li.innerText = `✔️ ${SECRET_WORD} (+${roundPoints} pt)`;
            wordsListEl.appendChild(li);

            showMessage(`🎉 Hai indovinato! (+${roundPoints}pt)`);
            isGameOverState = false;
            restartBtn.innerText = "Continua";
            restartBtn.classList.remove("hidden");
            return;
        }

        drawHangman(currentAttempt);
        currentAttempt++;
        currentTile = 0;

        if (currentAttempt === MAX_ATTEMPTS) {
            showMessage(`💥 IMPICCATO! La parola era: ${SECRET_WORD}.`);
            triggerGameOver();
        }
    }

    function triggerGameOver() {
        if (totalScore > highScore) {
            highScore = totalScore;
            localStorage.setItem("wordman_high_score", highScore);
            highScoreEl.innerText = highScore;
        }
        isGameOverState = true;
        restartBtn.innerText = "Nuova Partita";
        restartBtn.classList.remove("hidden");
        if (totalScore > 0) {
            globalSaveContainer.classList.remove("hidden");
        } else {
            totalScore = 0;
            streakCount = 0;
            currentScoreEl.innerText = totalScore;
            currentStreakEl.innerText = streakCount;
            wordsListEl.innerHTML = "";
        }
    }

    restartBtn.addEventListener("click", () => {
        if (isGameOverState) {
            totalScore = 0; streakCount = 0;
            currentScoreEl.innerText = "0"; currentStreakEl.innerText = "0";
            wordsListEl.innerHTML = "";
        }
        startNewRound();
    });

    function drawHangman(step) {
        ctx.strokeStyle = "#ff4757"; ctx.lineWidth = 4; ctx.beginPath();
        switch (step) {
            case 0: ctx.arc(120, 70, 20, 0, Math.PI * 2); break; 
            case 1: ctx.moveTo(120, 90); ctx.lineTo(120, 160); break; 
            case 2: ctx.moveTo(120, 110); ctx.lineTo(90, 130); break; 
            case 3: ctx.moveTo(120, 110); ctx.lineTo(150, 130); break; 
            case 4: ctx.moveTo(120, 160); ctx.lineTo(95, 210); break; 
            case 5: ctx.moveTo(120, 160); ctx.lineTo(145, 210); break; 
        }
        ctx.stroke();
    }

    function showMessage(text) {
        if (messageEl) messageEl.innerText = text;
    }

    const btnSubmitGlobal = document.getElementById("btn-submit-global");
    if (btnSubmitGlobal) {
        btnSubmitGlobal.addEventListener("click", async () => {
            const username = document.getElementById("leaderboard-username").value.trim().toUpperCase();
            if (!username) return;

            btnSubmitGlobal.innerText = "Invio...";
            btnSubmitGlobal.disabled = true;

            const res = await ONLINE_LEADERBOARD.submitScore(username, totalScore);
            if (res) {
                showMessage(`🌍 Record inviato con successo!`);
                fetchGlobalRank();
            } else {
                showMessage(`❌ Errore durante il salvataggio.`);
            }

            globalSaveContainer.classList.add("hidden");
            btnSubmitGlobal.innerText = "Invia Record";
            btnSubmitGlobal.disabled = false;
        });
    }
}