// Conexión con el servidor Socket.IO

// 1. Escuchar el evento de actualización de puntuación
// El servidor enviará un objeto con el estado COMPLETO del marcador
// scoreboard.js (VERSIÓN FINAL Y LIMPIA)

// Conexión con el servidor Socket.IO
const socket = io("https://marcador-de-puntos-taekwondo.onrender.com", {
    transports: ["websocket"],
    withCredentials: true
});

// Elementos del DOM para actualizar
const scoreAEl = document.getElementById('scoreA');
const scoreBEl = document.getElementById('scoreB');
// En el HTML tienes penaltiesA/B intercambiados, ¡pero el JS lo maneja bien!
const penaltiesAEl = document.getElementById('penaltiesA');
const penaltiesBEl = document.getElementById('penaltiesB');
const roundEl = document.getElementById('round');
const timerEl = document.getElementById('timer');


// 1. Escuchar la Actualización Completa del Marcador
socket.on('score_updated', (scores) => {
    console.log('Marcador actualizado recibido:', scores);

    // Actualizar Puntuaciones
    scoreAEl.textContent = scores.scoreA;
    scoreBEl.textContent = scores.scoreB;

    // Actualizar Faltas/Penalizaciones (Puntos ganados por faltas del oponente)
    penaltiesAEl.textContent = scores.penaltiesA; // Puntos ganados por faltas de B
    penaltiesBEl.textContent = scores.penaltiesB; // Puntos ganados por faltas de A

    // Sincronizar el tiempo (útil al conectar)
    timerEl.textContent = scores.time;

    // Remover cualquier color de error o fin
    timerEl.style.color = 'white';
});


// 2. Escuchar el Tick del Temporizador (Actualización cada segundo)
socket.on('time_tick', (time) => {
    timerEl.textContent = time;

    // Lógica visual para el final del tiempo
    if (time === 'FIN') {
        timerEl.style.color = 'red';
    } else {
        timerEl.style.color = 'white';
    }
});


// 3. Escuchar el Evento de Reinicio
socket.on('score_reset', () => {
    scoreAEl.textContent = 0;
    scoreBEl.textContent = 0;
    penaltiesAEl.textContent = 0;
    penaltiesBEl.textContent = 0;
    roundEl.textContent = 1;
    timerEl.textContent = '2:00';
    timerEl.style.color = 'white';
    console.log('Marcador Reiniciado.');
});


// Mensajes de conexión (Opcional, pero útil)
socket.on('connect', () => {
    console.log('Conectado al servidor de puntuación.');
});

socket.on('disconnect', () => {
    console.log('Desconectado del servidor de puntuación.');
    timerEl.textContent = 'CONEXIÓN PERDIDA';
    timerEl.style.color = 'yellow'; // Usar amarillo para advertencia de conexión
});
// 3. Escuchar el evento de tiempo (Si el servidor maneja el temporizador)
// socket.on('time_tick', (time) => {
//     timerEl.textContent = time;
// });


// Mensajes de conexión
socket.on('connect', () => {
    console.log('Conectado al servidor de puntuación.');
});

socket.on('disconnect', () => {
    console.log('Desconectado del servidor de puntuación.');
    // Muestra un mensaje de advertencia visual para el público
    timerEl.textContent = 'CONEXIÓN PERDIDA';
    timerEl.style.color = 'red';
});
// En scoreboard.js
socket.on('time_tick', (time) => {
    timerEl.textContent = time;
});