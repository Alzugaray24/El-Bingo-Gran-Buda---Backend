import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const authenticateUser = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  jwt.verify(token, config.jwt_secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    req.user = decoded;
    next();
  });
};
