import { handleResponse } from "../utils/responseHandler.js";
import {
  registerUserService,
  loginUserService,
} from "../services/authService.js";

// Controlador para el registro de un usuario
export const registerUser = (req, res) => {
  const { email, fullName, password, role } = req.body;
  handleResponse(
    res,
    registerUserService,
    [email, fullName, password, role],
    201
  );
};

// Controlador para el login de un usuario
export const loginUser = (req, res) => {
  const { email, password } = req.body;
  handleResponse(res, loginUserService, [email, password]);
};

export default {
  registerUser,
  loginUser,
};
