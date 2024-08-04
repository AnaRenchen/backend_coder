import { ProductManagerMongo } from "../../src/dao/productmanagerMongo.js";
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

describe("Testing Products Dao", function () {
  this.timeout(10000);

  before(function () {
    this.dao = new ProductManagerMongo();
  });

  afterEach(async function () {
    await mongoose.connection
      .collection("products")
      .deleteMany({ title: "testing" });
  });

  it("The method getProductsPaginate returns an array of 10 products", async function () {
    let result = await this.dao.getProductsPaginate();

    if (Array.isArray(result.docs) && result.docs.length > 0) {
      expect(result.docs[0]).to.have.property("title");
      expect(Object.keys(result.docs[0]).includes("_id")).to.be.true;
      expect(result.docs).to.have.lengthOf(
        10,
        "docs returned by paginate has 10 products"
      );
    }
  });

  it("The method addProduct with create, creates a new product at Mongo DB", async function () {
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

    let result = await this.dao.addProduct(mockProduct);

    expect(result._id).to.be.ok;
    expect(isValidObjectId(result._id)).to.be.true;

    result = await mongoose.connection
      .collection("products")
      .findOne({ title: "testing" });
    expect(result).to.have.property("_id");
  });

  it("The method getProductbyId returns the product with the id passed by params", async function () {
    let pid = "662c37bcb8c5a4462d6c586f";
    let result = await this.dao.getProductbyId(pid);

    expect(result._id.toString()).to.equal(pid);
    expect(isValidObjectId(result._id)).to.be.true;

    result = await mongoose.connection
      .collection("products")
      .findOne({ _id: new ObjectId(pid) });
    expect(result).to.have.property("_id");
  });
});
