import { CartsManagerMongo as CartsDao } from "../dao/cartsmanagerMongo.js";

class CartsServices {
  constructor(dao) {
    this.dao = dao;
  }

  getCarts = async () => {
    return await this.dao.getCarts();
  };

  getCartbyId = async (id, useLean = false) => {
    return await this.dao.getCartbyId(id, useLean);
  };

  createCart = async (product) => {
    return await this.dao.createCart(product);
  };

  addProductCart = async (cart, pid) => {
    return await this.dao.addProductCart(cart, pid);
  };

  updateCartWithProducts = async (cid, products) => {
    return await this.dao.updateCartWithProducts(cid, products);
  };

  updateProductQuantity = async (cid, pid, quantity) => {
    return await this.dao.updateProductQuantity(cid, pid, quantity);
  };

  deleteProductCart = async (cart, productIndex) => {
    return await this.dao.deleteProductCart(cart, productIndex);
  };

  deleteCart = async (cid) => {
    return await this.dao.deleteCart(cid);
  };
}

export const cartsServices = new CartsServices(new CartsDao());
