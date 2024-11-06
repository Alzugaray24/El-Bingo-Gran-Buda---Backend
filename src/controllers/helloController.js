import { getMessage } from "../models/helloModels.js";

export const getHelloWorld = (req, res) => {
  const message = getMessage(); // Llamada al modelo
  res.json({ message }); // Respuesta al cliente
};
