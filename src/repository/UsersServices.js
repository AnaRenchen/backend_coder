import { usersManagerMongo as UsersDao } from "../dao/usersmanager.js";

class UsersServices {
  constructor(dao) {
    this.dao = dao;
  }

  createUser = async (user) => {
    return await this.dao.create(user);
  };

  getBy = async (filter) => {
    return await this.dao.getBy(filter);
  };

  getByPopulate = async (filter) => {
    return await this.dao.getByPopulate(filter);
  };
}

export const usersServices = new UsersServices(new UsersDao());
