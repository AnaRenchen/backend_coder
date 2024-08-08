import { expect } from "chai";
import { before, describe, it } from "mocha";
import supertest from "supertest-session";
import mongoose from "mongoose";
import { config } from "../../src/config/config.js";
import { isValidObjectId } from "mongoose";
import { cartsModel } from "../../src/dao/models/cartsModel.js";
const { ObjectId } = mongoose.Types;

const requester = supertest("http://localhost:3000");
let user = {
  email: "anamagbh@gmail.com",
  password: "123",
};

let cid = "66b29e664ae50703118704c6";
let pid = "662c37bcb8c5a4462d6c586f";

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

describe("Testing router Carts", function () {
  this.timeout(10000);

  before(async function () {
    await requester.post("/api/sessions/login").send(user);
  });

  after(async function () {
    await requester.get("/api/sessions/logout");
  });

  it("The endpoing api/carts/:cid/product/:pid with its method post adds a product to the cart.", async () => {
    let { body } = await requester.post(`/api/carts/${cid}/product/${pid}`);

    expect(body.message).to.equal("Product added.");
    expect(body.cart._id).to.equal(cid);
    expect(isValidObjectId(pid)).to.be.true;
    expect(isValidObjectId(cid)).to.be.true;
    await requester.delete(`/api/carts/${cid}/product/${pid}`);
  });

  it("The endpoing api/carts/:cid with its method get returns the cart requested by params.", async () => {
    let { body, status } = await requester.get(`/api/carts/${cid}`);

    expect(body._id).to.equal(cid);
    expect(status).that.equal(200);
    expect(body).to.have.property("products");

    let cart = await mongoose.connection
      .collection("carts")
      .findOne({ _id: new ObjectId(cid) });
    expect(cart).to.have.property("_id");
    expect(isValidObjectId(cid)).to.be.true;
  });

  it("The endpoing api/carts/:cid with its method put updates a cart.", async () => {
    let cartContent = {
      products: [
        {
          product: pid,
          quantity: 2,
        },
      ],
    };

    let { body, status } = await requester
      .put(`/api/carts/${cid}`)
      .send(cartContent);

    expect(status).that.equal(200);
    expect(body).to.have.property(
      "message",
      `Cart with id ${cid} was updated.`
    );
    expect(body.cart.products[0]).to.have.property("quantity", 2);
  });

  it("The endpoing api/carts with its method post creates a new cart at Mongo DB.", async () => {
    let { body, status } = await requester.post(`/api/carts`);

    expect(status).to.equal(200);
    expect(body.message).to.include("Cart created.");
    expect(body.newCart).to.have.property("_id");
    expect(isValidObjectId(body.newCart._id)).to.be.true;
    await cartsModel.findByIdAndDelete(body.newCart._id);
  });
});
