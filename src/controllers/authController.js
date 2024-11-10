import { handleAuthResponse } from "../utils/responseHandleAuth.js";
import {
  registerUserService,
  loginUserService,
} from "../services/authService.js";

export const registerUser = (req, res) => {
  const { email, fullName, password, role } = req.body;

  handleAuthResponse(
    res,
    registerUserService,
    [email, fullName, password, role],
    201
  );
};

export const loginUser = (req, res) => {
  const { email, password } = req.body;

  handleAuthResponse(res, loginUserService, [email, password]);
};

export default {
  registerUser,
  loginUser,
};
