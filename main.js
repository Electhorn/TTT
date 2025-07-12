document.addEventListener("DOMContentLoaded", () => {
  // =================================================================
  // 1. CAPTURA DE ELEMENTOS Y ESTADO GLOBAL
  // =================================================================

  // --- Elementos de UI ---
  const pantallaSetup = document.getElementById("pantalla-setup");
  const pantallaJuego = document.getElementById("pantalla-juego");
  const btnPVP = document.getElementById("btn-pvp");
  const btnPVC = document.getElementById("btn-pvc");
  const selectorDificultad = document.getElementById("selector-dificultad");
  const btnIniciarJuego = document.getElementById("btn-iniciar-juego");
  const celdas = document.querySelectorAll(".cuadro");
  const turnoDisplay = document.getElementById("turno");
  const puntajeXDisplay = document.getElementById("puntajeX");
  const puntajeODisplay = document.getElementById("puntajeO");
  const tablero = document.getElementById("tablero");
  const reiniciarBtn = document.getElementById("reiniciar");
  const etiquetaJugadorX = document.getElementById("etiqueta-jugador-x");
  const etiquetaJugadorO = document.getElementById("etiqueta-jugador-o");

  // --- Estado del Juego ---
  let modoJuego;
  let dificultad;
  let turnoActual;
  let estadoTablero;
  let juegoTerminado;
  let esperandoTurnoMaquina; // Bandera para bloquear clics (Etapa 2 y 6)
  let puntajeX;
  let puntajeO;

  const combinacionesGanadoras = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // =================================================================
  // 2. LÓGICA DE CONFIGURACIÓN Y MENÚ PRINCIPAL
  // =================================================================

  function configurarModoJuego(modo) {
    modoJuego = modo;
    if (modo === "pvp") {
      iniciarPartida();
    } else {
      // modo 'pvc'
      selectorDificultad.classList.remove("oculto");
      btnPVC.classList.add("seleccionado");
      btnPVP.classList.remove("seleccionado");
    }
  }

  function iniciarPartida() {
    pantallaSetup.classList.add("oculto");
    pantallaJuego.classList.remove("oculto");

    etiquetaJugadorX.textContent = "Jugador X";
    etiquetaJugadorO.textContent =
      modoJuego === "pvc" ? "Máquina" : "Jugador O";

    puntajeX = 0;
    puntajeO = 0;
    puntajeXDisplay.textContent = puntajeX;
    puntajeODisplay.textContent = puntajeO;

    reiniciarRonda();
  }

  // =================================================================
  // 3. LÓGICA DEL TABLERO Y JUEGO (Simula tablero.js)
  // =================================================================

  function reiniciarRonda() {
    juegoTerminado = false;
    esperandoTurnoMaquina = false;
    turnoActual = "X";
    estadoTablero = Array(9).fill("");

    turnoDisplay.textContent = `Turno de ${etiquetaJugadorX.textContent}`;

    celdas.forEach((celda) => {
      celda.textContent = "";
      celda.classList.remove("X", "O", "celda-ganadora");
    });

    tablero.classList.remove("turno-o", "esperando-ia");
    tablero.classList.add("turno-x");
  }

  // Función centralizada para actualizar la UI y el estado (Etapa 4)
  function actualizarCelda(indice, jugador) {
    estadoTablero[indice] = jugador;
    celdas[indice].textContent = jugador;
    celdas[indice].classList.add(jugador);
  }

  function verificarGanador() {
    let rondaGanada = false;
    for (const combinacion of combinacionesGanadoras) {
      const [a, b, c] = combinacion;
      if (
        estadoTablero[a] &&
        estadoTablero[a] === estadoTablero[b] &&
        estadoTablero[a] === estadoTablero[c]
      ) {
        finalizarJuego(false, estadoTablero[a], combinacion);
        rondaGanada = true;
        return;
      }
    }

    if (!rondaGanada && !estadoTablero.includes("")) {
      finalizarJuego(true); // Empate
    }
  }

  function finalizarJuego(esEmpate, ganador = null, combinacion = []) {
    juegoTerminado = true;

    if (esEmpate) {
      turnoDisplay.textContent = "¡Es un empate!";
    } else {
      turnoDisplay.textContent = `¡Ganador: ${
        ganador === "X"
          ? etiquetaJugadorX.textContent
          : etiquetaJugadorO.textContent
      }!`;
      if (ganador === "X") puntajeX++;
      else puntajeO++;
      puntajeXDisplay.textContent = puntajeX;
      puntajeODisplay.textContent = puntajeO;
      combinacion.forEach((index) =>
        celdas[index].classList.add("celda-ganadora", ganador)
      );
    }
  }

  // =================================================================
  // 4. CONTROLADOR DE TURNOS (El "director de orquesta")
  // =================================================================

  function procesarClickHumano(evento) {
    // Bloquea clics si no es turno del humano o el juego terminó (Etapa 6)
    if (turnoActual !== "X" || juegoTerminado || esperandoTurnoMaquina) {
      return;
    }

    const celdaClicada = evento.currentTarget;
    const indice = parseInt(celdaClicada.id) - 1;

    if (estadoTablero[indice] !== "") {
      return;
    }

    // El humano (X) hace su jugada
    actualizarCelda(indice, "X");
    verificarGanador();

    // Pasa al siguiente turno
    siguienteTurno();
  }

  function siguienteTurno() {
    if (juegoTerminado) return;

    // Cambia el turno lógico
    turnoActual = "O";
    turnoDisplay.textContent = `Turno de ${etiquetaJugadorO.textContent}`;
    tablero.classList.replace("turno-x", "turno-o");

    // Si estamos en modo PVC, es turno de la máquina (Etapa 2)
    if (modoJuego === "pvc") {
      esperandoTurnoMaquina = true;
      tablero.classList.add("esperando-ia");

      // Llama a la IA con un retardo para realismo (Etapa 5)
      setTimeout(jugarMaquina, 500);
    }
  }

  // =================================================================
  // 5. LÓGICA DE INTELIGENCIA ARTIFICIAL (Simula ia.js)
  // =================================================================

  function jugarMaquina() {
    if (juegoTerminado || turnoActual !== "O") return;

    console.log("IA: Pensando jugada...");
    const indiceElegido = elegirMovimientoIA();

    if (indiceElegido !== null) {
      console.log(`IA: Jugando en la celda ${indiceElegido + 1}`);
      actualizarCelda(indiceElegido, "O");
      verificarGanador();
    }

    esperandoTurnoMaquina = false;
    tablero.classList.remove("esperando-ia");

    if (!juegoTerminado) {
      turnoActual = "X";
      turnoDisplay.textContent = `Turno de ${etiquetaJugadorX.textContent}`;
      tablero.classList.replace("turno-o", "turno-x");
    }
  }

  function elegirMovimientoIA() {
    if (dificultad === "facil") {
      return movimientoAleatorio();
    }
    if (dificultad === "normal") {
      // Prioridad 1: Intentar ganar
      const movimientoGanador = encontrarMovimientoGanador("O");
      if (movimientoGanador !== null) {
        console.log(
          "IA (Normal): Decisión -> GANAR. Jugando en",
          movimientoGanador + 1
        );
        return movimientoGanador;
      }

      // Prioridad 2: Bloquear al oponente
      const movimientoDeBloqueo = encontrarMovimientoGanador("X");
      if (movimientoDeBloqueo !== null) {
        console.log(
          "IA (Normal): Decisión -> BLOQUEAR. Jugando en",
          movimientoDeBloqueo + 1
        );
        return movimientoDeBloqueo;
      }

      // Prioridad 3: Movimiento estratégico
      console.log("IA (Normal): Decisión -> ESTRATÉGICO.");
      return movimientoEstrategico();
    }
    if (dificultad === "dificil") {
      console.log("IA (Difícil): Calculando el movimiento perfecto...");
      // **AQUÍ CONECTAMOS MINIMAX**
      return obtenerMejorMovimiento();
    }

    // Fallback para dificultad "fácil"
    return movimientoAleatorio();
  }

  function obtenerMejorMovimiento() {
    let mejorScore = -Infinity;
    let mejorMovimiento = null;

    // Itera solo sobre las celdas vacías del tablero REAL.
    estadoTablero.forEach((celda, indice) => {
      if (celda === "") {
        // 1. Simula la jugada
        estadoTablero[indice] = "O";

        // 2. Llama a minimax para obtener el score de esa jugada
        const score = minimax(estadoTablero, 0, false);

        // 3. Deshaz la jugada
        estadoTablero[indice] = "";

        // 4. Si el score actual es mejor que el mejor score guardado, actualízalo
        if (score > mejorScore) {
          mejorScore = score;
          mejorMovimiento = indice;
        }
      }
    });

    console.log(
      `IA (Difícil): El mejor movimiento es la celda ${
        mejorMovimiento + 1
      } con un score de ${mejorScore}`
    );
    return mejorMovimiento;
  }

  function minimax(tableroActual, profundidad, esMaximizador) {
    if (chequearGanador(tableroActual, "O")) {
      // Gana la IA
      return 10 - profundidad;
    }
    if (chequearGanador(tableroActual, "X")) {
      // Gana el Humano
      return profundidad - 10;
    }
    if (!tableroActual.includes("")) {
      // Empate
      return 0;
    }

    if (esMaximizador) {
      let mejorScore = -Infinity;
      tableroActual.forEach((celda, indice) => {
        if (celda === "") {
          tableroActual[indice] = "O";
          const score = minimax(tableroActual, profundidad + 1, false);
          tableroActual[indice] = "";
          mejorScore = Math.max(mejorScore, score);
        }
      });
      return mejorScore;
    } else {
      let mejorScore = Infinity;
      tableroActual.forEach((celda, indice) => {
        if (celda === "") {
          tableroActual[indice] = "X";
          const score = minimax(tableroActual, profundidad + 1, true);
          tableroActual[indice] = "";
          mejorScore = Math.min(mejorScore, score);
        }
      });
      return mejorScore;
    }
  }
  // --- FUNCIONES DE AYUDA DE LA IA (HERMANAS, NO ANIDADAS) ---

  // CORRECCIÓN 1: La función ahora acepta el parámetro "jugador"
  function encontrarMovimientoGanador(jugador) {
    for (const combinacion of combinacionesGanadoras) {
      const [a, b, c] = combinacion;
      // Caso 1: Vacío en C
      if (
        estadoTablero[a] === jugador &&
        estadoTablero[b] === jugador &&
        estadoTablero[c] === ""
      )
        return c;
      // Caso 2: Vacío en B
      if (
        estadoTablero[a] === jugador &&
        estadoTablero[c] === jugador &&
        estadoTablero[b] === ""
      )
        return b;
      // Caso 3: Vacío en A
      if (
        estadoTablero[b] === jugador &&
        estadoTablero[c] === jugador &&
        estadoTablero[a] === ""
      )
        return a;
    }
    return null;
  }

  function movimientoEstrategico() {
    const centro = 4;
    const esquinas = [0, 2, 6, 8];
    const lados = [1, 3, 5, 7];

    // Jugar en el centro si está libre
    if (estadoTablero[centro] === "") return centro;

    // Jugar en una esquina libre
    const esquinasLibres = esquinas.filter(
      (indice) => estadoTablero[indice] === ""
    );
    if (esquinasLibres.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * esquinasLibres.length);
      return esquinasLibres[indiceAleatorio];
    }

    // Jugar en un lado libre
    const ladosLibres = lados.filter((indice) => estadoTablero[indice] === "");
    if (ladosLibres.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * ladosLibres.length);
      return ladosLibres[indiceAleatorio];
    }

    return null; // No debería ocurrir si el juego no ha terminado
  }

  function movimientoAleatorio() {
    const celdasVacias = [];
    estadoTablero.forEach((valor, index) => {
      if (valor === "") celdasVacias.push(index);
    });

    if (celdasVacias.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * celdasVacias.length);
      return celdasVacias[indiceAleatorio];
    }

    return null;
  }

  function chequearGanador(tablero, jugador) {
    for (const combinacion of combinacionesGanadoras) {
      // 'every' comprueba si TODOS los elementos en la combinación cumplen la condición.
      if (combinacion.every((index) => tablero[index] === jugador)) {
        return true; // Hay un ganador
      }
    }
    return false; // No hay ganador
  }

  // =================================================================
  // 6. REGISTRO DE EVENT LISTENERS E INICIO
  // =================================================================

  // Menú
  btnPVP.addEventListener("click", () => configurarModoJuego("pvp"));
  btnPVC.addEventListener("click", () => configurarModoJuego("pvc"));
  document.querySelectorAll('input[name="dificultad"]').forEach((radio) => {
    radio.addEventListener("change", (e) => (dificultad = e.target.value));
  });
  btnIniciarJuego.addEventListener("click", iniciarPartida);

  // Juego
  celdas.forEach((celda) =>
    celda.addEventListener("click", procesarClickHumano)
  );
  reiniciarBtn.addEventListener("click", reiniciarRonda);
});
