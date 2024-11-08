import Game from "../models/Game.js";
import mongoose from "mongoose";
import User from "../models/User.js";

// Servicio para obtener todos los juegos
const viewGames = async () => {
  const games = await Game.find();
  return games;
};

// Crear un nuevo juego
const createGame = async () => {
  const game = new Game({
    gameStatus: "esperando",
    drawnBalls: [],
    players: [],
  });
  return await game.save();
};

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

  // 4. Generamos la tarjeta 5x5 para el jugador
  const card = generateBingoCard();

  // 5. Creamos el objeto para el jugador con la tarjeta asignada
  const player = {
    userId: userId, // Asumimos que el userId ya es un ObjectId válido
    card: card, // Asignamos la tarjeta generada al jugador
    markedBalls: [],
  };

  // 6. Agregamos el jugador al juego
  game.players.push(player);

  // 7. Guardamos el juego actualizado
  await game.save();

  // 8. Retornamos el juego con el nuevo jugador agregado
  return game;
};

// Función para generar una tarjeta de bingo 5x5
const generateBingoCard = () => {
  const card = [];
  const numbers = Array.from({ length: 75 }, (_, index) => index + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  for (let row = 0; row < 5; row++) {
    card.push(numbers.splice(0, 5));
  }
  return card;
};

// Iniciar el juego
const startGame = async (gameId) => {
  const game = await Game.findById(gameId);
  if (!game) throw new Error("Game not found");
  if (game.gameStatus !== "esperando") throw new Error("Game already started");

  if (game.players.length === 0) throw new Error("No players in the game");

  game.gameStatus = "en curso";
  game.startDate = Date.now();
  return await game.save();
};

// Sacar una balota
const drawBall = async (gameId) => {
  const game = await Game.findById(gameId);
  if (!game) throw new Error("Game not found");
  if (game.gameStatus !== "en curso") throw new Error("Game not in progress");

  let newBall;
  do {
    newBall = Math.floor(Math.random() * 75) + 1;
  } while (game.drawnBalls.includes(newBall));

  game.drawnBalls.push(newBall);
  await game.save();
  return { newBall, game };
};

const markBall = async (gameId, userId, ballNumber) => {
  const game = await Game.findById(gameId);
  if (!game) throw new Error("Game not found");
  if (game.gameStatus !== "en curso") throw new Error("Game not in progress");

  // Encontrar al jugador en el juego
  const player = game.players.find(
    (player) => player.userId.toString() === userId.toString()
  );
  if (!player) throw new Error("Player not in the game");

  // Verificar si la balota ya ha sido sorteada
  if (!game.drawnBalls.includes(ballNumber)) {
    throw new Error("Ball not drawn");
  }

  // Buscar el número en la tarjeta y marcarlo en `markedNumbers`
  let numberFound = false;
  for (let i = 0; i < player.card.length; i++) {
    for (let j = 0; j < player.card[i].length; j++) {
      if (player.card[i][j] === ballNumber) {
        if (player.markedNumbers[i][j]) {
          throw new Error("Ball already marked");
        }
        player.markedNumbers[i][j] = true; // Marcar el número en la posición correspondiente
        numberFound = true;
        break;
      }
    }
    if (numberFound) break; // Detener búsqueda si se encuentra el número
  }

  if (!numberFound) {
    throw new Error("Ball not found on card");
  }

  await game.save(); // Guardar cambios en la base de datos
  return game;
};

// Función para verificar si un jugador ha ganado en su tarjeta
const checkCardWinCondition = (markedNumbers) => {
  const isRowComplete = (row) => row.every((cell) => cell === true);
  const isColComplete = (col) =>
    markedNumbers.every((row) => row[col] === true);

  // Comprobación de filas y columnas completas
  for (let i = 0; i < 5; i++) {
    if (isRowComplete(markedNumbers[i]) || isColComplete(i)) return true;
  }

  // Comprobación de la diagonal principal
  const mainDiagonal = [0, 1, 2, 3, 4].every(
    (i) => markedNumbers[i][i] === true
  );
  // Comprobación de la diagonal secundaria
  const antiDiagonal = [0, 1, 2, 3, 4].every(
    (i) => markedNumbers[i][4 - i] === true
  );

  return mainDiagonal || antiDiagonal;
};

// Función para verificar si un jugador ha ganado en el juego
const checkWinCondition = async (gameId, userId) => {
  const game = await Game.findById(gameId).populate("players.userId");

  if (!game) {
    return { winner: null, message: "El juego no existe." };
  }

  const player = game.players.find((p) => p.userId._id.toString() === userId);

  if (!player) {
    return { winner: null, message: "El jugador no está en el juego." };
  }

  console.log(`Checking win condition for player ${player.userId.fullName}`);

  // Llamada a checkCardWinCondition con markedNumbers del jugador actual
  if (checkCardWinCondition(player.markedNumbers)) {
    game.winner = player.userId._id;
    game.gameStatus = "finalizado";
    game.endDate = Date.now();
    await game.save();

    return {
      winner: player.userId.fullName,
      message: `${player.userId.fullName} ha ganado el juego!`,
    };
  } else {
    // Descalificar al jugador si intenta reclamar sin haber ganado
    game.players = game.players.filter(
      (p) => p.userId._id.toString() !== userId
    );
    await game.save();

    return {
      winner: null,
      message: `${player.userId.fullName} ha sido descalificado por intentar hacer trampa.`,
      redirect: true, // indica que el frontend debe redirigir al jugador al home
    };
  }
};

// Finalizar el juego
const endGame = async (gameId) => {
  const game = await Game.findById(gameId);
  if (!game) throw new Error("Game not found");

  game.gameStatus = "finalizado";
  game.endDate = Date.now();
  game.isActive = false;
  await game.save();

  return game;
};

export default {
  viewGames,
  createGame,
  joinGame,
  startGame,
  drawBall,
  markBall,
  checkWinCondition,
  endGame,
};
