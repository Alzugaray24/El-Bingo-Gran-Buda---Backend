// app.js
import express from "express";
import cors from "cors";
import config from "./config/config.js";
import MongoSingleton from "./db/database.js";
import authRouter from "./routes/authRoutes.js";
import configureWebSocket from "./socket/socket.js";

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

MongoSingleton.getInstance();

app.use("/auth", authRouter);

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const io = configureWebSocket(server);
