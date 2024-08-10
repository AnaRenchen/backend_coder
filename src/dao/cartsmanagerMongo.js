import { cartsModel } from "./models/cartsModel.js";

export class CartsManagerMongo {
  async getCarts() {
    return await cartsModel.find().populate("products.product");
  }

  async createCart(product) {
    const newCart = await cartsModel.create(product);
    return newCart.toJSON();
  }

  async getCartbyId(id, useLean = false) {
    const query = cartsModel.findOne({ _id: id }).populate("products.product");
    return useLean ? query.lean() : query;
  }

  async addProductCart(cid, products) {
    const cartProducts = await cartsModel.updateOne(
      { _id: cid },
      { $set: { products: products } }
    );
    return cartProducts;
  }

  async updateCartWithProducts(cid, products) {
    const updatedCart = await cartsModel.findOneAndUpdate(
      { _id: cid },
      { $set: { products: products } },
      { new: true }
    );
    return updatedCart;
  }

  async updateProductQuantity(cid, pid, quantity) {
    const updatedCart = await cartsModel.findOneAndUpdate(
      { _id: cid, "products.product": pid },
      { $set: { "products.$.quantity": quantity } },
      { new: true }
    );
    return updatedCart;
  }

  async deleteProductCart(cid, pid) {
    const cartProducts = await cartsModel.findOneAndUpdate(
      { _id: cid },
      { $pull: { products: { product: pid } } },
      { new: true }
    );
    return cartProducts;
  }

  async deleteCart(cid) {
    const cart = await cartsModel.findById(cid);
    if (!cart) {
      return null;
    }
    cart.products = [];
    await cart.save();
    return cart;
  }
}
