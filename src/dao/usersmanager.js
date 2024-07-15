import { usersModel } from "./models/usersModel.js";

export class usersManagerMongo {
  async create(user) {
    let newUser = await usersModel.create(user);
    return newUser.toJSON();
  }

  async getBy(filter = {}) {
    return await usersModel.findOne(filter).lean();
  }

  async getByPopulate(filter = {}) {
    return await usersModel.findOne(filter).populate("cart").lean();
  }

  async updateUser(id, property = {}) {
    const updatedUser = await usersModel.findByIdAndUpdate(
      id,
      { $set: property },
      { new: true, runValidators: true }
    );
    return updatedUser;
  }
}
