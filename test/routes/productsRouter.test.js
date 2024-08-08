import { expect } from "chai";
import { afterEach, before, describe, it } from "mocha";
import supertest from "supertest-session";
import mongoose from "mongoose";
import { config } from "../../src/config/config.js";
import { isValidObjectId } from "mongoose";

const requester = supertest("http://localhost:3000");

let mockProduct = {
  title: "testing",
  description: "Original Painting A3 Size",
  category: "nature",
  price: 200,
  status: true,
  thumbnail: "https://i.postimg.cc/cCfCw4jR/gato.jpg",
  code: "horisada50",
  stock: 5,
};

let user = {
  email: "adminCoder@coder.com",
  password: "adminCod3r123",
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

describe("Testing router Products", function () {
  this.timeout(10000);

  before(async function () {
    await requester.post("/api/sessions/login").send(user);
  });

  after(async function () {
    await requester.get("/api/sessions/logout");
  });

  afterEach(async function () {
    await mongoose.connection
      .collection("products")
      .deleteMany({ title: "testing" });
  });

  it("The endpoing api/products with its method get returns an array of products.", async () => {
    let { body, status } = await requester.get("/api/products");

    expect(Array.isArray(body.payload)).to.be.true;
    expect(status).to.equal(200);
    expect(body.status).to.exist.and.to.be.equal("success");
    body.payload.forEach((product) => {
      expect(product).to.include.property("description");
    });
  });

  it("The endpoing api/products/:pid with its method get returns the product requested from params.", async () => {
    let pid = "662c37bcb8c5a4462d6c586f";
    let { body, status } = await requester.get(`/api/products/${pid}`);

    expect(status).to.be.equal(200);
    expect(body.product._id).to.equal(pid);
    expect(isValidObjectId(body.product._id)).to.be.true;
    expect(body.product.title).to.be.equal("karajishi");
  });

  it("The endpoint api/products with its method post creates a new product at Mongo DB.", async () => {
    let { body, status } = await requester
      .post("/api/products")
      .send(mockProduct);

    expect(status).to.be.equal(200);
    expect(body.message).to.exist.and.to.be.equal("Product added.");
    expect(body.newProduct).to.exist;
    expect(body.newProduct).to.have.property("_id");
    expect(body.newProduct.title).to.be.equal(mockProduct.title);

    let result = await mongoose.connection
      .collection("products")
      .findOne({ title: "testing" });
    expect(status).to.be.equal(200);
    expect(result).to.have.property("_id");
    expect(isValidObjectId(result._id)).to.be.true;
  });

  it("The endpoing api/products/:pid with its method delete, deletes the product requested from params.", async () => {
    let createProduct = await requester.post("/api/products").send(mockProduct);
    let pid = createProduct.body.newProduct._id;
    let { body, status } = await requester.delete(`/api/products/${pid}`);

    expect(status).to.be.equal(200);
    expect(isValidObjectId(pid)).to.be.true;
    expect(body.message).to.exist.and.to.include(
      `Product with id ${pid} was deleted.`
    );
  });
});
