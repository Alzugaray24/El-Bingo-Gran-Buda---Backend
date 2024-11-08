import { Router } from "express";
import {
  viewGames,
  createGame,
  joinGame,
  startGame,
  drawBall,
  endGame,
  markBall,
  checkWinCondition,
} from "../controllers/gameController.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";

const router = Router();

// Rutas para manejar los juegos
router.post("/all", authenticateUser, viewGames); // Crear un nuevo juego
router.post("/create", authenticateUser, createGame); // Crear un nuevo juego
router.post("/:gameId/join", authenticateUser, joinGame); // Unirse a un juego
router.post("/:gameId/start", authenticateUser, startGame); // Iniciar el juego
router.post("/:gameId/draw", authenticateUser, drawBall); // Sacar una balota
router.post("/:gameId/end", authenticateUser, endGame); // Finalizar el juego

// Rutas para manejar las acciones de los usuarios en el juego
router.post("/:gameId/mark", authenticateUser, markBall); // Marcar una balota en el tarjetón del usuario
router.post("/:gameId/check-win", authenticateUser, checkWinCondition); // Verificar condición de victoria

export default router; // Asegúrate de exportar el router aquí
