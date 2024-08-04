import { usersManagerMongo } from "../../src/dao/usersmanager.js";
import mongoose from "mongoose";
import { expect } from "chai";
import { afterEach, before, describe, it } from "mocha";
import { isValidObjectId } from "mongoose";
import { config } from "../../src/config/config.js";
const { ObjectId } = mongoose.Types;

const connDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URL, {
      dbName: config.DB_NAME,
    });
    console.log("DB online!");
  } catch (error) {
    console.log(`Error connecting to DB: ${error}`);
  }
};
connDB();

describe("Testing Users Dao", function () {
  this.timeout(10000);

  before(function () {
    this.dao = new usersManagerMongo();
  });

  afterEach(async function () {
    await mongoose.connection
      .collection("users")
      .deleteMany({ email: "testing@testing.com" });
  });

  it("The method create creates a new user a Mongo DB.", async function () {
    let mockUser = {
      name: "testing",
      last_name: "testing",
      email: "testing@testing.com",
      password: "123",
      age: 30,
    };

    let result = await this.dao.create(mockUser);

    expect(isValidObjectId(result._id)).to.be.true;
    expect(result).to.have.property("_id");

    result = await mongoose.connection
      .collection("users")
      .findOne({ _id: result._id });

    expect(result).to.have.property("_id");
    expect(result.email).to.equal(mockUser.email);
  });

  it("The method getBy finds a user by the chosen filter.", async function () {
    let filter = { email: "anamagbh@gmail.com" };

    let result = await this.dao.getBy(filter);

    expect(result.email).to.exist.and.to.be.equal("anamagbh@gmail.com");

    result = await mongoose.connection
      .collection("users")
      .findOne({ email: result.email });

    expect(result).to.have.property("_id");
    expect(isValidObjectId(result._id)).to.be.true;
  });
});
