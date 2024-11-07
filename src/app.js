// app.js
import express from "express";
import config from "./config/config.js";
import MongoSingleton from "./db/database.js";
import authRouter from "./routes/authRoutes.js";
import configureWebSocket from "./socket/socket.js"; // Importamos la configuración de WebSockets
import gamesRouter from "./routes/gameRouter.js";

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Conexión a la base de datos
MongoSingleton.getInstance();

// Rutas
app.use("/auth", authRouter);
app.use("/games", gamesRouter);

// Definir el puerto en el que el servidor escuchará
const PORT = config.port;

// Inicializar el servidor HTTP
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Configurar WebSockets
const io = configureWebSocket(server); // Pasamos el servidor HTTP a WebSockets
