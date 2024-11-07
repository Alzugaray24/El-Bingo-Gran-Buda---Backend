import {
  registerUserService,
  loginUserService,
} from "../services/authService.js";
import { validationResult } from "express-validator";

// Controlador para el registro de un usuario
export const registerUser = async (req, res) => {
  const errors = validationResult(req); // Validación de la solicitud
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, fullName, password, role } = req.body;

  try {
    // Llamada al servicio para registrar al usuario
    const token = await registerUserService(email, fullName, password, role);
    res.status(201).json({
      msg: "Usuario registrado con éxito",
      token,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: error.message || "Hubo un error en el servidor" });
  }
};

// Controlador para el login del usuario
export const loginUser = async (req, res) => {
  const errors = validationResult(req); // Validación de la solicitud
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Llamada al servicio para autenticar al usuario
    const token = await loginUserService(email, password);
    res.status(200).json({
      msg: "Inicio de sesión exitoso",
      token,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: error.message || "Hubo un error en el servidor" });
  }
};
