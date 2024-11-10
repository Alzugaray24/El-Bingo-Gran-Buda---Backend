import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (candidatePassword, storedPassword) => {
  return await bcrypt.compare(candidatePassword, storedPassword);
};
