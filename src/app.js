import express from "express";
import helloRoutes from "./routes/helloRoutes.js"; // Ruta de ejemplo

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use("/", helloRoutes);

// Definir el puerto en el que el servidor escuchará
const PORT = 8080;

// Inicializar el servidor y hacerlo escuchar en el puerto
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
