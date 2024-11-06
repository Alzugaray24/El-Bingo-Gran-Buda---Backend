import express from "express";
import helloRoutes from "./routes/helloRoutes.js";
import config from "./config/config.js";
import MongoSingleton from "./db/database.js";

const app = express();

// Middleware para parsear JSON
app.use(express.json());

MongoSingleton.getInstance();

// Rutas
app.use("/", helloRoutes);

// Definir el puerto en el que el servidor escuchará
const PORT = config.port;

// Inicializar el servidor y hacerlo escuchar en el puerto
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
