import { productsServices } from "../repository/ProductsServices.js";
import { isValidObjectId } from "mongoose";
import { io } from "../app.js";
import { sendDeletedProductEmail } from "../config/mailing.config.js";
import CustomError from "../utils/CustomError.js";
import { TYPES_ERROR } from "../utils/EErrors.js";
import {
  addProductArgumentsError,
  errorMongoId,
  productCodeError,
  productNotFound,
  updateProductArgumentsError,
  deleteProductError,
  addProductError,
  updateProductError,
} from "../utils/errorsProducts.js";

export class ProductsController {
  static getProducts = async (req, res, next) => {
    try {
      let limit = req.query.limit || 10;
      let page = req.query.page || 1;
      let sort = req.query.sort;

      const filter = {};
      const validCategories = [
        "title",
        "description",
        "price",
        "thumbnail",
        "code",
        "stock",
        "status",
        "category",
      ];

      for (const key in req.query) {
        if (validCategories.includes(key)) {
          filter[key] = req.query[key];
        }
      }

      const sortOptions = {};
      if (sort === "asc") {
        sortOptions.price = 1;
      } else if (sort === "desc") {
        sortOptions.price = -1;
      }

      let result = await productsServices.getProductsPaginate(
        page,
        limit,
        filter,
        sortOptions
      );

      const hasNextPage = result.nextPage !== null;
      const hasPrevPage = result.prevPage !== null;

      const prevLink = hasPrevPage
        ? `http://localhost:3000/products?page=${result.prevPage}&limit=${limit}`
        : null;
      const nextLink = hasNextPage
        ? `http://localhost:3000/products?page=${result.nextPage}&limit=${limit}`
        : null;

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({
        status: "success",
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: page,
        hasPrevPage: hasPrevPage,
        hasNextPage: hasNextPage,
        prevLink: prevLink,
        nextLink: nextLink,
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

  static getProduct = async (req, res, next) => {
    try {
      let id = req.params.pid;
      if (!isValidObjectId(id)) {
        throw CustomError.createError(
          "Invalid Mongo Id.",
          errorMongoId(),
          "Please choose a valid Mongo Id.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      let product = await productsServices.getProductbyId({ _id: id });

      if (product) {
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ product });
      } else {
        throw CustomError.createError(
          "Product not found.",
          productNotFound(id),
          "Could not find the selected product.",
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

  static addProduct = async (req, res, next) => {
    try {
      let {
        title,
        description,
        category,
        price,
        thumbnail,
        status,
        code,
        stock,
      } = req.body;

      if (req.file) {
        thumbnail = req.file.path;
      }

      let exists;
      let owner = req.session.user;
      if (!owner || (owner.role !== "premium" && owner.role !== "admin")) {
        owner = { email: "adminCoder@coder.com" };
      }

      exists = await productsServices.getProductBy({ code });

      if (exists) {
        throw CustomError.createError(
          "Code already exists.",
          productCodeError(code),
          "Product with the chosen code already exists.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      if (
        !title ||
        !description ||
        !category ||
        !price ||
        !status ||
        !code ||
        !stock ||
        !thumbnail
      ) {
        throw CustomError.createError(
          "Invalid or missing properties.",
          addProductArgumentsError(),
          "Must complete all valid properties to add product.Valid properties are: title, description, category, price, status, thumbnail, code, stock.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      let newProduct = await productsServices.addProduct({
        title,
        description,
        category,
        price,
        status,
        thumbnail,
        code,
        stock,
        owner: owner.email,
      });

      if (!newProduct) {
        throw CustomError.createError(
          "Error adding product.",
          addProductError(),
          "Could not add product.",
          TYPES_ERROR.INTERNAL_SERVER_ERROR
        );
      }

      let { docs: productsList } = await productsServices.getProductsPaginate();
      io.emit("newproduct", productsList);
      req.logger.info("added");

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ message: "Product added.", newProduct });
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

  static updateProduct = async (req, res, next) => {
    try {
      let id = req.params.pid;
      if (!isValidObjectId(id)) {
        throw CustomError.createError(
          "Invalid Mongo Id.",
          errorMongoId(),
          "Please choose a valid Mongo Id.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      const findProduct = await productsServices.getProductbyId(id);
      if (!findProduct) {
        throw CustomError.createError(
          "Cart not find product.",
          productNotFound(id),
          "Could not find the selected product in cart.",
          TYPES_ERROR.NOT_FOUND
        );
      }

      let updateProperties = req.body;

      if (updateProperties.code) {
        let exists;

        exists = await productsServices.getProductBy({
          _id: { $ne: id },
          code: updateProperties.code,
        });
        if (exists) {
          throw CustomError.createError(
            "Code already exists.",
            productCodeError(updateProperties.code),
            "There is already another product with the same code.",
            TYPES_ERROR.INVALID_ARGUMENTS
          );
        }
      }

      let validProperties = [
        "title",
        "description",
        "category",
        "price",
        "status",
        "thumbnail",
        "code",
        "stock",
        "owner",
      ];
      let properties = Object.keys(updateProperties);
      let valid = properties.every((prop) => validProperties.includes(prop));

      if (!updateProperties || Object.keys(updateProperties).length === 0) {
        throw CustomError.createError(
          "Properties not valid.",
          updateProductArgumentsError(validProperties),
          "You must give at least one valid property to update product.Valid properties are: title,description,category,price,status,thumbnail,code,stock, owner.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      if (!valid) {
        throw CustomError.createError(
          "Properties not valid.",
          updateProductArgumentsError(validProperties),
          "You must choose a valid property to update product.Valid properties are: title,description,category,price,status,thumbnail,code,stock, owner.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      let updatedProduct = await productsServices.updateProduct(
        id,
        updateProperties
      );

      if (!updatedProduct) {
        throw CustomError.createError(
          "Error updating product.",
          updateProductError(),
          "Could not update product.",
          TYPES_ERROR.INTERNAL_SERVER_ERROR
        );
      }

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({
        message: `Product with id ${id} was updated.`,
        updatedProduct,
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
      let id = req.params.pid;
      if (!isValidObjectId(id)) {
        throw CustomError.createError(
          "Invalid Mongo Id.",
          errorMongoId(),
          "Please choose a valid Mongo Id.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      let product = await productsServices.getProductbyId(id);
      if (!product) {
        throw CustomError.createError(
          "Product not found.",
          productNotFound(id),
          "Could not find the selected product.",
          TYPES_ERROR.NOT_FOUND
        );
      }

      let owner = product.owner;
      let productName = product.title;

      let result = await productsServices.deleteProduct(id);
      if (result.deletedCount > 0) {
        let { docs: products } = await productsServices.getProductsPaginate();
        io.emit("deletedproduct", products);
        req.logger.info("Product deleted");
        if (owner !== "adminCoder@coder.com") {
          await sendDeletedProductEmail(owner, productName);
        }
        return res
          .status(200)
          .json({ message: `Product with id ${id} was deleted.` });
      } else {
        throw CustomError.createError(
          "Could not delete product.",
          deleteProductError(),
          "Failed to delete product.",
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
}
