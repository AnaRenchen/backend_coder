import mongoose from "mongoose";

const usersCollection = "users";
const usersSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    last_name: String,
    email: {
      type: String,
      unique: true,
    },
    password: String,
    role: {
      type: String,
      default: "user",
    },
    cart: {
      type: mongoose.Types.ObjectId,
      ref: "carts",
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export const usersModel = mongoose.model(usersCollection, usersSchema);
