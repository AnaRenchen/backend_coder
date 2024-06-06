import { CartsManagerMongo as CartsDao } from "../dao/cartsmanagerMongo.js";
import { ProductManagerMongo as ProductsDao } from "../dao/productmanagerMongo.js";
import { isValidObjectId } from "mongoose";

const cartsDao = new CartsDao();
const productsDao = new ProductsDao();

export class CartsController {
  static getCarts = async (req, res) => {
    try {
      let id = req.params.cid;
      if (!isValidObjectId(id)) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: "Please choose a valid Mongo id." });
      }

      let products = await cartsDao.getCartbyId(id, false);

      if (products) {
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json(products);
      } else {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: `There are no carts with id: ${id}` });
      }
    } catch (error) {
      console.log(error);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  static creatCart = async (req, res) => {
    try {
      let newCart = await cartsDao.createCart();
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ message: "Cart created.", newCart });
    } catch (error) {
      console.log(error);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  static addProduct = async (req, res) => {
    try {
      let { cid, pid } = req.params;
      if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: "Please choose a valid Mongo id." });
      }

      const cart = await cartsDao.getCartbyId(cid, false);
      if (!cart) {
        res.setHeader("Content-Type", "application/json");
        return res.status(404).json({ error: "Cart not found." });
      }

      const findproduct = await productsDao.getProductbyId(pid);

      if (!findproduct) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(404)
          .json({ error: `Product with id ${pid} was not found.` });
      }

      const updatedCart = await cartsDao.addProductCart(cart, pid);

      if (updatedCart) {
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ message: "Product added.", updatedCart });
      } else {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: `There was an error updating cart.` });
      }
    } catch (error) {
      console.log(error);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  static updateCart = async (req, res) => {
    try {
      const { cid } = req.params;
      const { products } = req.body;

      if (!isValidObjectId(cid)) {
        return res
          .status(400)
          .json({ error: "Please choose a valid Mongo ID for the cart." });
      }

      if (!Array.isArray(products)) {
        return res.status(400).json({
          error:
            "Please provide an array with properties product and quantity.",
        });
      }

      const validProperties = ["product", "quantity"];

      for (const product of products) {
        const properties = Object.keys(product);
        const valid = properties.every((prop) =>
          validProperties.includes(prop)
        );
        if (!valid || properties.length !== validProperties.length) {
          return res.status(400).json({
            error:
              "Each product should have only 'product' and 'quantity' properties.",
          });
        }

        if (!isValidObjectId(product.product)) {
          return res
            .status(400)
            .json({ error: `Invalid product ID: ${product.product}.` });
        }
      }

      const cart = await cartsDao.getCartbyId(cid, false);
      if (!cart) {
        return res
          .status(404)
          .json({ error: `Cart with id ${cid} not found.` });
      }

      const updatedCart = await cartsDao.updateCartWithProducts(cid, products);

      if (!updatedCart) {
        return res
          .status(500)
          .json({ error: "Failed to update cart with products." });
      }

      return res.status(200).json({
        message: `Cart with id ${cid} was updated.`,
        cart: updatedCart,
      });
    } catch (error) {
      console.error("Error updating cart with products:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  static updateQuantity = async (req, res) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;

      if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({
          error: "Please choose a valid Mongo ID for the cart and product.",
        });
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          error: "Please provide a valid quantity.",
        });
      }

      const cart = await cartsDao.getCartbyId(cid, false);
      if (!cart) {
        res.setHeader("Content-Type", "application/json");
        return res.status(404).json({ error: "Cart not found." });
      }

      const findProduct = cart.products.find(
        (p) => p.product._id.toString() === pid
      );

      if (!findProduct) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(404)
          .json({ error: `Product with id ${pid} was not found in the cart.` });
      }

      const updatedQuantity = await cartsDao.updateProductQuantity(
        cid,
        pid,
        quantity
      );

      return res.status(200).json({
        message: `Quantity of product with id ${pid} in cart with id ${cid} was updated.`,
        cart: updatedQuantity,
      });
    } catch (error) {
      console.error("Error updating product quantity:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  static deleteProduct = async (req, res) => {
    try {
      const { cid, pid } = req.params;

      if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res
          .status(400)
          .json({ error: "Please choose valid Mongo IDs." });
      }

      const cart = await cartsDao.getCartbyId(cid, false);
      if (!cart) {
        return res
          .status(404)
          .json({ error: `Cart with id ${cid} was not found.` });
      }

      const product = await productsDao.getProductbyId(pid);

      if (!product) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(404)
          .json({ error: `Product with id ${pid} was not found.` });
      }

      const updatedCart = await cartsDao.deleteProductCart(cart, pid);

      if (!updatedCart) {
        return res
          .status(500)
          .json({ error: "Failed to remove product from cart." });
      }
      return res.status(200).json({
        message: `Product with id ${pid} was removed from the cart.`,
        cart: updatedCart,
      });
    } catch (error) {
      console.error("Error deleting product from cart:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  static deleteCart = async (req, res) => {
    try {
      const { cid } = req.params;

      if (!isValidObjectId(cid)) {
        return res
          .status(400)
          .json({ error: "Please choose a valid Mongo ID for the cart." });
      }

      const deletedCart = await cartsDao.deleteCart(cid);

      if (!deletedCart) {
        return res.status(404).json({
          error: `Cart with id ${cid} was not found or an error occurred.`,
        });
      }

      return res.status(200).json({
        message: `All products were removed from the cart.`,
        cart: deletedCart,
      });
    } catch (error) {
      console.error("Error deleting all products from cart:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };
}
