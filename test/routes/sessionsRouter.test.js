import { expect } from "chai";
import { afterEach, describe, it } from "mocha";
import supertest from "supertest-session";
import mongoose from "mongoose";
import { config } from "../../src/config/config.js";
import { isValidObjectId } from "mongoose";

const requester = supertest("http://localhost:3000");

let logUser = {
  email: "testing3@testing.com",
  password: "123",
};

let mockUser = {
  name: "testing",
  last_name: "testing",
  email: "testing2@testing.com",
  password: "123",
  age: 30,
};

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

  after(async function () {
    await mongoose.connection
      .collection("users")
      .deleteMany({ email: "testing2@testing.com" });
    await requester.get("/api/sessions/logout");
  });

  it("The endpoint api/sessions/register with its method post creates a new user at Mongo DB.", async () => {
    let { body, status } = await requester
      .post("/api/sessions/register")
      .send(mockUser);

    expect(status).to.equal(200);
    expect(body.message).to.exist.and.to.be.equal("Registration sucessful.");
    expect(body.newUser).to.have.property("_id");
    expect(isValidObjectId(body.newUser._id)).to.be.true;

    body = await mongoose.connection
      .collection("users")
      .findOne({ email: mockUser.email });
    expect(body.email).to.exist.and.to.be.ok;
  });

  it("The endpoint api/sessions/login with its method post logs in a user.", async () => {
    let { body } = await requester.post("/api/sessions/login").send(logUser);

    expect(body.payload).to.exist.and.to.be.equal("Login successful!");
    expect(body.role).to.exist.and.to.be.equal("user");
    expect(body).to.have.property("cart_id");

    let user = await mongoose.connection
      .collection("users")
      .findOne({ email: logUser.email });
    expect(user.name).to.exist.and.to.be.equal("Tester");
  });

  it("The endpoint api/sessions/current returns the user that is logged in.", async () => {
    await requester.post("/api/sessions/login").send(logUser);

    let { body, status } = await requester.get("/api/sessions/current");

    expect(status).to.be.equal(200);
    expect(body.login.firstname).to.equal("Tester");
    expect(body.login.email).to.equal("testing3@testing.com");
  });
});
