// utils/responseHandler.js

/**
 * Función genérica para manejar las respuestas de los controladores
 * @param {Object} res - Respuesta de Express
 * @param {Function} serviceFunction - Función del servicio a ejecutar
 * @param {Array} params - Parámetros a pasar a la función del servicio
 * @param {number} successStatus - Código de estado para una respuesta exitosa (por defecto 200)
 */
export const handleResponse = async (
  res,
  serviceFunction,
  params,
  successStatus = 200
) => {
  try {
    console.log(console.log(serviceFunction));
    const result = await serviceFunction(...params);
    res.status(successStatus).json(result);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};
