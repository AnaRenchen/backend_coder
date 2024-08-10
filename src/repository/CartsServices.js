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

  addProductCart = async (cid, products) => {
    return await this.dao.addProductCart(cid, products);
  };

  updateCartWithProducts = async (cid, products) => {
    return await this.dao.updateCartWithProducts(cid, products);
  };

  updateProductQuantity = async (cid, pid, quantity) => {
    return await this.dao.updateProductQuantity(cid, pid, quantity);
  };

  deleteProductCart = async (cid, pid) => {
    return await this.dao.deleteProductCart(cid, pid);
  };

  deleteCart = async (cid) => {
    return await this.dao.deleteCart(cid);
  };
}

export const cartsServices = new CartsServices(new CartsDao());
