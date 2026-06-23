/**
 * WORDMAN - Script principale completo
 */

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

// Liste parole (omesse per brevità, mantieni le tue originali qui)
const EASY_WORDS = ["TRENO", "GATTO", "PIZZA", "CORSA", "FUOCO", "MONDO", "TASTO", "LIBRO", "VERDE", "FIORE"];
const HARD_WORDS = ["ALBERO", "BRUCO", "PADRE", "CHIAVE", "STRADA", "PIANTO", "PORTAI", "STADIO", "TEATRO", "TAVOLO"];

btnModeClassic.addEventListener("click", () => { location.href = "index.html"; });
btnModeTimer.addEventListener("click", () => { location.href = "index.html?mode=timer"; });

// --- GESTIONE CLASSIFICA SUPABASE ---
let vsHighScore = localStorage.getItem("wordman_high_score") || 0;
highScoreEl.innerText = vsHighScore;

async function fetchGlobalRank() {
    const elementoRank = document.getElementById("global-rank-tag");
    if (!elementoRank) return;
    
    elementoRank.innerText = "Calcolo rank globale...";
    try {
        const rank = await ONLINE_LEADERBOARD.calculateRank(vsHighScore);
        elementoRank.innerText = `🌍 Rank Globale: #${rank}`;
    } catch (error) {
        elementoRank.innerText = "";
    }
}
fetchGlobalRank();

// --- LOGICA GIOCO ---
btnEasy.addEventListener("click", () => { if (gameActive) return; WORD_LENGTH = 5; btnEasy.classList.add("active"); btnHard.classList.remove("active"); });
btnHard.addEventListener("click", () => { if (gameActive) return; WORD_LENGTH = 6; btnHard.classList.add("active"); btnEasy.classList.remove("active"); });
btnStart.addEventListener("click", () => { startGameSession(); });

function startGameSession() {
    document.getElementById("difficulty-container").classList.add("hidden");
    gameContainer.classList.remove("hidden");
    gameActive = true;
    initRound();
}

function initRound() {
    isGameOverState = false;
    currentAttemptPlayer = 0;
    currentTilePlayer = 0;
    messageEl.innerText = "";
    restartBtn.classList.add("hidden");
    globalSaveContainer.classList.add("hidden");

    const pool = (WORD_LENGTH === 5) ? EASY_WORDS : HARD_WORDS;
    SECRET_WORD = pool[Math.floor(Math.random() * pool.length)].toUpperCase();
    
    createGrid(boardPlayer, "p");
    ctxPlayer.clearRect(0, 0, canvasPlayer.width, canvasPlayer.height);
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

function checkPlayerWord() {
    let guess = "";
    for (let i = 0; i < WORD_LENGTH; i++) {
        guess += document.getElementById(`p-${currentAttemptPlayer}-${i}`).innerText;
    }

    // Qui va la tua logica di validazione riga (già esistente nel tuo file)
    // ...
    
    if (guess === SECRET_WORD) {
        endGame(true, "Vittoria!");
    } else {
        currentAttemptPlayer++;
        currentTilePlayer = 0;
        if (currentAttemptPlayer === MAX_ATTEMPTS) endGame(false, "Game Over!");
    }
}

function endGame(playerWon, msg) {
    isGameOverState = true;
    messageEl.innerText = msg;
    
    if (playerWon) {
        if (totalScore > vsHighScore) {
            vsHighScore = totalScore;
            localStorage.setItem("wordman_high_score", vsHighScore);
            highScoreEl.innerText = vsHighScore;
        }
        restartBtn.classList.remove("hidden");
    } else if (totalScore > 0) {
        globalSaveContainer.classList.remove("hidden");
    }
}

// --- INVIO RECORD SUPABASE ---
btnSubmitGlobal.addEventListener("click", async () => {
    const username = leaderboardUsername.value.trim().toUpperCase();
    if (!username) { alert("Inserisci un nome valido!"); return; }

    btnSubmitGlobal.innerText = "Invio...";
    btnSubmitGlobal.disabled = true;

    const saveResult = await ONLINE_LEADERBOARD.submitScore(username, totalScore);
    if (saveResult) {
        const nuovoRank = await ONLINE_LEADERBOARD.calculateRank(totalScore);
        messageEl.innerText = `🌍 Record registrato! Sei in posizione #${nuovoRank} globale!`;
        fetchGlobalRank();
    } else {
        messageEl.innerText = "❌ Errore durante il salvataggio.";
    }

    globalSaveContainer.classList.add("hidden");
    restartBtn.classList.remove("hidden");
    btnSubmitGlobal.innerText = "Invia Record";
    btnSubmitGlobal.disabled = false;
    totalScore = 0;
});