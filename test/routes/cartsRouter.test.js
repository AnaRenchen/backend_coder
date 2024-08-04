import { expect } from "chai";
import { afterEach, before, describe, it } from "mocha";
import supertestSession from "supertest-session";
import mongoose from "mongoose";
import { config } from "../../src/config/config.js";
import { isValidObjectId } from "mongoose";
import { cartsServices } from "../../src/repository/CartsServices.js";
const { ObjectId } = mongoose.Types;

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

describe("Testing router Carts", function () {
  this.timeout(10000);

  let newCart;

  afterEach(async function () {
    if (newCart) {
      await mongoose.connection
        .collection("carts")
        .deleteOne({ _id: newCart._id });
    }
  });

  it("The endpoing api/carts/:cid/product/:pid with its method post add a product to a cart.", async () => {
    let cid = "665cc3d4c6d44e8003d48052";
    let pid = "662c37bcb8c5a4462d6c586f";
    let { body } = await requester.post(`/api/carts/${cid}/product/${pid}`);

    //expect(body.cart._id).to.equal(cid);
  });

  it("The endpoing api/carts/:cid with its method get returns the cart which id was passed by params.", async () => {
    let cid = "665cc3d4c6d44e8003d48052";

    let { body } = await requester.get(`/api/carts/${cid}`);

    expect(body._id).to.equal(cid);

    expect(body).to.have.property("products");

    body = await mongoose.connection
      .collection("carts")
      .findOne({ _id: new ObjectId(cid) });
    expect(body).to.have.property("_id");
  });

  it("The endpoing api/carts/:cid with its method put updates a cart.", async () => {
    newCart = await cartsServices.createCart();
    let cid = newCart._id;

    let cartContent = {
      products: [
        {
          product: "662c374cb8c5a4462d6c5863",
          quantity: 2,
        },
      ],
    };

    let { body } = await requester.put(`/api/carts/${cid}`).send(cartContent);

    expect(body).to.have.property(
      "message",
      `Cart with id ${cid} was updated.`
    );
    expect(body.cart.products[0]).to.have.property(
      "product",
      "662c374cb8c5a4462d6c5863"
    );
  });
});
