import { handleAuthResponse } from "../utils/responseHandleAuth.js"; // Importa el manejador de respuestas
import {
  registerUserService,
  loginUserService,
} from "../services/authService.js"; // Importa los servicios de registro y login

// Controlador para el registro de un usuario
export const registerUser = (req, res) => {
  const { email, fullName, password, role } = req.body;

  // Llamamos a la función handleAuthResponse pasándole el servicio y sus parámetros
  handleAuthResponse(
    res, // Respuesta de Express
    registerUserService, // Servicio de registro
    [email, fullName, password, role], // Parámetros del servicio
    201 // Código de éxito para creación de usuario
  );
};

// Controlador para el login de un usuario
export const loginUser = (req, res) => {
  const { email, password } = req.body;

  // Llamamos a la función handleAuthResponse pasándole el servicio y sus parámetros
  handleAuthResponse(
    res, // Respuesta de Express
    loginUserService, // Servicio de login
    [email, password] // Parámetros del servicio
  );
};

// Exportamos los controladores
export default {
  registerUser,
  loginUser,
};
