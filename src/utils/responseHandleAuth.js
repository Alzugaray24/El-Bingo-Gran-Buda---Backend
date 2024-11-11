export const handleAuthResponse = async (
  res,
  serviceFunction,
  params,
  successStatus = 200
) => {
  try {
    const result = await serviceFunction(...params);

    if (serviceFunction.name === "loginUserService") {
      return res.status(successStatus).json({
        message: "Login exitoso",
        token: result.token,
        userId: result.userId,
      });
    }

    if (serviceFunction.name === "registerUserService") {
      return res.status(successStatus).json({
        message: "Registro exitoso",
        user: result,
      });
    }

    return res.status(successStatus).json(result);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};
