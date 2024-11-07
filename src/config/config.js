import dotenv from "dotenv";

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Definir un objeto de configuración con las variables de entorno
const config = {
  port: process.env.PORT || 8080, // Si no existe la variable PORT, usará el valor 8080
  dbURI: process.env.DB_URI, // URI de la base de datos
  jwt_secret: process.env.JWT_SECRET,
};

export default config;
