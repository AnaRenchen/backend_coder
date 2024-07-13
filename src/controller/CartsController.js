import { cartsServices } from "../repository/CartsServices.js";
import { productsServices } from "../repository/ProductsServices.js";
import { isValidObjectId } from "mongoose";
import { ticketsServices } from "../repository/TicketsServices.js";
import { sendTicket } from "../config/mailing.config.js";
import CustomError from "../utils/CustomError.js";
import { TYPES_ERROR } from "../utils/EErrors.js";
import {
  cartNotDeleted,
  cartNotFound,
  cartNotUpdated,
  cartProductNotFound,
  createCartError,
  errorMongoId,
  productNotAddedCart,
  updateCartArgumentsError,
  updateQuantityError,
} from "../utils/errorsCart.js";
import { productNotFound } from "../utils/errorsProducts.js";

export class CartsController {
  static getCarts = async (req, res, next) => {
    try {
      let id = req.params.cid;
      if (!isValidObjectId(id)) {
        throw CustomError.createError(
          "Invalid Mongo Id.",
          errorMongoId(),
          "Please choose a valid Mongo Id.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      let cart = await cartsServices.getCartbyId(id, false);

      if (cart) {
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json(cart);
      } else {
        throw CustomError.createError(
          "Cart Not Found",
          cartNotFound(id),
          "Could not find cart.",
          TYPES_ERROR.NOT_FOUND
        );
      }
    } catch (error) {
      req.logger.error(
        JSON.stringify(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          null,
          5
        )
      );
      return next(error);
    }
  };

  static createCart = async (req, res, next) => {
    try {
      let newCart = await cartsServices.createCart();
      if (!newCart) {
        throw CustomError.createError(
          "Internal Error",
          createCartError(),
          "Could not create cart.",
          TYPES_ERROR.INTERNAL_SERVER_ERROR
        );
      }
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ message: "Cart created.", newCart });
    } catch (error) {
      req.logger.error(
        JSON.stringify(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          null,
          5
        )
      );
      return next(error);
    }
  };

