import { handleResponse } from "../utils/responseHandlerGame.js";
import gameService from "../services/gameService.js";

// Controlador para obtener todos los juegos
export const viewGames = (req, res) => {
  handleResponse(res, gameService.viewGames, []);
};

// Controlador para crear un nuevo juego
export const createGame = (req, res) => {
  handleResponse(res, gameService.createGame, [], 201);
};

// Controlador para que un usuario se una a un juego
export const joinGame = (req, res) => {
  const { gameId } = req.params;
  const { userId } = req.body;
  handleResponse(res, gameService.joinGame, [gameId, userId]);
};

// Controlador para iniciar un juego
export const startGame = (req, res) => {
  const { gameId } = req.params;
  handleResponse(res, gameService.startGame, [gameId]);
};

// Controlador para sacar una balota
export const drawBall = (req, res) => {
  const { gameId } = req.params;
  handleResponse(res, gameService.drawBall, [gameId]);
};

// Controlador para finalizar un juego
export const endGame = (req, res) => {
  const { gameId } = req.params;
  handleResponse(res, gameService.endGame, [gameId]);
};

// Controlador para marcar una balota en el tarjetón del usuario
export const markBall = (req, res) => {
  const { gameId } = req.params;
  const { userId, ballNumber } = req.body;
  handleResponse(res, gameService.markBall, [gameId, userId, ballNumber]);
};

// Controlador para verificar la condición de victoria de un usuario
export const checkWinCondition = (req, res) => {
  const { gameId } = req.params;
  const { userId } = req.body;
  handleResponse(res, gameService.checkWinCondition, [gameId, userId]);
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
};
