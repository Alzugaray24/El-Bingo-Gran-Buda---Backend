import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/config.js";
import { hashPassword, comparePasswords } from "../utils/utils.js";

export const registerUserService = async (email, fullName, password, role) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    throw new Error("El correo electrónico no es válido");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("El correo electrónico ya está registrado");
  }

  if (fullName.length < 3) {
    throw new Error("El nombre completo debe tener al menos 3 caracteres");
  }

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error(
      "La contraseña debe tener al menos 6 caracteres, incluyendo 1 letra mayúscula, 1 número y 1 carácter especial"
    );
  }

  const hashedPassword = await hashPassword(password);

  const newUser = new User({
    email,
    fullName,
    password: hashedPassword,
  });

  await newUser.save();

  return { message: "Usuario registrado con éxito" };
};

export const loginUserService = async (email, password) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    throw new Error("El correo electrónico no es válido");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const isMatch = await comparePasswords(password, user.password);
  if (!isMatch) {
    throw new Error("Contraseña incorrecta");
  }

  const payload = { userId: user._id };
  const token = jwt.sign(payload, config.jwt_secret, { expiresIn: "1h" });

  return { token, userId: user._id };
};
