import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = Router();

// Rutas de autenticación
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router; // Asegúrate de exportar el router aquí
