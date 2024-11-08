import jwt from "jsonwebtoken";
import config from "../config/config.js";

// Middleware para autenticar al usuario mediante JWT
export const authenticateUser = (req, res, next) => {
  console.log("middleware");
  // Verificamos que el token esté presente en los encabezados Authorization
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  // Verificamos el token JWT
  jwt.verify(token, config.jwt_secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Si el token es válido, agregamos el id del usuario al objeto request
    req.user = decoded; // Aquí guardamos el id del usuario decodificado desde el token
    next(); // Continuamos con la siguiente función en la cadena (la ruta)
  });
};
