import mongoose from "mongoose";
import validator from "validator";

// Especificar la colección en la que se guardarán los usuarios.
const collection = "users";

// Definir el esquema de usuario con las validaciones correspondientes.
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email es obligatorio"],
      unique: true,
      lowercase: true, // Asegurarse de que el email esté en minúsculas
      validate: [
        validator.isEmail,
        "Por favor ingrese un correo electrónico válido",
      ],
    },
    fullName: {
      type: String,
      required: [true, "El nombre completo es obligatorio"],
      trim: true, // Eliminar espacios innecesarios al inicio y al final
      minlength: [3, "El nombre completo debe tener al menos 3 caracteres"],
      maxlength: [100, "El nombre completo no debe exceder los 100 caracteres"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false, // Evitar que la contraseña sea incluida en las consultas por defecto
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true, // Indica si el usuario está activo o deshabilitado
    },
  },
  {
    timestamps: true, // Esto agregará `createdAt` y `updatedAt` automáticamente
  }
);

// Crear el modelo de usuario
const User = mongoose.model(collection, userSchema);

export default User;
