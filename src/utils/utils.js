import bcrypt from "bcrypt";

// Función para encriptar la contraseña
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Función para comparar contraseñas
export const comparePasswords = async (candidatePassword, storedPassword) => {
  return await bcrypt.compare(candidatePassword, storedPassword);
};
