import mongoose from "mongoose";

const ticketsCollection = "tickets";

const ticketsSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    amount: { type: Number },
    purchaser: { type: String, required: true },
    products: [],
  },
  {
    timestamps: { createdAt: "purchase_datetime", updatedAt: false },
  }
);

export const ticketsModel = mongoose.model(ticketsCollection, ticketsSchema);
