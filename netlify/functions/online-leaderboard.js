const { Client } = require('pg');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Configurazione client Postgres nativo di Netlify
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // 1. Creazione automatica della tabella se non esiste (così non devi farlo a mano!)
        await client.query(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                score INT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        // --- CASO POST: SALVATAGGIO DI UN NUOVO RECORD ---
        if (event.httpMethod === 'POST') {
            const { username, score } = JSON.parse(event.body);
            if (!username || score === undefined) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Dati mancanti' }) };
            }

            // Inseriamo il record
            await client.query('INSERT INTO leaderboard (username, score) VALUES ($1, $2)', [username, parseInt(score)]);

            // Calcoliamo la posizione globale
            const rankRes = await client.query('SELECT COUNT(*) FROM leaderboard WHERE score > $1', [score]);
            const higherScores = parseInt(rankRes.rows[0].count);

            // Calcoliamo il totale dei giocatori
            const totalRes = await client.query('SELECT COUNT(*) FROM leaderboard');
            const totalPlayers = parseInt(totalRes.rows[0].count);

            await client.end();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ rank: higherScores + 1, totalPlayers: totalPlayers })
            };
        }

        // --- CASO GET: CONTROLLO POSIZIONE DI UN PUNTEGGIO ---
        if (event.httpMethod === 'GET') {
            const score = parseInt(event.queryStringParameters.score || 0);

            const rankRes = await client.query('SELECT COUNT(*) FROM leaderboard WHERE score > $1', [score]);
            const higherScores = parseInt(rankRes.rows[0].count);

            const totalRes = await client.query('SELECT COUNT(*) FROM leaderboard');
            const totalPlayers = parseInt(totalRes.rows[0].count);

            await client.end();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ rank: higherScores + 1, totalPlayers: totalPlayers })
            };
        }

        await client.end();
        return { statusCode: 405, headers, body: 'Metodo non consentito' };

    } catch (error) {
        try { await client.end(); } catch(e) {}
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};