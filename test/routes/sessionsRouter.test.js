import { expect } from "chai";
import { afterEach, before, describe, it } from "mocha";
import supertestSession from "supertest-session";
import mongoose from "mongoose";
import { config } from "../../src/config/config.js";
import { isValidObjectId } from "mongoose";

const requester = supertestSession("http://localhost:3000");

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

describe("Testing router Sessions", function () {
  this.timeout(10000);

  afterEach(async function () {
    await mongoose.connection
      .collection("users")
      .deleteMany({ email: "testing2@testing.com" });
  });

  it("The endpoint api/sessions/register with its method post creates a new user at Mongo DB", async () => {
    let mockUser = {
      name: "testing",
      last_name: "testing",
      email: "testing2@testing.com",
      password: "123",
      age: 30,
    };

    let { body } = await requester
      .post("/api/sessions/register")
      .send(mockUser);

    console.log(body);
    expect(body.message).to.exist.and.to.be.equal("Registration sucessful.");

    body = await mongoose.connection
      .collection("users")
      .findOne({ email: mockUser.email });
  });

  it("The endpoint api/sessions/login with its method post logs in a user.", async () => {
    let logUser = {
      email: "testing3@testing.com",
      password: "123",
    };

    let { body } = await requester.post("/api/sessions/login").send(logUser);

    console.log(body);

    expect(body.payload).to.exist.and.to.be.equal("Login successful!");
    expect(body.username).to.exist.and.to.be.equal("Tester");

    let user = await mongoose.connection
      .collection("users")
      .findOne({ email: logUser.email });
    expect(user.name).to.exist.and.to.be.equal("Tester");
  });
});
