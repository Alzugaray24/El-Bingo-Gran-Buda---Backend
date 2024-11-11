import Game from "../models/Game.js";
import {
  generateBingoCard,
  checkForWinningCondition,
} from "../utils/bingoUtils.js";
import mongoose from "mongoose";

const gameService = {
  viewGames: async () => {
    return await Game.find({ isActive: true })
      .select("players gameStatus startDate")
      .populate("players.userId", "username")
      .sort({ startDate: -1 });
  },

  createGame: async () => {
    try {
      const game = new Game({
        gameStatus: "esperando",
        drawnBalls: [],
        players: [],
      });

      const savedGame = await game.save();

      const gameDetails = {
        _id: savedGame._id.toString(),
        gameStatus: savedGame.gameStatus,
        startDate: savedGame.startDate,
        players: savedGame.players,
      };

      console.log("Juego creado con éxito:", gameDetails);

      return gameDetails;
    } catch (err) {
      console.error("Error al crear el juego:", err);
      throw new Error("No se pudo crear el juego");
    }
  },

  joinGame: async (gameId, userId) => {
    console.log("PITO");

    const game = await Game.findById(gameId);
    if (!game) throw new Error("Juego no encontrado");

    if (game.gameStatus === "en curso" || game.gameStatus === "finalizado") {
      throw new Error(
        "El juego ya está en curso, no se puede unir más jugadores."
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("userId no es válido");
    }

    const playerExists = game.players.some(
      (player) => player.userId.toString() === userId
    );
    if (playerExists) {
      throw new Error("El jugador ya está en la partida");
    }

    const card = generateBingoCard();

    const player = {
      userId: new mongoose.Types.ObjectId(userId),
      card: card,
      markedBalls: [],
    };

    game.players.push(player);

    await game.save();

    return game;
  },

  startGame: async (gameId) => {
    const game = await Game.findById(gameId);
    if (!game) throw new Error("Juego no encontrado");
    if (game.gameStatus !== "esperando")
      throw new Error("El juego ya ha comenzado");

    if (game.players.length === 0)
      throw new Error("No hay jugadores en el juego");

    game.gameStatus = "en curso";
    game.startDate = Date.now();
    return await game.save();
  },

  drawBall: async (gameId) => {
    const game = await Game.findById(gameId);
    if (!game) throw new Error("Juego no encontrado");

    if (game.gameStatus !== "en curso") {
      throw new Error("El juego no está en curso");
    }

    if (game.drawnBalls.length === 75) {
      throw new Error("Ya se han sacado todas las bolas");
    }

    let newBall;
    do {
      newBall = Math.floor(Math.random() * 75) + 1;
    } while (game.drawnBalls.includes(newBall));

    game.drawnBalls.push(newBall);
    await game.save();

    return { newBall, game };
  },

  markBall: async (gameId, userId, ballNumber) => {
    const game = await Game.findById(gameId);
    if (!game) throw new Error("Juego no encontrado");
    if (game.gameStatus !== "en curso")
      throw new Error("El juego no está en curso");

    const player = game.players.find(
      (player) => player.userId.toString() === userId.toString()
    );
    if (!player) throw new Error("Jugador no encontrado en el juego");

    if (!game.drawnBalls.includes(ballNumber)) {
      throw new Error("La bola no ha sido sacada");
    }

    let numberFound = false;
    for (let i = 0; i < player.card.length; i++) {
      for (let j = 0; j < player.card[i].length; j++) {
        if (player.card[i][j] === ballNumber) {
          if (player.markedNumbers[i][j]) {
            throw new Error("La bola ya está marcada");
          }
          player.markedNumbers[i][j] = true;
          numberFound = true;
          break;
        }
      }
      if (numberFound) break;
    }

    if (!numberFound) {
      throw new Error("La bola no se encuentra en el cartón");
    }

    player.markedBalls.push(ballNumber);

    await game.save();
    return game;
  },

  checkWinCondition: async (gameId, userId) => {
    try {
      const game = await Game.findById(gameId);
      if (!game) throw new Error("Juego no encontrado");

      const playerIndex = game.players.findIndex(
        (p) => p.userId.toString() === userId.toString()
      );
      if (playerIndex === -1)
        throw new Error("Jugador no encontrado en el juego");

      const player = game.players[playerIndex];

      if (game.winner && game.winner.toString() === userId.toString()) {
        return { winner: true, playerId: userId, game };
      }

      const hasWon = checkForWinningCondition(player.card, player.markedBalls);
      if (hasWon) {
        game.winner = player.userId;
        await game.save();
        return { winner: true, playerId: userId, game };
      }

      game.players.splice(playerIndex, 1);

      await game.save();

      return { winner: false, playerId: userId, removed: true, game };
    } catch (err) {
      throw new Error(err.message);
    }
  },

  endGame: async (gameId) => {
    const game = await Game.findById(gameId);
    if (!game) throw new Error("Juego no encontrado");

    game.gameStatus = "finalizado";
    game.endDate = Date.now();
    game.isActive = false;
    await game.save();

    return game;
  },
};

export default gameService;
