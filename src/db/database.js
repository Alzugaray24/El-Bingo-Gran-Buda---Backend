import mongoose from "mongoose";
import config from "../config/config.js";

export default class MongoSingleton {
  static #instance;

  constructor() {
    if (!MongoSingleton.#instance) {
      mongoose
        .connect(config.dbURI)
        .then(() => {
          console.log("Conexión bbdd CREADA");
        })
        .catch((err) => {
          console.log("Error de conexión a la bbdd:", err);
        });
    }
  }

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new MongoSingleton();
    } else {
      console.log("Conexión bbdd RECUPERADA");
    }

    return this.#instance;
  }
}
