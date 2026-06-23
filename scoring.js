/**
 * WORDMAN - Modulo Logica Punteggi Sopraffina
 */

const SCORING = {
    // Punti base per le singole lettere trovate in un tentativo
    POINTS_GREEN: 20,
    POINTS_YELLOW: 10,

    /**
     * Calcola i punti accumulati per le lettere indovinate in una singola riga
     */
    calculateRowPoints: function(statuses, wordLength) {
        let punti = 0;
        for (let status of statuses) {
            if (status === "correct") {
                punti += this.POINTS_GREEN;
            } else if (status === "present") {
                punti += this.POINTS_YELLOW;
            }
        }
        // Applica moltiplicatore x1.5 se la modalità è a 6 lettere
        if (wordLength === 6) {
            punti = Math.round(punti * 1.5);
        }
        return punti;
    },

    /**
     * Calcola il super bonus finale al momento della vittoria della parola
     */
    calculateVictoryBonus: function(attemptIndex, wordLength, isTimerMode, timeLeft) {
        let bonusTentativo = 40;
        
        // Punteggio decrescente in base al tentativo di successo (0 = 1° tentativo)
        switch (attemptIndex) {
            case 0: bonusTentativo = 150; break; 
            case 1: bonusTentativo = 120; break; 
            case 2: bonusTentativo = 100; break; 
            case 3: bonusTentativo = 80;  break; 
            case 4: bonusTentativo = 60;  break; 
            case 5: bonusTentativo = 40;  break; 
        }

        // Moltiplicatore Difficoltà per le 6 lettere
        if (wordLength === 6) {
            bonusTentativo = Math.round(bonusTentativo * 1.5);
        }

        // Bonus Velocità della Modalità a Tempo (1.5 punti per ogni secondo rimasto)
        if (isTimerMode && timeLeft > 0) {
            bonusTentativo += Math.round(timeLeft * 1.5);
        }

        return bonusTentativo;
    }
};