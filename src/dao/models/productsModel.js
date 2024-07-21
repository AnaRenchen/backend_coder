import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const productsCollection = "products";
const productsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    thumbnail: { type: String, required: true },
    code: { type: String, unique: true, required: true },
    stock: { type: Number, required: true },
    status: { type: Boolean, required: true },
    category: { type: String, required: true },
    owner: { type: String, default: "adminCoder@coder.com" },
  },
  {
    timestamps: true,
  }
);

productsSchema.plugin(paginate);

export const productsModel = mongoose.model(productsCollection, productsSchema);
