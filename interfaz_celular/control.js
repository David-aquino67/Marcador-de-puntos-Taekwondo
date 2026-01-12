// Conexión con el servidor Socket.IO
// Asegúrate de que esta URL coincida con la dirección de tu servidor (ej: http://localhost:3000)
const socket = io('https://marcador-de-puntos-taekwondo.onrender.com');

// 1. Manejador de Clics para Puntuación (Patadas y Puños)
document.querySelectorAll('.score-btn:not(.penalty-btn)').forEach(button => {
    button.addEventListener('click', () => {
        const competitor = button.getAttribute('data-competitor');
        const points = parseInt(button.getAttribute('data-points'));

        // Objeto que se envía al servidor
        const data = {
            competitor: competitor, // 'A' o 'B'
            points: points          // 1, 2, o 3
        };

        // Emitir un evento al servidor
        socket.emit('add_score', data);
        console.log(`Puntuación enviada: ${competitor} +${points}`);
    });
});

// 2. Manejador de Clics para Penalizaciones (Gam-Jeom)
// Nota: En la estructura de Taekwondo, una falta suma puntos al oponente.
document.querySelectorAll('.penalty-btn').forEach(button => {
    button.addEventListener('click', () => {
        // En este caso, data-competitor indica a QUIÉN se le suma el punto (el oponente)
        const recipient = button.getAttribute('data-competitor');

        // Emitir un evento al servidor
        socket.emit('add_penalty', { recipient: recipient });
        console.log(`Falta enviada. +1 punto para Competidor ${recipient}`);
    });
});


// 3. Manejador de Clics para Reiniciar
document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres reiniciar el marcador?')) {
        // Emitir un evento de reinicio al servidor
        socket.emit('reset_score');
        console.log('Solicitud de reinicio enviada.');
    }
});

// Opcional: Mostrar un mensaje si hay un error de conexión
socket.on('connect_error', (err) => {
    console.error(`Error de conexión: ${err.message}`);
    alert('Error al conectar con el servidor de puntuación. Asegúrate de que esté funcionando.');
});