  static addProduct = async (req, res, next) => {
    try {
      let { cid, pid } = req.params;
      if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        throw CustomError.createError(
          "Invalid Mongo Id.",
          errorMongoId(),
          "Please choose a valid Mongo Id.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      const cart = await cartsServices.getCartbyId(cid, false);
      if (!cart) {
        throw CustomError.createError(
          "Cart not found.",
          cartNotFound(cid),
          "Could not find the selected cart.",
          TYPES_ERROR.NOT_FOUND
        );
      }

      const findProduct = await productsServices.getProductbyId(pid);
      if (!findProduct) {
        throw CustomError.createError(
          "Cart not find product.",
          cartProductNotFound(pid),
          "Could not find the selected product in cart.",
          TYPES_ERROR.NOT_FOUND
        );
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
        throw CustomError.createError(
          "There was an error adding product to cart.",
          productNotAddedCart(),
          "Could not add product to cart.",
          TYPES_ERROR.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      req.logger.error(
        JSON.stringify(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          null,
          5
        )
      );
      return next(error);
    }
  };

  static updateCart = async (req, res, next) => {
    try {
      const { cid } = req.params;
      const { products } = req.body;

      if (!isValidObjectId(cid)) {
        throw CustomError.createError(
          "Invalid Mongo Id.",
          errorMongoId(),
          "Please choose a valid Mongo Id.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      if (!Array.isArray(products)) {
        throw CustomError.createError(
          "Invalid Arguments to update cart.",
          updateCartArgumentsError(),
          "Please provide an array with properties product and quantity.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      const validProperties = ["product", "quantity"];

      for (const product of products) {
        const properties = Object.keys(product);
        const valid = properties.every((prop) =>
          validProperties.includes(prop)
        );
        if (!valid || properties.length !== validProperties.length) {
          throw CustomError.createError(
            "Invalid Arguments to update cart.",
            updateCartArgumentsError(),
            "Each product should have only 'product' and 'quantity' properties.",
            TYPES_ERROR.INVALID_ARGUMENTS
          );
        }

        if (!isValidObjectId(product.product)) {
          throw CustomError.createError(
            "Invalid Product Id.",
            errorMongoId(),
            "Please provide a valid Mongo Id for product.",
            TYPES_ERROR.INVALID_ARGUMENTS
          );
        }
      }

      const cart = await cartsServices.getCartbyId(cid, false);
      if (!cart) {
        throw CustomError.createError(
          "Could not find cart.",
          cartNotFound(cid),
          "Could not find the selected cart.",
          TYPES_ERROR.NOT_FOUND
        );
      }

      const updatedCart = await cartsServices.updateCartWithProducts(
        cid,
        products
      );

      if (!updatedCart) {
        throw CustomError.createError(
          "Failed to update cart",
          cartNotUpdated(),
          "Failed to update cart with products.",
          TYPES_ERROR.INTERNAL_SERVER_ERROR
        );
      }

      return res.status(200).json({
        message: `Cart with id ${cid} was updated.`,
        cart: updatedCart,
      });
    } catch (error) {
      req.logger.error(
        JSON.stringify(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          null,
          5
        )
      );
      return next(error);
    }
  };

  static updateQuantity = async (req, res, next) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;

      if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        throw CustomError.createError(
          "Invalid Mongo Id.",
          errorMongoId(),
          "Please choose a valid Mongo Id.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw CustomError.createError(
          "Invalid quantity.",
          updateQuantityError(),
          "Please provide a valid quantity for product.",
          TYPES_ERROR.DATA_TYPE
        );
      }

      const cart = await cartsServices.getCartbyId(cid, false);
      if (!cart) {
        throw CustomError.createError(
          "Could not find cart.",
          cartNotFound(cid),
          "Could not find the selected cart.",
          TYPES_ERROR.NOT_FOUND
        );
      }

      const findProduct = cart.products.find(
        (p) => p.product._id.toString() === pid
      );

      if (!findProduct) {
        throw CustomError.createError(
          "Product not found in cart.",
          cartProductNotFound(pid),
          "Could not find the selected product in cart.",
          TYPES_ERROR.NOT_FOUND
        );
      }

      const updatedQuantity = await cartsServices.updateProductQuantity(
        cid,
        pid,
        quantity
      );

      if (!updatedQuantity) {
        throw CustomError.createError(
          "Could not update quantity.",
          updateQuantityError(),
          "The quantity was not updated.",
          TYPES_ERROR.INTERNAL_SERVER_ERROR
        );
      }
      return res.status(200).json({
        message: `Quantity of product with id ${pid} in cart with id ${cid} was updated.`,
        cart: updatedQuantity,
      });
    } catch (error) {
      req.logger.error(
        JSON.stringify(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          null,
          5
        )
      );
      return next(error);
    }
  };

  static deleteProduct = async (req, res, next) => {
    try {
      const { cid, pid } = req.params;

      if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        throw CustomError.createError(
          "Invalid Mongo Id.",
          errorMongoId(),
          "Please choose a valid Mongo Id.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      const cart = await cartsServices.getCartbyId(cid, false);
      if (!cart) {
        throw CustomError.createError(
          "Could not find cart.",
          cartNotFound(cid),
          "Could not find the selected cart.",
          TYPES_ERROR.NOT_FOUND
        );
      }

      const productIndex = cart.products.findIndex(
        (p) => p.product._id.toString() === pid
      );

      if (productIndex === -1) {
        throw CustomError.createError(
          "Could not find product in cart.",
          cartProductNotFound(),
          "Could not find the selected product in cart.",
          TYPES_ERROR.NOT_FOUND
        );
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
      req.logger.error(
        JSON.stringify(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          null,
          5
        )
      );
      return next(error);
    }
  };

  static deleteCart = async (req, res, next) => {
    try {
      const { cid } = req.params;

      if (!isValidObjectId(cid)) {
        throw CustomError.createError(
          "Invalid Mongo Id.",
          errorMongoId(),
          "Please choose a valid Mongo Id.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      const deletedCart = await cartsServices.deleteCart(cid);

      if (!deletedCart) {
        throw CustomError.createError(
          "Could not delete cart.",
          cartNotDeleted(),
          "Could not find cart or an error ocurred.",
          TYPES_ERROR.NOT_FOUND
        );
      }

      return res.status(200).json({
        message: `All products were removed from the cart.`,
        cart: deletedCart,
      });
    } catch (error) {
      req.logger.error(
        JSON.stringify(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          null,
          5
        )
      );
      return next(error);
    }
  };

  static createPurchase = async (req, res, next) => {
    try {
      const { cid } = req.params;
      const user = req.session.user;
      const productsNotProcessed = [];
      const productsProcessed = [];

      if (!isValidObjectId(cid)) {
        throw CustomError.createError(
          "Invalid Mongo Id.",
          errorMongoId(),
          "Please choose a valid Mongo Id.",
          TYPES_ERROR.DATA_TYPE
        );
      }

      const cart = await cartsServices.getCartbyId(cid, false);

      if (!cart) {
        throw CustomError.createError(
          "Could not find cart.",
          cartNotFound(cid),
          "Could not find the selected cart.",
          TYPES_ERROR.NOT_FOUND
        );
      }

      for (const item of cart.products) {
        const findProduct = await productsServices.getProductbyId(item.product);

        if (!findProduct) {
          throw CustomError.createError(
            "Product not found.",
            productNotFound(item.product),
            "Could not find the selected product.",
            TYPES_ERROR.NOT_FOUND
          );
        }

        if (item.quantity <= findProduct.stock) {
          const updatedStock = findProduct.stock - item.quantity;

          await productsServices.updateProduct(findProduct._id, {
            stock: updatedStock,
          });

          productsProcessed.push({
            product: {
              _id: findProduct._id,
              title: findProduct.title,
              price: findProduct.price,
            },
            quantity: item.quantity,
          });
        } else {
          productsNotProcessed.push({
            product: {
              _id: findProduct._id,
              title: findProduct.title,
              price: findProduct.price,
            },
            quantity: item.quantity,
          });
        }
      }

      const totalAmount = productsProcessed.reduce((total, item) => {
        return total + item.product.price * item.quantity;
      }, 0);

      const dataTicket = {
        amount: totalAmount,
        purchaser: req.session.user.email,
        code: `TCK-${Date.now()}`,
        products: productsProcessed,
      };

      const productDetails = productsProcessed
        .map((item) => `${item.product.title} (Quantity: ${item.quantity})`)
        .join(", ");

      let newTicket = "";

      if (productsProcessed.length > 0) {
        newTicket = await ticketsServices.createTicket(dataTicket);
        let result = await sendTicket(
          user.email,
          productDetails,
          newTicket.amount,
          newTicket.purchaser,
          newTicket.code,
          newTicket.purchase_datetime
        );
        if (result.accepted.length > 0) {
          req.logger.info(result);
        }
      }

      await cartsServices.updateCartWithProducts(cid, productsNotProcessed);

      if (productsProcessed.length === 0) {
        if (productsNotProcessed.length > 0) {
          return res.status(200).json({
            redirect: true,
            url: "/products",
            message:
              "The selected products are out of stock or stock is not enough. Please review your seleccion of products.",
            imageUrl: "https://i.postimg.cc/rwx3gPhz/icons8-sad-cat-100.png",
          });
        } else {
          return res.status(200).json({
            redirect: true,
            url: "/products",
            message: "You must select products in order to check out.",
            imageUrl: "https://i.postimg.cc/TYY2zvYm/icons8-geisha-80.png",
          });
        }
      }

      return res.status(200).json({
        message: "Ticket created.",
        newTicketId: newTicket._id,
        "Products processed": productsProcessed,
        "Products not processed": productsNotProcessed,
      });
    } catch (error) {
      req.logger.error(
        JSON.stringify(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          null,
          5
        )
      );
      next(error);
    }
  };
}
