import Game from "../models/Game.js";

// Crear un nuevo juego
export const createGame = async () => {
  const game = new Game();
  return await game.save();
};

// Servicio para agregar un jugador al juego
export const joinGame = async (gameId, userId) => {
  // 1. Verificamos si el juego existe
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  // 2. Comprobamos si el jugador ya está en el juego
  const existingPlayer = game.players.find(
    (player) => player.userId.toString() === userId.toString()
  );
  if (existingPlayer) {
    throw new Error("Player is already in the game");
  }

  // 4. Creamos el objeto para el jugador
  const player = {
    userId: userId, // Asumimos que el userId ya es un ObjectId válido
    markedBalls: [],
  };

  // 5. Agregamos el jugador al juego
  game.players.push(player);

  // 6. Guardamos el juego actualizado
  await game.save();

  // 7. Retornamos el juego con el nuevo jugador agregado
  return game;
};

// Iniciar el juego
export const startGame = async (gameId) => {
  const game = await Game.findById(gameId);
  if (!game) throw new Error("El juego no existe");
  if (game.gameStatus !== "esperando")
    throw new Error("El juego ya ha comenzado o ha finalizado");

  game.gameStatus = "en curso";
  game.startDate = Date.now();
  return await game.save();
};

// Sacar una balota
export const drawBall = async (gameId) => {
  const game = await Game.findById(gameId);
  if (!game) throw new Error("El juego no existe");
  if (game.gameStatus !== "en curso")
    throw new Error("El juego no está en curso");

  let newBall;
  do {
    newBall = Math.floor(Math.random() * game.totalBalls) + 1;
  } while (game.drawnBalls.includes(newBall));

  game.drawnBalls.push(newBall);
  return await game.save();
};

// Finalizar el juego
export const endGame = async (gameId) => {
  const game = await Game.findById(gameId);
  if (!game) throw new Error("El juego no existe");

  game.gameStatus = "finalizado";
  game.endDate = Date.now();
  game.isActive = false;
  return await game.save();
};

// Marcar una balota en el tarjetón del usuario
export const markBall = async (gameId, userId, ballNumber) => {
  const game = await Game.findById(gameId);
  if (!game) throw new Error("El juego no existe");
  if (game.gameStatus !== "en curso")
    throw new Error("El juego no está en curso");

  const user = game.players.find((player) => player.userId === userId);
  if (!user) throw new Error("El usuario no está en el juego");

  // Verificar si la balota ya fue marcada
  if (user.markedBalls.includes(ballNumber)) {
    throw new Error("La balota ya ha sido marcada");
  }

  // Marcar la balota
  user.markedBalls.push(ballNumber);
  return await game.save();
};

// Verificar la condición de victoria de un usuario
export const checkWinCondition = async (gameId, userId) => {
  const game = await Game.findById(gameId);
  if (!game) throw new Error("El juego no existe");

  const user = game.players.find((player) => player.userId === userId);
  if (!user) throw new Error("El usuario no está en el juego");

  const winCondition = checkCardWinCondition(user.markedBalls, game.userCard);
  return winCondition;
};

// Lógica para verificar las condiciones de victoria del tarjetón
const checkCardWinCondition = (markedBalls, userCard) => {
  const size = userCard.length;
  let isWinner = false;
  let winType = "";

  // Función para verificar si una línea está completa (ya sea fila, columna o diagonal)
  const isLineComplete = (line) => {
    return line.every((ball) => ball === "free" || markedBalls.includes(ball));
  };

  // 1. Verificar Cartón Lleno (sin contar el centro libre)
  const allBalls = userCard.flat().filter((ball) => ball !== "free");
  if (allBalls.every((ball) => markedBalls.includes(ball))) {
    isWinner = true;
    winType = "cartón lleno";
  }

  // 2. Verificar Líneas Horizontales
  if (!isWinner) {
    for (let i = 0; i < size; i++) {
      if (isLineComplete(userCard[i])) {
        isWinner = true;
        winType = "línea horizontal";
        break;
      }
    }
  }

  // 3. Verificar Líneas Verticales
  if (!isWinner) {
    for (let i = 0; i < size; i++) {
      const column = userCard.map((row) => row[i]);
      if (isLineComplete(column)) {
        isWinner = true;
        winType = "línea vertical";
        break;
      }
    }
  }

  // 4. Verificar Diagonales
  if (!isWinner) {
    const diagonal1 = userCard.map((row, idx) => row[idx]); // Diagonal de arriba a abajo
    const diagonal2 = userCard.map((row, idx) => row[size - 1 - idx]); // Diagonal de abajo a arriba
    if (isLineComplete(diagonal1)) {
      isWinner = true;
      winType = "diagonal";
    } else if (isLineComplete(diagonal2)) {
      isWinner = true;
      winType = "diagonal";
    }
  }

  // 5. Verificar Esquinas
  if (!isWinner) {
    const corners = [
      userCard[0][0], // esquina superior izquierda
      userCard[0][size - 1], // esquina superior derecha
      userCard[size - 1][0], // esquina inferior izquierda
      userCard[size - 1][size - 1], // esquina inferior derecha
    ];
    if (corners.every((corner) => markedBalls.includes(corner))) {
      isWinner = true;
      winType = "esquinas";
    }
  }

  return {
    isWinner,
    winType,
  };
};

export default {
  createGame,
  joinGame,
  startGame,
  drawBall,
  endGame,
  markBall,
  checkWinCondition,
  checkCardWinCondition,
};
