import { cartsModel } from "./models/cartsModel.js";
import { ProductManagerMongo as ProductsDao } from "./productmanagerMongo.js";

const productsDao = new ProductsDao();

export class CartsManagerMongo {
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
    const existingProduct = cart.products.find(
      (p) => p.product._id.toString() === pid
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      const product = await productsDao.getProductbyId(pid);

      cart.products.push({ product: product._id, quantity: 1 });
    }
    return await cart.save();
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

  async deleteProductCart(cart, productIndex) {
    if (cart.products[productIndex].quantity > 1) {
      cart.products[productIndex].quantity -= 1;
    } else {
      cart.products.splice(productIndex, 1);
    }

    await cart.save();
    return cart;
  }

  async deleteCart(cid) {
    const cart = await cartsModel.findById(cid);
    cart.products = [];
    await cart.save();
    return cart;
  }
}
