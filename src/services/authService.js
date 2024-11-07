import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/config.js";
import { hashPassword, comparePasswords } from "../utils/utils.js"; // Si decides usar utils

// Servicio para registrar un usuario
export const registerUserService = async (email, fullName, password, role) => {
  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("El correo electrónico ya está registrado");
  }

  // Encriptar la contraseña
  const hashedPassword = await hashPassword(password);

  // Crear el nuevo usuario
  const newUser = new User({
    email,
    fullName,
    password: hashedPassword,
    role,
  });

  // Guardar el usuario en la base de datos
  await newUser.save();

  // Generar el token JWT
  const payload = { userId: newUser._id };
  const token = jwt.sign(payload, config.jwt_secret, { expiresIn: "1h" });

  return token;
};

// Servicio para iniciar sesión
export const loginUserService = async (email, password) => {
  // Buscar el usuario por correo
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // Comparar la contraseña
  const isMatch = await comparePasswords(password, user.password);
  if (!isMatch) {
    throw new Error("Contraseña incorrecta");
  }

  // Generar un nuevo token JWT
  const payload = { userId: user._id };
  const token = jwt.sign(payload, config.jwt_secret, { expiresIn: "1h" });

  return token;
};
