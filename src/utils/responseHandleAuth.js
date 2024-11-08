/**
 * Función genérica para manejar las respuestas de los controladores (registro y login)
 * @param {Object} res - Respuesta de Express
 * @param {Function} serviceFunction - Función del servicio a ejecutar (por ejemplo, register o login)
 * @param {Array} params - Parámetros a pasar a la función del servicio
 * @param {number} successStatus - Código de estado para una respuesta exitosa (por defecto 200)
 */
export const handleAuthResponse = async (
  res,
  serviceFunction,
  params,
  successStatus = 200
) => {
  try {
    const result = await serviceFunction(...params); // Ejecutamos la función del servicio

    // Si el servicio es el de login, la respuesta será el token JWT
    if (serviceFunction.name === "loginUserService") {
      return res.status(successStatus).json({
        message: "Login exitoso",
        token: result, // Aquí asumes que result es el token generado
      });
    }

    // Si el servicio es el de registro, la respuesta será el usuario creado
    if (serviceFunction.name === "registerUserService") {
      return res.status(successStatus).json({
        message: "Registro exitoso",
        user: result, // Aquí asumes que result es el objeto de usuario registrado
      });
    }

    // En caso de otro tipo de servicio (por ejemplo, servicios de juego)
    return res.status(successStatus).json(result);
  } catch (error) {
    console.error("Error en handler:", error);
    res.status(error.status || 400).json({ message: error.message });
  }
};
