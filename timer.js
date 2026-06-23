if (new URLSearchParams(window.location.search).get('mode') === 'timer') {
    
    document.getElementById("btn-mode-timer").classList.add("active");
    document.getElementById("btn-mode-classic").addEventListener("click", () => {
        window.location.href = "index.html";
    });

    const MAX_ATTEMPTS = 6;
    let WORD_LENGTH = 5; 

    let totalScore = 0;
    let streakCount = 0; 
    let yellowCountThisRound = 0;
    let greenCountThisRound = 0; 
    let isGameOverState = false; 

    let timeLeft = 60;
    let timerInterval = null;
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
    const timerBar = document.getElementById("timer-bar");
    const timerText = document.getElementById("timer-text");
    const btnEasy = document.getElementById("btn-easy");
    const btnHard = document.getElementById("btn-hard");
    const btnStart = document.getElementById("start-session-btn");
    const globalSaveContainer = document.getElementById("global-save-container");

    // CREAZIONE INPUT INVISIBILE PER FORZARE LA TASTIERA SU MOBILE
    const mobileInput = document.createElement("input");
    mobileInput.type = "text";
    mobileInput.setAttribute("autocomplete", "off");
    mobileInput.setAttribute("autocapitalize", "none");
    mobileInput.setAttribute("spellcheck", "false");
    mobileInput.style.position = "absolute";
    mobileInput.style.opacity = "0";
    mobileInput.style.pointerEvents = "none";
    mobileInput.style.zIndex = "-1000";
    document.body.appendChild(mobileInput);

    board.addEventListener("click", () => {
        if (!restartBtn.classList.contains("hidden")) return;
        mobileInput.focus();
    });

    mobileInput.addEventListener("input", (e) => {
        if (timeLeft <= 0) {
            mobileInput.value = "";
            return;
        }
        if (e.data) {
            const key = e.data.toUpperCase();
            if (key >= "A" && key <= "Z") {
                btnEasy.setAttribute("disabled", "true");
                btnHard.setAttribute("disabled", "true");
                addLetter(key);
            }
        }
        mobileInput.value = "";
    });

    let highScore = localStorage.getItem("wordle_high_score_timer") || 0;
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
        if (WORD_LENGTH === 5 || currentAttempt > 0 || !restartBtn.classList.contains("hidden")) return;
        WORD_LENGTH = 5;
        btnEasy.classList.add("active");
        btnHard.classList.remove("active");
        generateBoardOnly();
        updateDebugDisplay();
    });

    btnHard.addEventListener("click", () => {
        if (WORD_LENGTH === 6 || currentAttempt > 0 || !restartBtn.classList.contains("hidden")) return;
        WORD_LENGTH = 6;
        btnHard.classList.add("active");
        btnEasy.classList.remove("active");
        generateBoardOnly();
        updateDebugDisplay();
    });

    btnStart.addEventListener("click", () => {
        document.getElementById("difficulty-container").classList.add("hidden");
        document.getElementById("game-container").classList.remove("hidden");
        startNewRound();
    });

    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = 60;
        updateTimerUI();
        
        timerInterval = setInterval(() => {
            if (!restartBtn.classList.contains("hidden")) {
                clearInterval(timerInterval);
                return;
            }
            timeLeft--;
            updateTimerUI();
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                handleTimeOut();
            }
        }, 1000);
    }

    function updateTimerUI() {
        timerText.innerText = `${timeLeft}s`;
        const percentage = (timeLeft / 60) * 100;
        timerBar.style.width = `${percentage}%`;
        
        if (timeLeft <= 15) {
            timerBar.style.backgroundColor = "#ff4757";
        } else if (timeLeft <= 35) {
            timerBar.style.backgroundColor = "#ff9f43";
        } else {
            timerBar.style.backgroundColor = "#1dd1a1";
        }
    }

    function handleTimeOut() {
        showMessage(`⏰ TEMPO SCADUTO! La parola era: ${SECRET_WORD}.`);
        triggerGameOver();
    }

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

    function startNewRound() {
        const pool = (WORD_LENGTH === 5) ? EASY_WORDS : HARD_WORDS;
        SECRET_WORD = pool[Math.floor(Math.random() * pool.length)];

        currentAttempt = 0;
        currentTile = 0;
        yellowCountThisRound = 0;
        greenCountThisRound = 0; 
        showMessage("");
        updateDebugDisplay();
        
        restartBtn.classList.add("hidden");
        globalSaveContainer.classList.add("hidden");
        
        btnEasy.removeAttribute("disabled");
        btnHard.removeAttribute("disabled");

        generateBoardOnly();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "white"; ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(10, 240); ctx.lineTo(150, 240);
        ctx.moveTo(40, 240); ctx.lineTo(40, 20);
        ctx.moveTo(40, 20);  ctx.lineTo(120, 20);
        ctx.moveTo(120, 20); ctx.lineTo(120, 50);
        ctx.stroke();

        startTimer();
    }

    function resetEntireSession() {
        totalScore = 0;
        streakCount = 0; 
        currentScoreEl.innerText = "0";
        currentStreakEl.innerText = "0";
        wordsListEl.innerHTML = "";
        isGameOverState = false;
        startNewRound();
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
            debugEl.innerText = `🔍 [DEBUG TIMER] Parola: ${SECRET_WORD}`;
        } else { if (debugEl) debugEl.remove(); }
    }

    restartBtn.addEventListener("click", () => {
        if (isGameOverState) { resetEntireSession(); } else { startNewRound(); }
    });

    window.addEventListener("keydown", (e) => {
        if (document.activeElement === document.getElementById("leaderboard-username")) return;

        if (e.target === mobileInput) {
            const key = e.key.toUpperCase();
            if (key === "ENTER") {
                if (!restartBtn.classList.contains("hidden")) restartBtn.click();
                else checkRow();
                e.preventDefault();
            } else if (key === "BACKSPACE") {
                if (restartBtn.classList.contains("hidden")) removeLetter();
                e.preventDefault();
            }
            return;
        }

        const key = e.key.toUpperCase();

        if (!restartBtn.classList.contains("hidden")) {
            if (key === "ENTER") {
                restartBtn.click();
            }
            return;
        }

        if (currentAttempt >= MAX_ATTEMPTS || timeLeft <= 0) return;

        if (key.length === 1 && key >= "A" && key <= "Z") {
            btnEasy.setAttribute("disabled", "true");
            btnHard.setAttribute("disabled", "true");
            addLetter(key);
        }
        if (key === "BACKSPACE") removeLetter();
        if (key === "ENTER") checkRow();
    });

    function addLetter(letter) {
        const maxInput = isDebugMode ? 10 : WORD_LENGTH; 
        if (currentTile < maxInput) {
            const tileIndex = currentAttempt * WORD_LENGTH + currentTile;
            const tile = document.getElementById(`tile-${tileIndex}`);
            if (tile) tile.innerText = letter; 
            currentTile++; 
        }
    }

    function removeLetter() {
        if (currentTile > 0) {
            currentTile--;
            const tileIndex = currentAttempt * WORD_LENGTH + currentTile;
            const tile = document.getElementById(`tile-${tileIndex}`);
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

        guess = guess.trim().toUpperCase();

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
                tileStatuses[i] = "correct"; secretLettersRemaining[i] = null; greenCountThisRound++; 
            }
        }

        for (let i = 0; i < WORD_LENGTH; i++) {
            if (tileStatuses[i] === "correct") continue;
            const indexInRemaining = secretLettersRemaining.indexOf(guess[i]);
            if (indexInRemaining !== -1) {
                tileStatuses[i] = "present"; secretLettersRemaining[indexInRemaining] = null; yellowCountThisRound++; 
            }
        }

        for (let i = 0; i < WORD_LENGTH; i++) {
            const tile = document.getElementById(`tile-${startIndex + i}`);
            if (tile) tile.classList.add(tileStatuses[i]);
        }

        if (guess === SECRET_WORD) {
            clearInterval(timerInterval); 

            const diffMultiplier = (WORD_LENGTH === 5) ? 1.0 : 1.5;
            const basePointsTable = [1000, 800, 600, 400, 200, 100];
            const basePoints = basePointsTable[currentAttempt];
            const timeBonus = timeLeft * 5; 
            const roundBaseScore = (basePoints * diffMultiplier) + (yellowCountThisRound * 10) + (greenCountThisRound * 20) + timeBonus;
            
            let streakMultiplier = 1.0;
            if (streakCount >= 3 && streakCount < 5) streakMultiplier = 1.2;
            else if (streakCount >= 5 && streakCount < 10) streakMultiplier = 1.5;
            else if (streakCount >= 10) streakMultiplier = 2.0;

            const roundFinalScore = Math.round(roundBaseScore * streakMultiplier);
            totalScore += roundFinalScore;
            streakCount++; 

            currentScoreEl.innerText = totalScore;
            currentStreakEl.innerText = streakCount;

            const li = document.createElement("li");
            li.innerText = `⏱️ ${SECRET_WORD} (+${roundFinalScore} pt) - Rimasti: ${timeLeft}s`;
            wordsListEl.appendChild(li);

            showMessage(`🎉 Velocissimo! Rimasti ${timeLeft}s (+${timeBonus}pt tempo). Totale round: +${roundFinalScore}`);
            
            isGameOverState = false;
            restartBtn.innerText = "Continua";
            restartBtn.classList.remove("hidden");
            return;
        }

        drawHangman(currentAttempt);
        currentAttempt++;
        currentTile = 0;

        if (currentAttempt === MAX_ATTEMPTS) {
            clearInterval(timerInterval);
            showMessage(`💥 IMPICCATO! La parola era: ${SECRET_WORD}.`);
            triggerGameOver();
        }
    }

    function triggerGameOver() {
        if (totalScore > highScore) {
            highScore = totalScore;
            localStorage.setItem("wordle_high_score_timer", highScore);
            highScoreEl.innerText = highScore;
            showMessage(`🏆 NUOVO RECORD A TEMPO: ${totalScore} PUNTI!`);
        }
        isGameOverState = true;
        restartBtn.innerText = "Nuova Partita";
        restartBtn.classList.remove("hidden");
        
        if (totalScore > 0) {
            globalSaveContainer.classList.remove("hidden");
        }
    }

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
        const msgEl = document.getElementById("message");
        if (msgEl) msgEl.innerText = text;
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