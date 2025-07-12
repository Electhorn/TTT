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
  const marcadorX = document.getElementById("marcador-x");
  const marcadorO = document.getElementById("marcador-o");
  // CORRECCIÓN: Capturamos el botón del menú aquí, de forma segura. El ID en el HTML es 'btn-home'.
  const btnHome = document.getElementById("btn-home");

  // --- Estado del Juego ---
  let modoJuego;
  let dificultad;
  let turnoActual;
  let estadoTablero;
  let juegoTerminado;
  let esperandoTurnoMaquina;
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
  // 2. LÓGICA DE NAVEGACIÓN Y CONFIGURACIÓN
  // =================================================================

  function configurarModoJuego(modo) {
    modoJuego = modo;
    if (modo === "pvp") {
      iniciarPartida();
    } else {
      selectorDificultad.classList.remove("oculto");
      btnPVC.classList.add("seleccionado");
      btnPVP.classList.remove("seleccionado");
    }
  }

  function iniciarPartida() {
    pantallaSetup.classList.remove("activo");
    pantallaSetup.classList.add("desvaneciendo");
    pantallaSetup.addEventListener(
      "animationend",
      () => {
        pantallaSetup.classList.add("oculto");
        pantallaSetup.classList.remove("desvaneciendo");
        pantallaJuego.classList.remove("oculto");
        pantallaJuego.classList.add("activo");
      },
      { once: true }
    );

    etiquetaJugadorX.textContent = "Jugador X";
    etiquetaJugadorO.textContent =
      modoJuego === "pvc" ? "Máquina" : "Jugador O";
    puntajeX = 0;
    puntajeO = 0;
    puntajeXDisplay.textContent = puntajeX;
    puntajeODisplay.textContent = puntajeO;
    reiniciarRonda();
  }

  // CORRECCIÓN: Una única función para volver al menú, ahora funciona correctamente.
  function volverAlMenu() {
    pantallaJuego.classList.remove("activo");
    pantallaJuego.classList.add("desvaneciendo");
    pantallaJuego.addEventListener(
      "animationend",
      () => {
        pantallaJuego.classList.add("oculto"); // Corregido: .classList.add
        pantallaJuego.classList.remove("desvaneciendo");
        pantallaSetup.classList.remove("oculto", "desvaneciendo");
        pantallaSetup.classList.add("activo");
        btnPVC.classList.remove("seleccionado");
        selectorDificultad.classList.add("oculto");
      },
      { once: true }
    );
  }

  // =================================================================
  // 3. LÓGICA DEL JUEGO (reiniciar, actualizar, finalizar, etc.)
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
    actualizarMarcadorActivo();
  }

  function actualizarCelda(indice, jugador) {
    estadoTablero[indice] = jugador;
    celdas[indice].textContent = jugador;
    celdas[indice].classList.add(jugador);
  }

  function verificarGanador() {
    let rondaGanada = false;
    for (const combinacion of combinacionesGanadoras) {
      if (
        combinacion.every(
          (index) =>
            estadoTablero[index] === estadoTablero[combinacion[0]] &&
            estadoTablero[index] !== ""
        )
      ) {
        finalizarJuego(false, estadoTablero[combinacion[0]], combinacion);
        rondaGanada = true;
        return;
      }
    }
    if (!rondaGanada && !estadoTablero.includes("")) {
      finalizarJuego(true);
    }
  }

  function finalizarJuego(esEmpate, ganador = null, combinacion = []) {
    juegoTerminado = true;
    actualizarMarcadorActivo(); // Apaga ambos marcadores
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

  function actualizarMarcadorActivo() {
    if (juegoTerminado) {
      marcadorX.classList.remove("marcador-activo");
      marcadorO.classList.remove("marcador-activo");
      return;
    }
    if (turnoActual === "X") {
      marcadorX.classList.add("marcador-activo");
      marcadorO.classList.remove("marcador-activo");
    } else {
      marcadorO.classList.add("marcador-activo");
      marcadorX.classList.remove("marcador-activo");
    }
  }

  // =================================================================
  // 4. CONTROLADOR DE TURNOS
  // =================================================================

  function procesarClickHumano(evento) {
    // CORRECCIÓN: La condición ahora solo comprueba si el juego terminó o si la IA está pensando.
    if (juegoTerminado || esperandoTurnoMaquina) return;

    const celdaClicada = evento.currentTarget;
    const indice = parseInt(celdaClicada.id) - 1;

    if (estadoTablero[indice] !== "") return;

    // El movimiento se realiza con el 'turnoActual' (sea 'X' o 'O')
    actualizarCelda(indice, turnoActual);
    verificarGanador();

    if (!juegoTerminado) {
      siguienteTurno();
    }
  }
  function siguienteTurno() {
    // Cambia el jugador
    turnoActual = turnoActual === "X" ? "O" : "X";

    // Actualiza UI
    actualizarMarcadorActivo();

    // CORRECCIÓN: La lógica de la IA ahora está contenida aquí dentro
    if (modoJuego === "pvc" && turnoActual === "O") {
      turnoDisplay.textContent = `Turno de la Máquina...`;
      esperandoTurnoMaquina = true;
      tablero.classList.add("esperando-ia");
      setTimeout(jugarMaquina, 500);
    } else {
      // Para modo JvJ o el turno del humano en JvM
      const proximoJugador =
        turnoActual === "X"
          ? etiquetaJugadorX.textContent
          : etiquetaJugadorO.textContent;
      turnoDisplay.textContent = `Turno de ${proximoJugador}`;
      tablero.classList.toggle("turno-x");
      tablero.classList.toggle("turno-o");
    }
  }

  // =================================================================
  // 5. LÓGICA DE INTELIGENCIA ARTIFICIAL
  // =================================================================

  function jugarMaquina() {
    if (juegoTerminado || turnoActual !== "O") return;
    const indiceElegido = elegirMovimientoIA();
    if (indiceElegido !== null) {
      actualizarCelda(indiceElegido, "O");
      verificarGanador();
    }
    esperandoTurnoMaquina = false;
    tablero.classList.remove("esperando-ia");
    if (!juegoTerminado) {
      turnoActual = "X";
      actualizarMarcadorActivo();
      turnoDisplay.textContent = `Turno de ${etiquetaJugadorX.textContent}`;
      tablero.classList.replace("turno-o", "turno-x");
    }
  }

  function elegirMovimientoIA() {
    if (dificultad === "dificil") return obtenerMejorMovimiento();
    if (dificultad === "normal") {
      const movimientoGanador = encontrarMovimientoGanador("O");
      if (movimientoGanador !== null) return movimientoGanador;
      const movimientoDeBloqueo = encontrarMovimientoGanador("X");
      if (movimientoDeBloqueo !== null) return movimientoDeBloqueo;
      return movimientoEstrategico();
    }
    return movimientoAleatorio();
  }

  function encontrarMovimientoGanador(jugador) {
    for (const combinacion of combinacionesGanadoras) {
      const [a, b, c] = combinacion;
      if (
        estadoTablero[a] === jugador &&
        estadoTablero[b] === jugador &&
        estadoTablero[c] === ""
      )
        return c;
      if (
        estadoTablero[a] === jugador &&
        estadoTablero[c] === jugador &&
        estadoTablero[b] === ""
      )
        return b;
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
    if (estadoTablero[centro] === "") return centro;
    const esquinasLibres = esquinas.filter(
      (indice) => estadoTablero[indice] === ""
    );
    if (esquinasLibres.length > 0) {
      return esquinasLibres[Math.floor(Math.random() * esquinasLibres.length)];
    }
    const lados = [1, 3, 5, 7];
    const ladosLibres = lados.filter((indice) => estadoTablero[indice] === "");
    if (ladosLibres.length > 0) {
      return ladosLibres[Math.floor(Math.random() * ladosLibres.length)];
    }
    return movimientoAleatorio(); // Fallback por si todo está lleno
  }

  function movimientoAleatorio() {
    const celdasVacias = [];
    estadoTablero.forEach((valor, index) => {
      if (valor === "") celdasVacias.push(index);
    });
    if (celdasVacias.length > 0) {
      return celdasVacias[Math.floor(Math.random() * celdasVacias.length)];
    }
    return null;
  }

  // --- Lógica Minimax ---
  function chequearGanador(tablero, jugador) {
    for (const combinacion of combinacionesGanadoras) {
      if (combinacion.every((index) => tablero[index] === jugador)) return true;
    }
    return false;
  }

  function obtenerMejorMovimiento() {
    let mejorScore = -Infinity;
    let mejorMovimiento = null;
    estadoTablero.forEach((celda, indice) => {
      if (celda === "") {
        estadoTablero[indice] = "O";
        let score = minimax(estadoTablero, 0, false);
        estadoTablero[indice] = "";
        if (score > mejorScore) {
          mejorScore = score;
          mejorMovimiento = indice;
        }
      }
    });
    return mejorMovimiento;
  }

  function minimax(tableroActual, profundidad, esMaximizador) {
    if (chequearGanador(tableroActual, "O")) return 10 - profundidad;
    if (chequearGanador(tableroActual, "X")) return profundidad - 10;
    if (!tableroActual.includes("")) return 0;

    let mejorScore = esMaximizador ? -Infinity : Infinity;
    tableroActual.forEach((celda, indice) => {
      if (celda === "") {
        tableroActual[indice] = esMaximizador ? "O" : "X";
        let score = minimax(tableroActual, profundidad + 1, !esMaximizador);
        tableroActual[indice] = "";
        mejorScore = esMaximizador
          ? Math.max(mejorScore, score)
          : Math.min(mejorScore, score);
      }
    });
    return mejorScore;
  }

  // =================================================================
  // 6. REGISTRO DE EVENT LISTENERS E INICIO
  // =================================================================
  btnPVP.addEventListener("click", () => configurarModoJuego("pvp"));
  btnPVC.addEventListener("click", () => configurarModoJuego("pvc"));
  btnIniciarJuego.addEventListener("click", iniciarPartida);
  document.querySelectorAll('input[name="dificultad"]').forEach((radio) => {
    radio.addEventListener("change", (e) => (dificultad = e.target.value));
  });

  celdas.forEach((celda) =>
    celda.addEventListener("click", procesarClickHumano)
  );
  reiniciarBtn.addEventListener("click", reiniciarRonda);
  // CORRECCIÓN FINAL: El listener ahora está dentro del DOMContentLoaded
  btnHome.addEventListener("click", volverAlMenu);
});
