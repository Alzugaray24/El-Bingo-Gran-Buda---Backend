import Game from "../models/Game.js";
import {
  generateBingoCard,
  checkCardWinCondition,
} from "../utils/bingoUtils.js"; // Utilidades para la tarjeta y la condición de victoria
import mongoose from "mongoose";

const gameService = {
  // Obtener todos los juegos
  viewGames: async () => {
    return await Game.find({ isActive: true })
      .select("players gameStatus startDate") // Selecciona solo los campos necesarios
      .populate("players.userId", "username") // Pobla solo el nombre de usuario del jugador
      .sort({ startDate: -1 }); // Ordena por fecha de inicio, más recientes primero
  },

  // Crear un nuevo juego
  createGame: async () => {
    try {
      // Crear una nueva instancia del juego con los valores predeterminados
      const game = new Game({
        gameStatus: "esperando", // El juego comienza en estado 'esperando'
        drawnBalls: [], // Las bolas extraídas inicialmente vacías
        players: [], // Lista vacía de jugadores al principio
      });

      // Guardar el juego en la base de datos
      const savedGame = await game.save();

      // Crear un objeto con los detalles que deseas enviar
      const gameDetails = {
        _id: savedGame._id.toString(), // ID del juego
        gameStatus: savedGame.gameStatus, // Estado del juego
        startDate: savedGame.startDate, // Fecha de inicio
        players: savedGame.players, // Lista de jugadores
      };

      console.log("Juego creado con éxito:", gameDetails);

      // Devolver los detalles del juego
      return gameDetails;
    } catch (err) {
      console.error("Error al crear el juego:", err);
      throw new Error("No se pudo crear el juego");
    }
  },

  // Unir a un jugador en un juego
  joinGame: async (gameId, userId) => {
    // Buscar el juego en la base de datos utilizando directamente gameId
    const game = await Game.findById(gameId);
    if (!game) throw new Error("Game not found");

    // Verificar si el userId es válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("userId no es válido");
    }

    // Generar la tarjeta de Bingo para el jugador
    const card = generateBingoCard();

    // Crear un nuevo objeto jugador
    const player = {
      userId: new mongoose.Types.ObjectId(userId), // Asegurarse de que el userId sea un ObjectId válido
      card: card,
      markedBalls: [],
    };

    // Agregar al jugador al array de jugadores
    game.players.push(player);

    // Guardar los cambios en la base de datos
    await game.save();

    // Retornar el juego actualizado
    return game;
  },

  // Iniciar el juego
  startGame: async (gameId) => {
    const game = await Game.findById(gameId);
    if (!game) throw new Error("Game not found");
    if (game.gameStatus !== "esperando")
      throw new Error("Game already started");

    if (game.players.length === 0) throw new Error("No players in the game");

    game.gameStatus = "en curso";
    game.startDate = Date.now();
    return await game.save();
  },

  // Sacar una balota
  drawBall: async (gameId) => {
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
  },

  // Marcar una balota en la tarjeta del jugador
  markBall: async (gameId, userId, ballNumber) => {
    const game = await Game.findById(gameId);
    if (!game) throw new Error("Game not found");
    if (game.gameStatus !== "en curso") throw new Error("Game not in progress");

    const player = game.players.find(
      (player) => player.userId.toString() === userId.toString()
    );
    if (!player) throw new Error("Player not in the game");

    if (!game.drawnBalls.includes(ballNumber)) {
      throw new Error("Ball not drawn");
    }

    let numberFound = false;
    for (let i = 0; i < player.card.length; i++) {
      for (let j = 0; j < player.card[i].length; j++) {
        if (player.card[i][j] === ballNumber) {
          if (player.markedBalls[i][j]) {
            throw new Error("Ball already marked");
          }
          player.markedBalls[i][j] = true;
          numberFound = true;
          break;
        }
      }
      if (numberFound) break;
    }

    if (!numberFound) {
      throw new Error("Ball not found on card");
    }

    await game.save();
    return game;
  },

  // Verificar la condición de victoria
  checkWinCondition: async (gameId, userId) => {
    const game = await Game.findById(gameId).populate("players.userId");
    if (!game) return { winner: null, message: "El juego no existe." };

    const player = game.players.find((p) => p.userId._id.toString() === userId);
    if (!player)
      return { winner: null, message: "El jugador no está en el juego." };

    if (checkCardWinCondition(player.markedBalls)) {
      game.winner = player.userId._id;
      game.gameStatus = "finalizado";
      game.endDate = Date.now();
      await game.save();

      return {
        winner: player.userId.fullName,
        message: `${player.userId.fullName} ha ganado el juego!`,
      };
    } else {
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
  },

  // Finalizar el juego
  endGame: async (gameId) => {
    const game = await Game.findById(gameId);
    if (!game) throw new Error("Game not found");

    game.gameStatus = "finalizado";
    game.endDate = Date.now();
    game.isActive = false;
    await game.save();

    return game;
  },
};

export default gameService;
