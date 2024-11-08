import mongoose from "mongoose";

const collection = "games";

const gameSchema = new mongoose.Schema(
  {
    players: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Asegúrate de que el modelo de 'User' esté bien definido
          required: true,
        },
        card: {
          type: [[Number]], // Tarjetón bidimensional de números
          required: true,
        },
        markedNumbers: {
          type: [[Boolean]], // Marca los números seleccionados en el tarjetón
          default: () => Array(5).fill(Array(5).fill(false)),
        },
        markedBalls: {
          type: [Number], // Array de números de balotas marcadas por el jugador
          default: [],
        },
      },
    ],
    gameStatus: {
      type: String,
      enum: ["esperando", "en curso", "finalizado"],
      default: "esperando",
    },
    totalBalls: {
      type: Number,
      default: 75,
    },
    drawnBalls: [
      {
        type: Number,
        required: true,
      },
    ],
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    bingoNumber: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Game = mongoose.model(collection, gameSchema);

export default Game;
