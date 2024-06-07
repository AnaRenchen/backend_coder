import { ProductManagerMongo as ProductsDao } from "../dao/productmanagerMongo.js";

class ProductsServices {
  constructor(dao) {
    this.dao = dao;
  }

  getProductsPaginate = async (
    page = 1,
    limit = 10,
    filter = {},
    sort = {}
  ) => {
    return await this.dao.getProductsPaginate(page, limit, filter, sort);
  };

  getProductBy = async (filter) => {
    return await this.dao.getProductBy(filter);
  };

  getProductbyId = async (id) => {
    return await this.dao.getProductbyId(id);
  };

  addProduct = async (product) => {
    return await this.dao.addProduct(product);
  };

  deleteProduct = async (id) => {
    return await this.dao.deleteProduct(id);
  };

  updateProduct = async (id, product) => {
    return await this.dao.updateProduct(id, product);
  };
}

export const productsServices = new ProductsServices(new ProductsDao());
