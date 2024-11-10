import mongoose from "mongoose";

const collection = "games";

const gameSchema = new mongoose.Schema(
  {
    players: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        card: {
          type: [[Number]],
          required: true,
        },
        markedNumbers: {
          type: [[Boolean]],
          default: () => Array(5).fill(Array(5).fill(false)),
        },
        markedBalls: {
          type: [Number],
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
