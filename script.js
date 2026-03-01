/* ================================================
   OPERACIÓN KAIPIRIÑA – script.js
   ================================================ */

let preguntaActual = 0;
let fallos = 0;                 // contador de fallos totales
let fallosEstaRonda = 0;        // fallos en la pregunta actual (para reset visual)
let esperandoRespuesta = false; // bloqueo anti-click rápido

// Posición X actual de los personajes (en fracción 0-1 del ancho disponible)
// 6 preguntas → 6 saltos; cada salto ocupa ~1/8 del ancho del contenedor
const TOTAL_PREGUNTAS = 6;

// --- ARRAY DE PREGUNTAS ---
const preguntas = [
    {
        p: "¿Qué hacía una de Jaén en Donosti cuando nos conocimos?",
        o: ["Estudiar (y buscar el mejor pintxo)", "Perderse buscando olivos"],
        c: 0,
        m: "¡Casi! Fui a estudiar, pero acabé encontrando algo mejor."
    },
    {
        p: "Aunque nuestra relación empezó hace un año, ¿donde fue la primera vez que estuvimos cerca sin saberlo?",
        o: ["Lietuva", "En el dabadaba viendo al xiyo"],
        c: 0,
        m: "Upsis nop! Pero es hot que la primera persona de Jaén que conocieras fuera esa..."
    },
    {
        p: "Si mezclamos una bebida brasileña con el sentimiento vasco, sale una...",
        o: ["resaca loca", "Ikurriña"],
        c: 1,
        m: "¿Perdona? ¡Es la mítica Kaipiriña-Ikurriña!"
    },
    {
        p: "¿Qué frase en Euskera me enseñaste primero?",
        o: ["Garagardo bat", "Maite zaitut"],
        c: 0,
        m: "Bueno, a dia de hoy me sigues diciendo primero eso..."
    },
    {
        p: "¿Quien va a ser quien nos lleve de aventura a Brasil?",
        o: ["GH", "Una mujer piloto"],
        c: 1,
        m: "Gran Hermano nos mataría antes que la mujer..."
    },
    {
        p: "En agosto, ¿qué cambiamos por el Txakoli y la Cerveza?",
        o: ["Kaipiriña", "Aceite"],
        c: 0,
        m: "¡Kaipiriña! Aunque el aceite de Jaén me lo llevo en la maleta."
    }
];

// --- REFERENCIAS AL DOM ---
const gameContainer = document.getElementById('game-container');
const pjsContainer = document.getElementById('pjs-container');
const imgMaite = document.getElementById('pj-maite');
const imgManex = document.getElementById('pj-manex');
const mensajeErrorDiv = document.getElementById('mensaje-error');
const textoErrorSpan = document.getElementById('texto-error');
const barraProgreso = document.getElementById('barra-progreso');
const progresoTexto = document.getElementById('progreso-texto');

// --- UTILIDAD: actualizar barra de progreso ---
function actualizarProgreso() {
    const pct = (preguntaActual / preguntas.length) * 100;
    barraProgreso.style.width = pct + '%';
    progresoTexto.textContent = preguntaActual + ' / ' + preguntas.length;
}

// --- POSICIÓN DE LOS PERSONAJES ---
// Distribuimos los personajes a lo largo del ancho del contenedor.
// El primer personaje empieza casi en el borde izquierdo (paso 0)
// y llega casi al borde derecho al terminar (paso TOTAL_PREGUNTAS).
// Usamos el ANCHO del elemento #escena para calcular px reales.
function moverPersonajes() {
    const escena = document.getElementById('escena');
    const anchoEscena = escena.offsetWidth;        // px reales disponibles
    const anchoPjs = pjsContainer.offsetWidth;     // ancho del grupo de imágenes
    const margen = 12;                              // px de margen a cada lado

    // Rango total de movimiento posible
    const rangoTotal = anchoEscena - anchoPjs - margen * 2;

    // Paso actual (0 = inicio, TOTAL_PREGUNTAS = final)
    const pasoX = preguntaActual;                  // ya incrementado antes de llamar
    const nuevaLeft = margen + (rangoTotal / TOTAL_PREGUNTAS) * pasoX;

    pjsContainer.style.left = Math.round(nuevaLeft) + 'px';
}

