// Selección de elementos y variables de UI
const fondo = document.querySelector('.fondo-juego');
const paleta = document.querySelector('.paleta');
const pelota = document.querySelector('.pelota');
const bloques = Array.from(document.querySelectorAll('.bloque'));
const vidasUI = document.querySelector('.vidas');
const tiempoUI = document.querySelector('.tiempo');
const scoreUI = document.querySelector('.score');
const btnPlay = document.querySelector('.btn-play');
const pantallaFin = document.querySelector('.pantalla-fin');
const btnReiniciar = document.querySelector('.btn-reiniciar');
const mensajeFin = document.querySelector('.mensaje-fin');
const pantallaProx = document.querySelector('.pantalla-prox');

// Botón siguiente nivel
let btnSiguiente = null;

// Medidas
const fondoW = 460;
const fondoH = 300;
const paletaW = 75;
const paletaH = 10;
const pelotaD = 16;
const bloqueW = 55;
const bloqueH = 20;
const filas = 5;
const columnas = 7;

// Estado
let paletaX, paletaY, pelotaX, pelotaY, dx, dy, right, left, jugando, bloquesVivos, vidas, tiempo, timerInterval, started, win, score;

function estadoInicial() {
    paletaX = (fondoW - paletaW) / 2;
    paletaY = 270;
    pelotaX = paletaX + paletaW/2 - pelotaD/2;
    pelotaY = paletaY - pelotaD;
    dx = 3 * (Math.random() > 0.5 ? 1 : -1);
    dy = -3;
    right = false;
    left = false;
    jugando = false;
    win = false;
    bloquesVivos = Array(bloques.length).fill(true);
    vidas = 3;
    tiempo = 0;
    score = 0;
    started = false;
    for (let i = 0; i < bloques.length; i++) {
        bloques[i].style.visibility = 'visible';
    }
    actualizarUI();
    dibujarPaleta();
    dibujarPelota();
}

function actualizarUI() {
    vidasUI.textContent = 'Vidas: ' + vidas;
    tiempoUI.textContent = 'Tiempo: ' + tiempo.toFixed(1) + 's';
    scoreUI.textContent = 'Score: ' + score;
}

// Posicionar bloques
for (let i = 0; i < bloques.length; i++) {
    const fila = Math.floor(i / columnas);
    const col = i % columnas;
    bloques[i].style.position = 'absolute';
    bloques[i].style.left = (20 + col * 63) + 'px';
    bloques[i].style.top = (30 + fila * 28) + 'px';
    bloques[i].style.width = bloqueW + 'px';
    bloques[i].style.height = bloqueH + 'px';
    bloques[i].style.background = '#e74c3c';
    bloques[i].style.borderRadius = '4px';
    bloques[i].style.boxShadow = '0 2px 6px #0003';
}

// Dibujar paleta y pelota
function dibujarPaleta() {
    paleta.style.position = 'absolute';
    paleta.style.left = paletaX + 'px';
    paleta.style.top = paletaY + 'px';
    paleta.style.width = paletaW + 'px';
    paleta.style.height = paletaH + 'px';
    paleta.style.background = '#3498db';
    paleta.style.borderRadius = '5px';
}
function dibujarPelota() {
    pelota.style.position = 'absolute';
    pelota.style.left = pelotaX + 'px';
    pelota.style.top = pelotaY + 'px';
    pelota.style.width = pelotaD + 'px';
    pelota.style.height = pelotaD + 'px';
    pelota.style.background = '#f39c12';
    pelota.style.borderRadius = '50%';
    pelota.style.boxShadow = '0 0 8px #f39c12aa';
}

// Movimiento de paleta con mouse
fondo.addEventListener('mousemove', e => {
    // Obtener posición relativa al fondo juego
    const rect = fondo.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    paletaX = Math.max(0, Math.min(mouseX - paletaW/2, fondoW - paletaW));
    if (!jugando && started) {
        pelotaX = paletaX + paletaW/2 - pelotaD/2;
    }
    dibujarPaleta();
    dibujarPelota();
});

// Iniciar con click en cualquier parte del fondo juego
fondo.addEventListener('click', () => {
    // Solo permitir iniciar si se dio play
    if (!started) return;
    if (!jugando) {
        jugando = true;
    }
});

