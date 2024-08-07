import { expect } from "chai";
import { afterEach, before, describe, it } from "mocha";
import supertest from "supertest-session";
import mongoose from "mongoose";
import { config } from "../../src/config/config.js";
import { isValidObjectId } from "mongoose";

const requester = supertest("http://localhost:3000");

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

  afterEach(async function () {
    await mongoose.connection
      .collection("products")
      .deleteMany({ title: "testing" });
  });

  it("The endpoing api/products with its method get returns a list an array of products", async () => {
    let { body } = await requester.get("/api/products");

    expect(Array.isArray(body.payload)).to.be.true;
    expect(body.status).to.exist.and.to.be.equal("success");
  });

  it("The endpoing api/products/:pid with its method get returns the product requested from params", async () => {
    let pid = "662c37bcb8c5a4462d6c586f";
    let { body } = await requester.get(`/api/products/${pid}`);

    expect(body.product._id).to.equal(pid);
  });

  it("The endpoint api/products with its method post creates a new product at Mongo DB", async () => {
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

    let { body } = await requester.post("/api/products").send(mockProduct);

    expect(body.message).to.exist.and.to.be.equal("Product added.");
    expect(body.newProduct).to.exist;
    expect(body.newProduct).to.have.property("_id");

    let result = await mongoose.connection
      .collection("products")
      .findOne({ title: "testing" });
    expect(result).to.have.property("_id");
    expect(isValidObjectId(result._id)).to.be.true;
  });
});
