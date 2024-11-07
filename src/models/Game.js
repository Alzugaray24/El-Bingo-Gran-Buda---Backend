import mongoose from "mongoose";

// Especificar la colección en la que se guardarán los juegos.
const collection = "games";

// Definir el esquema de juego con las validaciones y referencias correspondientes.
const gameSchema = new mongoose.Schema(
  {
    players: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Asegúrate de que el modelo de 'User' esté bien definido
          required: true,
        },
        markedBalls: {
          type: [Number], // Array de números de balotas marcadas por el jugador
          default: [],
        },
      },
    ],
    // El estado del juego puede ser: "esperando", "en curso", "finalizado"
    gameStatus: {
      type: String,
      enum: ["esperando", "en curso", "finalizado"],
      default: "esperando",
    },

    // Número total de balotas (el bingo tiene 75 balotas)
    totalBalls: {
      type: Number,
      default: 75,
    },

    // Balotas que han sido extraídas hasta el momento
    drawnBalls: [
      {
        type: Number,
        required: true,
      },
    ],

    // Indicar el ganador del juego, si lo hay (referencia a un jugador)
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencia al modelo User
      default: null, // Si no hay ganador aún
    },

    // El número del bingo (si un jugador ha marcado todos los números)
    bingoNumber: {
      type: Number,
      default: null, // Se asigna cuando alguien marca el bingo
    },

    // Fecha y hora en que se inició el juego
    startDate: {
      type: Date,
      default: Date.now,
    },

    // Fecha y hora en que se finalizó el juego
    endDate: {
      type: Date,
      default: null, // Será asignada cuando el juego termine
    },

    // Indicar si el juego está activo o cerrado
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Esto agregará `createdAt` y `updatedAt` automáticamente
  }
);

// Crear el modelo de juego
const Game = mongoose.model(collection, gameSchema);

export default Game;
