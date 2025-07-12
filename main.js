document.addEventListener("DOMContentLoaded", () => {
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
  const btnMenu = document.getElementById("btn-menu");
  const marcadorX = document.getElementById("marcador-x");
  const marcadorO = document.getElementById("marcador-o");

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
    pantallaSetup.classList.add("desvaneciendo");
    pantallaSetup.addEventListener(
      "animationend",
      () => {
        pantallaSetup.classList.remove("activo");
        pantallaSetup.classList.add("oculto");
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
    actualizarMarcadorActivo();
  }
  btnMenu.addEventListener("click", () => {
    pantallaJuego.classList.remove("activo");

    pantallaJuego.classList.add("desvaneciendo");

    pantallaJuego.addEventListener(
      "animationend",
      () => {
        pantallaJuego.classList.remove("desvaneciendo");
        pantallaJuego.classList.add("oculto");

        pantallaSetup.classList.remove("oculto", "desvaneciendo");
        pantallaSetup.classList.add("activo");

        btnPVC.classList.remove("seleccionado");
        selectorDificultad.classList.add("oculto");
      },
      { once: true }
    );
  });

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
      finalizarJuego(true);
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

  function procesarClickHumano(evento) {
    if (turnoActual !== "X" || juegoTerminado || esperandoTurnoMaquina) {
      return;
    }

    const celdaClicada = evento.currentTarget;
    const indice = parseInt(celdaClicada.id) - 1;

    if (estadoTablero[indice] !== "") {
      return;
    }

    actualizarCelda(indice, "X");
    verificarGanador();

    siguienteTurno();
  }

  function siguienteTurno() {
    if (juegoTerminado) return;

    turnoActual = "O";
    turnoDisplay.textContent = `Turno de ${etiquetaJugadorO.textContent}`;
    tablero.classList.replace("turno-x", "turno-o");

    if (modoJuego === "pvc") {
      esperandoTurnoMaquina = true;
      tablero.classList.add("esperando-ia");

      setTimeout(jugarMaquina, 500);
    }
    actualizarMarcadorActivo();
  }

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
      const movimientoGanador = encontrarMovimientoGanador("O");
      if (movimientoGanador !== null) {
        console.log(
          "IA (Normal): Decisión -> GANAR. Jugando en",
          movimientoGanador + 1
        );
        return movimientoGanador;
      }

      const movimientoDeBloqueo = encontrarMovimientoGanador("X");
      if (movimientoDeBloqueo !== null) {
        console.log(
          "IA (Normal): Decisión -> BLOQUEAR. Jugando en",
          movimientoDeBloqueo + 1
        );
        return movimientoDeBloqueo;
      }

      console.log("IA (Normal): Decisión -> ESTRATÉGICO.");
      return movimientoEstrategico();
    }
    if (dificultad === "dificil") {
      console.log("IA (Difícil): Calculando el movimiento perfecto...");

      return obtenerMejorMovimiento();
    }

    return movimientoAleatorio();
  }

  function obtenerMejorMovimiento() {
    let mejorScore = -Infinity;
    let mejorMovimiento = null;

    estadoTablero.forEach((celda, indice) => {
      if (celda === "") {
        estadoTablero[indice] = "O";

        const score = minimax(estadoTablero, 0, false);

        estadoTablero[indice] = "";

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
      return 10 - profundidad;
    }
    if (chequearGanador(tableroActual, "X")) {
      return profundidad - 10;
    }
    if (!tableroActual.includes("")) {
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
    const lados = [1, 3, 5, 7];

    if (estadoTablero[centro] === "") return centro;

    const esquinasLibres = esquinas.filter(
      (indice) => estadoTablero[indice] === ""
    );
    if (esquinasLibres.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * esquinasLibres.length);
      return esquinasLibres[indiceAleatorio];
    }

    const ladosLibres = lados.filter((indice) => estadoTablero[indice] === "");
    if (ladosLibres.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * ladosLibres.length);
      return ladosLibres[indiceAleatorio];
    }

    return null;
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
      if (combinacion.every((index) => tablero[index] === jugador)) {
        return true;
      }
    }
    return false;
  }

  btnPVP.addEventListener("click", () => configurarModoJuego("pvp"));
  btnPVC.addEventListener("click", () => configurarModoJuego("pvc"));
  document.querySelectorAll('input[name="dificultad"]').forEach((radio) => {
    radio.addEventListener("change", (e) => (dificultad = e.target.value));
  });
  btnIniciarJuego.addEventListener("click", iniciarPartida);

  celdas.forEach((celda) =>
    celda.addEventListener("click", procesarClickHumano)
  );
  reiniciarBtn.addEventListener("click", reiniciarRonda);
});
