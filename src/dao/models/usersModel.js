import mongoose from "mongoose";

const usersCollection = "users";
const usersSchema = new mongoose.Schema(
  {
    name: String,
    last_name: String,
    age: Number,
    email: {
      type: String,
      unique: true,
    },
    password: String,
    role: {
      type: String,
      enum: ["user", "admin", "premium"],
      default: "user",
    },
    cart: {
      type: mongoose.Types.ObjectId,
      ref: "carts",
    },
    documents: [{ name: String, reference: String }],
    profilePic: String,
    last_connection: { type: Date },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export const usersModel = mongoose.model(usersCollection, usersSchema);
