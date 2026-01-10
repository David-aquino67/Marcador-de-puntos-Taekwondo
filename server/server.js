// server.js

// 1. Importar dependencias
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
// 2. Configuración inicial
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000;

// --- VARIABLES GLOBALES DEL TEMPORIZADOR ---
let timerInterval;
let TIME_LIMIT = 120; // 2 minutos (2:00)
let timeRemainingSeconds = TIME_LIMIT;
// -------------------------------------------

// 3. Estado Inicial del Marcador
let scoreboardState = {
    scoreA: 0,
    scoreB: 0,
    penaltiesA: 0,
    penaltiesB: 0,
    round: 1,
    time: '2:00'
};

// Función de utilidad para emitir el estado actual a todos los clientes
function emitScoreUpdate() {
    io.emit('score_updated', scoreboardState);
     console.log('ESTADO ACTUAL:', scoreboardState); // Descomentar para debug
}

// Lógica central del temporizador
function startTimer() {
    if (timerInterval) clearInterval(timerInterval); // Detener cualquier timer anterior

    timerInterval = setInterval(() => {
        if (timeRemainingSeconds > 0) {
            timeRemainingSeconds--;

            // Formateo de tiempo (MM:SS)
            const minutes = Math.floor(timeRemainingSeconds / 60);
            const seconds = timeRemainingSeconds % 60;
            const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            scoreboardState.time = timeString;
            io.emit('time_tick', timeString); // Emitir solo el tiempo
        } else {
            clearInterval(timerInterval);
            console.log('¡TIEMPO FINALIZADO!');
            io.emit('time_tick', 'FIN');
            // Aquí se podría añadir lógica para avanzar a la siguiente ronda
        }
    }, 1000);
}


// Servir archivos estáticos
app.use(express.static(__dirname));

// Y añadir las rutas estáticas fuera del directorio actual (__dirname):
app.use(express.static(path.join(__dirname, '..', 'interfaz_celular')));
app.use(express.static(path.join(__dirname, '..', 'interfaz_compu')));

// Ruta raíz
app.get('/', (req, res) => {
    // Redirige al control.html de la interfaz_compu
    res.sendFile(path.join(__dirname, '..', 'interfaz_compu', 'control.html'));
});


// 4. Manejo de Conexiones Socket.IO
io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // Enviar el estado actual (incluye el tiempo) al cliente que se conecta
    socket.emit('score_updated', scoreboardState);
    socket.emit('time_tick', scoreboardState.time); // Enviar el tiempo actual

    // --- MANEJO DE EVENTOS DEL CONTROL (MÓVIL) ---

    // a) Sumar Puntuación (Patadas y Puños)
    socket.on('add_score', (data) => {
        if (data.competitor === 'A') {
            scoreboardState.scoreA += data.points;
        } else if (data.competitor === 'B') {
            scoreboardState.scoreB += data.points;
        }
        emitScoreUpdate();
    });

    // b) Añadir Penalización (Gam-Jeom)
    socket.on('add_penalty', (data) => {
        if (data.recipient === 'A') {
            scoreboardState.scoreA += 1;
            scoreboardState.penaltiesB += 1;
        } else if (data.recipient === 'B') {
            scoreboardState.scoreB += 1;
            scoreboardState.penaltiesA += 1;
        }
        emitScoreUpdate();
    });

    // c) Reiniciar Marcador
    socket.on('reset_score', () => {
        if (timerInterval) clearInterval(timerInterval); // Detener timer
        timeRemainingSeconds = TIME_LIMIT;

        scoreboardState = {
            scoreA: 0,
            scoreB: 0,
            penaltiesA: 0,
            penaltiesB: 0,
            round: 1,
            time: '2:00'
        };
        io.emit('score_reset');
        emitScoreUpdate();
        console.log('--- MARCADOR REINICIADO ---');
    });

    // d) Evento para iniciar el temporizador
    socket.on('start_timer', () => {
        if (timeRemainingSeconds <= 0) {
            timeRemainingSeconds = TIME_LIMIT;
            // Emitir el tiempo inicial
            const minutes = Math.floor(TIME_LIMIT / 60);
            const seconds = TIME_LIMIT % 60;
            scoreboardState.time = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            emitScoreUpdate();
        }
        startTimer();
        console.log('Temporizador Iniciado.');
    });

    // e) Evento para detener/pausar el temporizador
    socket.on('stop_timer', () => {
        if (timerInterval) clearInterval(timerInterval);
        console.log('Temporizador Pausado.');
    });

    socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
    });
});


// 5. Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Control (Móvil): http://localhost:${PORT}/control.html`);
    console.log(`Marcador (Pantalla): http://localhost:${PORT}/scoreboard.html`);
});