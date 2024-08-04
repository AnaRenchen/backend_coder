import { CartsManagerMongo } from "../../src/dao/cartsmanagerMongo.js";
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

describe("Testing Carts Dao", function () {
  this.timeout(10000);

  let newCart;

  before(function () {
    this.dao = new CartsManagerMongo();
  });

  afterEach(async function () {
    if (newCart) {
      await mongoose.connection
        .collection("carts")
        .deleteOne({ _id: newCart._id });
    }
  });

  it("The method getCartbyId returns the cart requested by params.", async function () {
    let cid = "665cc3d4c6d44e8003d48052";
    let result = await this.dao.getCartbyId(cid);

    expect(result._id.toString()).to.equal(cid);
    expect(isValidObjectId(result._id)).to.be.true;

    result = await mongoose.connection
      .collection("carts")
      .findOne({ _id: new ObjectId(cid) });
    expect(result).to.have.property("_id");
  });

  it("The method addProductCart adds a product to a cart. Both ids are defined on params.", async function () {
    newCart = await this.dao.createCart();
    let cid = newCart._id;
    const pid = "662c37bcb8c5a4462d6c586f";

    const product = {
      product: new ObjectId(pid),
      quantity: 1,
    };

    let updatedCart = await this.dao.addProductCart(cid, [product]);

    updatedCart = await mongoose.connection
      .collection("carts")
      .findOne({ _id: cid });
    expect(updatedCart.products).to.be.an("array").that.is.not.empty;
    expect(updatedCart.products[0].product.toString()).to.equal(pid);
  });

  it("The method createCart creates a new cart with an empty products array.", async function () {
    newCart = await this.dao.createCart();

    expect(isValidObjectId(newCart._id)).to.be.true;

    expect(newCart.products).to.be.an("array").that.is.empty;

    newCart = await mongoose.connection
      .collection("carts")
      .findOne({ _id: newCart._id });
    expect(newCart).to.have.property("_id");
  });
});
