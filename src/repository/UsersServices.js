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

  getByMany = async (filter) => {
    return await this.dao.getByMany(filter);
  };

  getByPopulate = async (filter) => {
    return await this.dao.getByPopulate(filter);
  };

  updateUser = async (id, property) => {
    return await this.dao.updateUser(id, property);
  };

  getUsers = async () => {
    return await this.dao.getUsers();
  };

  deleteUsers = async (filter) => {
    return await this.dao.deleteUsers(filter);
  };
}

export const usersServices = new UsersServices(new UsersDao());
