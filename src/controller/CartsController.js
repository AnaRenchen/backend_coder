import { cartsServices } from "../repository/CartsServices.js";
import { productsServices } from "../repository/ProductsServices.js";
import { isValidObjectId } from "mongoose";
import { ticketsSertices } from "../repository/TicketsServices.js";
import { usersServices } from "../repository/UsersServices.js";

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

      let products = await cartsServices.getCartbyId(id, false);

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
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  static createCart = async (req, res) => {
    try {
      let newCart = await cartsServices.createCart();
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ message: "Cart created.", newCart });
    } catch (error) {
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

      const cart = await cartsServices.getCartbyId(cid, false);
      if (!cart) {
        res.setHeader("Content-Type", "application/json");
        return res.status(404).json({ error: "Cart not found." });
      }

      const findProduct = await productsServices.getProductbyId(pid);
      if (!findProduct) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(404)
          .json({ error: `Product with id ${pid} was not found.` });
      }

      const existingProduct = cart.products.find(
        (p) => p.product._id.toString() === pid
      );

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.products.push({ product: findProduct._id, quantity: 1 });
      }

      await cartsServices.addProductCart(cid, cart.products);

      const updatedCart = await cartsServices.getCartbyId(cid, false);

      if (updatedCart) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(200)
          .json({ message: "Product added.", cart: updatedCart });
      } else {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: `There was an error updating the cart.` });
      }
    } catch (error) {
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

      const cart = await cartsServices.getCartbyId(cid, false);
      if (!cart) {
        return res
          .status(404)
          .json({ error: `Cart with id ${cid} not found.` });
      }

      const updatedCart = await cartsServices.updateCartWithProducts(
        cid,
        products
      );

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

      const cart = await cartsServices.getCartbyId(cid, false);
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

      const updatedQuantity = await cartsServices.updateProductQuantity(
        cid,
        pid,
        quantity
      );

      return res.status(200).json({
        message: `Quantity of product with id ${pid} in cart with id ${cid} was updated.`,
        cart: updatedQuantity,
      });
    } catch (error) {
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

      const cart = await cartsServices.getCartbyId(cid, false);
      if (!cart) {
        return res
          .status(404)
          .json({ error: `Cart with id ${cid} was not found.` });
      }

      const productIndex = cart.products.findIndex(
        (p) => p.product._id.toString() === pid
      );

      if (productIndex === -1) {
        return res
          .status(404)
          .json({ error: `Product with id ${pid} not found in cart.` });
      }

      if (cart.products[productIndex].quantity > 1) {
        cart.products[productIndex].quantity -= 1;
      } else {
        cart.products.splice(productIndex, 1);
      }

      await cartsServices.addProductCart(cid, cart.products);

      const updatedCart = await cartsServices.getCartbyId(cid, false);

      return res.status(200).json({
        message: `Product with id ${pid} was removed from the cart.`,
        cart: updatedCart,
      });
    } catch (error) {
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

      const deletedCart = await cartsServices.deleteCart(cid);

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
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  static createPurchase = async (req, res) => {
    try {
      const { cid } = req.params;

      if (!isValidObjectId(cid)) {
        return res
          .status(400)
          .json({ error: "Please choose a valid Mongo ID for the cart." });
      }
      const cart = await cartsServices.getCartbyId(cid);
      console.log(cid);

      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }

      const user = await usersServices.getBy({ cart: cid });
      if (!user) {
        return res
          .status(404)
          .json({ error: "User not found for the given cart." });
      }
      console.log({ cart: cid });

      let dataTicket = {
        amount: 3,
        purchaser: user.email,
        code: `TCK-${Date.now()}`,
      };
      console.log(dataTicket);

      let newTicket = await ticketsSertices.createTicket(dataTicket);
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ message: "Ticket created.", newTicket });
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: "Internal server error." });
    }
  };
}
