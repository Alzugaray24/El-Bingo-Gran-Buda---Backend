import Game from "../models/Game.js";
import mongoose from "mongoose";
import User from "../models/User.js";

// Servicio para obtener todos los juegos
const viewGames = async () => {
  const games = await Game.find(); // Busca todos los juegos
  return games;
};

// Crear un nuevo juego
const createGame = async () => {
  const game = new Game();
  return await game.save();
};

// Servicio para agregar un jugador al juego
const joinGame = async (gameId, userId) => {
  // 1. Verificamos si el juego existe
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  // 2. Comprobamos si el jugador ya está en el juego actual
  const existingPlayer = game.players.find(
    (player) => player.userId.toString() === userId.toString()
  );
  if (existingPlayer) {
    throw new Error("Player is already in the game");
  }

  // 3. Verificamos si el jugador ya está en otro juego
  const existingGame = await Game.findOne({
    "players.userId": userId,
  });
  if (existingGame) {
    throw new Error("Player is already in another game");
  }

  // 4. Generamos la tarjeta 5x5 para el jugador
  const card = generateBingoCard();

  // 5. Actualizamos la tarjeta del jugador en el modelo de Usuario
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  user.card = card; // Asignamos la tarjeta generada al jugador
  await user.save(); // Guardamos los cambios en el modelo de Usuario

  // 6. Creamos el objeto para el jugador (sin la tarjeta)
  const player = {
    userId: userId, // Asumimos que el userId ya es un ObjectId válido
    markedBalls: [],
  };

  // 7. Agregamos el jugador al juego
  game.players.push(player);

  // 8. Guardamos el juego actualizado
  await game.save();

  // 9. Retornamos el juego con el nuevo jugador agregado
  return game;
};

// Función para generar una tarjeta 5x5 con números aleatorios
const generateBingoCard = () => {
  const card = [];
  const numbers = Array.from({ length: 75 }, (_, index) => index + 1); // Números de 1 a 75

  // Mezclar los números aleatoriamente
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]]; // Intercambiar
  }

  // Crear una tarjeta 5x5
  for (let row = 0; row < 5; row++) {
    card.push(numbers.splice(0, 5)); // Tomar 5 números por fila
  }

  return card;
};

// Iniciar el juego
const startGame = async (gameId) => {
  const game = await Game.findById(gameId);
  if (!game) throw new Error("El juego no existe");
  if (game.gameStatus !== "esperando")
    throw new Error("El juego ya ha comenzado o ha finalizado");

  if (game.players.length === 0) {
    throw new Error("No es posible comenzar sin jugadores");
  }

  game.gameStatus = "en curso";
  game.startDate = Date.now();
  return await game.save();
};

// Sacar una balota
const drawBall = async (gameId) => {
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
const endGame = async (gameId) => {
  const game = await Game.findById(gameId);
  if (!game) throw new Error("El juego no existe");

  game.gameStatus = "finalizado";
  game.endDate = Date.now();
  game.isActive = false;
  return await game.save();
};

// Marcar una balota en el tarjetón del usuario
const markBall = async (gameId, userId, ballNumber) => {
  const game = await Game.findById(gameId);
  if (!game) throw new Error("El juego no existe");
  if (game.gameStatus !== "en curso")
    throw new Error("El juego no está en curso");

  console.log(game.players);

  // Encontrar al usuario dentro del juego
  const user = game.players.find(
    (player) =>
      player.userId.toString() ===
      new mongoose.Types.ObjectId(userId).toString()
  );
  console.log(user);
  if (!user) throw new Error("El usuario no está en el juego");

  // Verificar si la balota existe en el conjunto de balotas del juego
  if (!game.drawnBalls.includes(ballNumber)) {
    throw new Error("La balota no ha sido sorteada aún");
  }

  // Verificar si la balota ya fue marcada
  if (user.markedBalls.includes(ballNumber)) {
    throw new Error("La balota ya ha sido marcada");
  }

  // Marcar la balota
  user.markedBalls.push(ballNumber);
  await game.save();

  return game;
};

// Función que verifica si un jugador ha ganado en su tarjeta
const checkCardWinCondition = (markedNumbers) => {
  // Verificar filas
  for (let i = 0; i < 5; i++) {
    if (markedNumbers[i].every((marked) => marked === true)) {
      return true; // Ganó por fila
    }
  }

  // Verificar columnas
  for (let i = 0; i < 5; i++) {
    if (markedNumbers.every((row) => row[i] === true)) {
      return true; // Ganó por columna
    }
  }

  // Verificar diagonal principal
  if (markedNumbers.every((row, index) => row[index] === true)) {
    return true; // Ganó por diagonal principal
  }

  // Verificar diagonal secundaria
  if (markedNumbers.every((row, index) => row[4 - index] === true)) {
    return true; // Ganó por diagonal secundaria
  }

  return false; // No ganó
};

// Función para verificar si un jugador ha ganado en el juego
const checkWinCondition = async (gameId) => {
  // Obtener el juego desde la base de datos
  const game = await Game.findById(gameId).populate("players.userId");

  // Comprobar las condiciones de victoria para cada jugador
  for (const player of game.players) {
    const user = player.userId; // El usuario que juega
    const userCard = user.card; // El tarjetón del usuario
    const markedNumbers = user.markedNumbers; // Los números marcados del usuario

    console.log("aca", userCard);

    // Verificar si el jugador ha ganado
    if (checkCardWinCondition(userCard, markedNumbers)) {
      // Actualizar el juego con el ganador
      game.winner = user._id;
      game.gameStatus = "finalizado";
      game.endDate = new Date();
      await game.save(); // Guardar los cambios en el juego

      return {
        winner: user.fullName,
        message: `${user.fullName} ha ganado el juego!`,
      };
    }
  }

  return {
    winner: null,
    message: "El juego continúa. No hay ganador aún.",
  };
};

export default {
  viewGames,
  createGame,
  joinGame,
  startGame,
  drawBall,
  endGame,
  markBall,
  checkWinCondition,
  checkCardWinCondition,
};
