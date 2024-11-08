import mongoose from "mongoose";
import validator from "validator";

const collection = "users";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email es obligatorio"],
      unique: true,
      lowercase: true,
      validate: [
        validator.isEmail,
        "Por favor ingrese un correo electrónico válido",
      ],
    },
    fullName: {
      type: String,
      required: [true, "El nombre completo es obligatorio"],
      trim: true,
      minlength: [3, "El nombre completo debe tener al menos 3 caracteres"],
      maxlength: [100, "El nombre completo no debe exceder los 100 caracteres"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
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

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