function moverPaleta() {
    if (right && paletaX < fondoW - paletaW) paletaX += 7;
    if (left && paletaX > 0) paletaX -= 7;
    // Si la pelota está en la paleta y no ha iniciado, la movemos con la paleta
    if (!jugando && started) {
        pelotaX = paletaX + paletaW/2 - pelotaD/2;
    }
    dibujarPaleta();
    dibujarPelota();
}

function moverPelota() {
    if (!jugando) return;
    pelotaX += dx;
    pelotaY += dy;
    // Rebote en paredes
    if (pelotaX <= 0 || pelotaX >= fondoW - pelotaD) dx = -dx;
    if (pelotaY <= 0) dy = -dy;
    // Rebote con paleta
    if (
        pelotaY + pelotaD >= paletaY &&
        pelotaX + pelotaD > paletaX &&
        pelotaX < paletaX + paletaW &&
        dy > 0
    ) {
        dy = -Math.abs(dy);
        // Efecto según zona de la paleta
        let hit = (pelotaX + pelotaD/2) - (paletaX + paletaW/2);
        dx = hit * 0.15;
    }
    // Caída
    if (pelotaY > fondoH - pelotaD) {
        perderVida();
    }
    dibujarPelota();
}

function perderVida() {
    vidas--;
    actualizarUI();
    if (vidas === 0) {
        finJuego(false);
    } else {
        // Reset pelota y paleta
        paletaX = (fondoW - paletaW) / 2;
        paletaY = 270;
        pelotaX = paletaX + paletaW/2 - pelotaD/2;
        pelotaY = paletaY - pelotaD;
        dx = 3 * (Math.random() > 0.5 ? 1 : -1);
        dy = -3;
        jugando = false;
    }
}

function colisionBloques() {
    for (let i = 0; i < bloques.length; i++) {
        if (!bloquesVivos[i]) continue;
        const bx = parseInt(bloques[i].style.left);
        const by = parseInt(bloques[i].style.top);
        if (
            pelotaX + pelotaD > bx &&
            pelotaX < bx + bloqueW &&
            pelotaY + pelotaD > by &&
            pelotaY < by + bloqueH
        ) {
            bloques[i].style.visibility = 'hidden';
            bloquesVivos[i] = false;
            dy = -dy;
            score++;
            actualizarUI();
            if (bloquesVivos.every(v => !v)) {
                finJuego(true);
            }
            break;
        }
    }
}

function loop() {
    if (!started) return;
    moverPaleta();
    moverPelota();
    colisionBloques();
    requestAnimationFrame(loop);
}

// Cronómetro
function iniciarTimer() {
    timerInterval = setInterval(() => {
        if (jugando) {
            tiempo += 0.1;
            actualizarUI();
        }
    }, 100);
}
function pararTimer() {
    clearInterval(timerInterval);
}

// Pantalla de fin de juego
function finJuego(gano) {
    jugando = false;
    win = gano;
    pararTimer();
    if (gano) {
        pantallaFin.style.display = 'flex';
        mensajeFin.innerHTML = '¡Ganaste!';
        // Crear botón siguiente nivel
        if (!btnSiguiente) {
            btnSiguiente = document.createElement('button');
            btnSiguiente.className = 'btn-siguiente';
            btnSiguiente.textContent = 'Siguiente nivel';
            btnSiguiente.onclick = () => {
                pantallaFin.style.display = 'none';
                pantallaProx.style.display = 'flex';
                setTimeout(() => {
                    pantallaProx.style.display = 'none';
                    btnPlay.style.display = 'block';
                }, 2000);
            };
            pantallaFin.appendChild(btnSiguiente);
        }
        btnSiguiente.style.display = 'block';
    } else {
        pantallaFin.style.display = 'flex';
        mensajeFin.textContent = 'Perdiste';
        if (btnSiguiente) btnSiguiente.style.display = 'none';
    }
}

// Botón Play y Reiniciar
btnPlay.addEventListener('click', () => {
    btnPlay.style.display = 'none';
    pantallaFin.style.display = 'none';
    estadoInicial();
    started = true;
    actualizarUI();
    iniciarTimer();
    requestAnimationFrame(loop);
});
btnReiniciar.addEventListener('click', () => {
    pantallaFin.style.display = 'none';
    btnPlay.style.display = 'block';
    estadoInicial();
});

// Inicialización
btnPlay.style.display = 'block';
pantallaFin.style.display = 'none';
estadoInicial();

