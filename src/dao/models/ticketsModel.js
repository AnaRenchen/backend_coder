import mongoose from "mongoose";

const ticketsCollection = "tickets";

const ticketsSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    amount: { type: Number, required: true },
    purchaser: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "purchase_datetime", updatedAt: false },
  }
);

export const ticketsModel = mongoose.model(ticketsCollection, ticketsSchema);
