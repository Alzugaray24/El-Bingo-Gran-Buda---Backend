import { Server } from "socket.io";
import gameService from "../services/gameService.js";

const configureWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("viewGames", async () => {
      try {
        const games = await gameService.viewGames();
        socket.emit("gamesList", games);
      } catch (err) {
        socket.emit("error", "No se pudieron obtener los juegos");
      }
    });

    socket.on("createGame", async () => {
      try {
        const game = await gameService.createGame();
        socket.emit("gameCreated", game);
      } catch (err) {
        socket.emit("error", "No se pudo crear el juego");
      }
    });

    socket.on("joinGame", async (gameId, userId) => {
      try {
        const game = await gameService.joinGame(gameId, userId);
        socket.join(gameId);
        socket.emit("gameJoined", game);
        io.to(gameId).emit("newPlayer", game);
      } catch (err) {
        socket.emit("error", err.message);
      }
    });

    socket.on("startGame", async (gameId) => {
      try {
        const game = await gameService.startGame(gameId);
        socket.emit("gameStarted", game);
      } catch (err) {
        socket.emit("error", err.message);
      }
    });

    socket.on("drawBall", async (gameId) => {
      try {
        const { newBall, game } = await gameService.drawBall(gameId);

        console.log(newBall);
        console.log(game);
        socket.emit("ballDrawn", { newBall, game });
      } catch (err) {
        socket.emit("error", err.message);
      }
    });

    socket.on("markBall", async (gameId, userId, ballNumber) => {
      try {
        const game = await gameService.markBall(gameId, userId, ballNumber);
        socket.emit("ballMarked", game);
      } catch (err) {
        console.log(err);
        socket.emit("error", err.message);
      }
    });

    socket.on("checkWinCondition", async (gameId, userId) => {
      try {
        const result = await gameService.checkWinCondition(gameId, userId);
        socket.emit("winConditionChecked", result);
        if (result.winner) {
          io.to(gameId).emit("gameEnded", result);
        }
      } catch (err) {
        socket.emit("error", err.message);
      }
    });

    socket.on("endGame", async (gameId) => {
      try {
        console.log("entre");
        const game = await gameService.endGame(gameId);
        io.to(gameId).emit("gameEnded", game);
      } catch (err) {
        socket.emit("error", err.message);
      }
    });

    socket.on("disconnect", () => {
      // Manejar la desconexión del jugador si es necesario
    });
  });

  return io;
};

export default configureWebSocket;
