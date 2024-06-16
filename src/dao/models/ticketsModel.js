import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const ticketsCollection = "tickets";

const ticketsSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, default: uuidv4 },
    amount: { type: Number, required: true },
    purchaser: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "purchase_datetime", updatedAt: false },
  }
);

export const ticketsModel = mongoose.model(ticketsCollection, ticketsSchema);