// --- INICIAR JUEGO ---
function iniciarJuego() {
    preguntaActual = 0;
    fallos = 0;
    esperandoRespuesta = false;

    gameContainer.classList.remove('fondo-inicio');
    gameContainer.classList.add('fondo-juego');

    document.getElementById('pantalla-inicio').classList.add('hidden');
    document.getElementById('pantalla-juego').classList.remove('hidden');

    // Posición inicial (paso 0)
    moverPersonajes();
    actualizarProgreso();
    cargarPregunta();
}

// --- CARGAR PREGUNTA ACTUAL ---
function cargarPregunta() {
    const q = preguntas[preguntaActual];
    document.getElementById('texto-pregunta').innerText = q.p;

    const opcionesDiv = document.getElementById('opciones');
    opcionesDiv.innerHTML = '';

    q.o.forEach((opcion, index) => {
        const btn = document.createElement('button');
        btn.innerText = opcion;
        btn.onclick = () => verificarRespuesta(index, btn);
        opcionesDiv.appendChild(btn);
    });

    // Ocultar mensaje de error si visible
    mensajeErrorDiv.classList.add('hidden');
    esperandoRespuesta = false;
}

// --- LÓGICA PRINCIPAL ---
function verificarRespuesta(indiceSeleccionado, btnPulsado) {
    if (esperandoRespuesta) return;  // evitar doble-click
    esperandoRespuesta = true;

    const q = preguntas[preguntaActual];

    if (indiceSeleccionado === q.c) {
        // ✅ CORRECTO
        imgMaite.src = 'dibujos/maite/maite_feliz.gif';
        imgManex.src = 'dibujos/manex/manex_feliz.gif';

        // Ocultar error si estaba visible
        mensajeErrorDiv.classList.add('hidden');

        // Salto: quitar y volver a añadir clase para re-trigger
        pjsContainer.classList.remove('animacion-feliz');
        void pjsContainer.offsetWidth; // forzar reflow
        pjsContainer.classList.add('animacion-feliz');

        preguntaActual++;
        actualizarProgreso();
        moverPersonajes();

        setTimeout(() => {
            pjsContainer.classList.remove('animacion-feliz');

            if (preguntaActual < preguntas.length) {
                imgMaite.src = 'dibujos/maite/maite_neutral.png';
                imgManex.src = 'dibujos/manex/manex_neutral.png';
                cargarPregunta();
            } else {
                finalizarJuego();
            }
        }, 900);

    } else {
        // ❌ INCORRECTO
        fallos++;
        imgMaite.src = 'dibujos/maite/maite_triste.gif';
        imgManex.src = 'dibujos/manex/manex_triste.gif';

        // Feedback visual en el botón pulsado
        btnPulsado.classList.add('btn-fallado');

        // Mostrar mensaje de error
        textoErrorSpan.innerText = q.m;
        mensajeErrorDiv.classList.remove('hidden');

        setTimeout(() => {
            mensajeErrorDiv.classList.add('hidden');

            // Restaurar caras neutras
            imgMaite.src = 'dibujos/maite/maite_neutral.png';
            imgManex.src = 'dibujos/manex/manex_neutral.png';

            // Quitar feedback visual del botón
            btnPulsado.classList.remove('btn-fallado');
            btnPulsado.classList.add('btn-incorrecto');

            esperandoRespuesta = false; // permitir reintentar
        }, 2500);
    }
}

// --- FIN DEL JUEGO ---
function finalizarJuego() {
    setTimeout(() => {
        gameContainer.classList.remove('fondo-juego');
        gameContainer.classList.add('fondo-final');

        document.getElementById('pantalla-juego').classList.add('hidden');
        document.getElementById('pantalla-final').classList.remove('hidden');

        // Mostrar puntuación
        const puntuacionEl = document.getElementById('puntuacion-final');
        if (fallos === 0) {
            puntuacionEl.textContent = '⭐ ¡Perfecto! 6/6 a la primera';
        } else if (fallos === 1) {
            puntuacionEl.textContent = `✨ Solo 1 fallo — casi perfectos`;
        } else {
            puntuacionEl.textContent = `💪 ${fallos} ${fallos === 1 ? 'fallo' : 'fallos'} en el camino`;
        }
    }, 800);
}