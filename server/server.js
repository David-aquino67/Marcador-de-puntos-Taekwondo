const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors'); // Importante instalar: npm install cors

const app = express();
app.use(cors()); // Permitir conexiones cruzadas

const server = http.createServer(app);

// CONFIGURACIÓN DE SOCKET.IO CON CORS
// En tu server.js, reemplaza la configuración de io por esta:
const io = require('socket.io')(server, {
    cors: {
        origin: "https://marcadoietkd.netlify.app", // Tu URL de Netlify
        methods: ["GET", "POST"],
        credentials: true
    }
});

// USAR EL PUERTO DINÁMICO DE RENDER
const PORT = process.env.PORT || 3000;

let timerInterval;
let TIME_LIMIT = 120;
let timeRemainingSeconds = TIME_LIMIT;

let scoreboardState = {
    scoreA: 0,
    scoreB: 0,
    penaltiesA: 0,
    penaltiesB: 0,
    round: 1,
    time: '2:00'
};

function emitScoreUpdate() {
    io.emit('score_updated', scoreboardState);
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timeRemainingSeconds > 0) {
            timeRemainingSeconds--;
            const minutes = Math.floor(timeRemainingSeconds / 60);
            const seconds = timeRemainingSeconds % 60;
            const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            scoreboardState.time = timeString;
            io.emit('time_tick', timeString);
        } else {
            clearInterval(timerInterval);
            io.emit('time_tick', 'FIN');
        }
    }, 1000);
}

// --- CORRECCIÓN DE RUTAS ESTÁTICAS ---
// Servir la raíz del proyecto
app.use(express.static(path.join(__dirname, '/')));

// Servir carpetas específicas si existen en la raíz
app.use('/celular', express.static(path.join(__dirname, 'interfaz_celular')));
app.use('/compu', express.static(path.join(__dirname, 'interfaz_compu')));

// Ruta por defecto para verificar que el servidor vive
app.get('/status', (req, res) => {
    res.send('Servidor IETKD Operativo');
});

io.on('connection', (socket) => {
    console.log(`Conectado: ${socket.id}`);
    socket.emit('score_updated', scoreboardState);
    socket.emit('time_tick', scoreboardState.time);

    socket.on('add_score', (data) => {
        if (data.competitor === 'A') scoreboardState.scoreA += data.points;
        else if (data.competitor === 'B') scoreboardState.scoreB += data.points;
        emitScoreUpdate();
    });

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

    socket.on('reset_score', () => {
        if (timerInterval) clearInterval(timerInterval);
        timeRemainingSeconds = TIME_LIMIT;
        scoreboardState = {
            scoreA: 0, scoreB: 0, penaltiesA: 0, penaltiesB: 0, round: 1, time: '2:00'
        };
        io.emit('score_reset');
        emitScoreUpdate();
    });

    socket.on('start_timer', () => {
        startTimer();
    });

    socket.on('stop_timer', () => {
        if (timerInterval) clearInterval(timerInterval);
    });

    socket.on('disconnect', () => {
        console.log('Desconectado');
    });
});

// ESCUCHAR EN 0.0.0.0 (Requerido por Render)
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor en puerto ${PORT}`);
});