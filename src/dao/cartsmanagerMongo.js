import { cartsModel } from "./models/cartsModel.js";
import ProductManagerMongo from "../dao/productmanagerMongo.js";

const managerMongo = new ProductManagerMongo();

export default class CartsManagerMongo {
  async getCarts() {
    return await cartsModel.find().populate("products.product");
  }

  async createCart(product) {
    let newCart = await cartsModel.create(product);
    return newCart.toJSON();
  }

  async getCartbyId(id, useLean = false) {
    const query = cartsModel.findOne({ _id: id }).populate("products.product");
    return useLean ? query.lean() : query;
  }

  async addProductCart(cart, pid) {
    try {
      const existingProduct = cart.products.find(
        (p) => p.product._id.toString() === pid
      );

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        const product = await managerMongo.getProductbyId(pid);
        if (!product) {
          throw new Error(`Product with id ${pid} was not found.`);
        }
        cart.products.push({ product: product._id, quantity: 1 });
      }

      return await cart.save();
    } catch (error) {
      console.error("Error adding product to cart:", error.message);
      return null;
    }
  }

  async updateCartWithProducts(cid, products) {
    try {
      const updatedCart = await cartsModel.findOneAndUpdate(
        { _id: cid },
        { $set: { products: products } },
        { new: true }
      );

      return updatedCart;
    } catch (error) {
      console.error("Error updating cart with products:", error.message);
      throw error;
    }
  }

  async updateProductQuantity(cid, pid, quantity) {
    try {
      const updatedCart = await cartsModel.findOneAndUpdate(
        { _id: cid, "products.product": pid },
        { $set: { "products.$.quantity": quantity } },
        { new: true }
      );
      return updatedCart;
    } catch (error) {
      console.error("Error updating product quantity:", error);
      throw error;
    }
  }

  async deleteProductCart(cart, pid) {
    try {
      const productIndex = cart.products.findIndex(
        (p) => p.product._id.toString() === pid
      );

      if (productIndex === -1) {
        throw new Error(`Product with id ${pid} was not found in the cart.`);
      }

      if (cart.products[productIndex].quantity > 1) {
        cart.products[productIndex].quantity -= 1;
      } else {
        cart.products.splice(productIndex, 1);
      }

      await cart.save();

      return cart;
    } catch (error) {
      console.error("Error deleting product from cart:", error);
      throw error;
    }
  }

  async deleteCart(cid) {
    try {
      const cart = await cartsModel.findById(cid);

      if (!cart) {
        throw new Error(`Cart with id ${cid} was not found.`);
      }

      cart.products = [];
      await cart.save();

      return cart;
    } catch (error) {
      console.error("Error deleting all products from cart:", error);
      return null;
    }
  }
}
