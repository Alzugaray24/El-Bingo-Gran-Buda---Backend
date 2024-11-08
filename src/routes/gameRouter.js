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

const router = Router();

// Rutas para manejar los juegos
router.post("/all", viewGames); // Crear un nuevo juego
router.post("/create", createGame); // Crear un nuevo juego
router.post("/:gameId/join", joinGame); // Unirse a un juego
router.post("/:gameId/start", startGame); // Iniciar el juego
router.post("/:gameId/draw", drawBall); // Sacar una balota
router.post("/:gameId/end", endGame); // Finalizar el juego

// Rutas para manejar las acciones de los usuarios en el juego
router.post("/:gameId/mark", markBall); // Marcar una balota en el tarjetón del usuario
router.post("/:gameId/check-win", checkWinCondition); // Verificar condición de victoria

export default router; // Asegúrate de exportar el router aquí
