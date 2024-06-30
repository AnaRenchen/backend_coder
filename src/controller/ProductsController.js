import { productsServices } from "../repository/ProductsServices.js";
import { isValidObjectId } from "mongoose";
import { io } from "../app.js";
import { generateMockingProducts } from "../utils.js";
import CustomError from "../errors/CustomError.js";
import { TYPES_ERROR } from "../errors/EErrors.js";
import {
  addProductArguments,
  errorMongoId,
  productCode,
  productNotFound,
  updateProductArguments,
  addProduct,
  deleteProduct,
} from "../errors/errorsProducts.js";

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
      next(
        CustomError.createError(
          "Internal Error",
          error,
          "Failed to get products.",
          TYPES_ERROR.INTERNAL_SERVER_ERROR
        )
      );
    }
  };

  static getProduct = async (req, res, next) => {
    try {
      let id = req.params.pid;
      if (!isValidObjectId(id)) {
        return next(
          CustomError.createError(
            "Invalid Mongo Id.",
            errorMongoId(),
            "Please choose a valid Mongo Id.",
            TYPES_ERROR.DATA_TYPE
          )
        );
      }

      let product = await productsServices.getProductbyId({ _id: id });

      if (product) {
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ product });
      } else {
        return next(
          CustomError.createError(
            "Product not found.",
            productNotFound(id),
            "Could not find the selected product.",
            TYPES_ERROR.NOT_FOUND
          )
        );
      }
    } catch (error) {
      next(
        CustomError.createError(
          "Internal Error.",
          null,
          "Failed to get product.",
          TYPES_ERROR.INTERNAL_SERVER_ERROR
        )
      );
    }
  };

  static addProduct = async (req, res, next) => {
    try {
      let {
        title,
        description,
        category,
        price,
        status,
        thumbnail,
        code,
        stock,
      } = req.body;

      let exists;

      exists = await productsServices.getProductBy({ code });

      if (exists) {
        return next(
          CustomError.createError(
            "Code already exists.",
            productCode(code),
            "Product with the chosen code already exists.",
            TYPES_ERROR.INVALID_ARGUMENTS
          )
        );
      }

      if (
        !title ||
        !description ||
        !category ||
        !price ||
        !status ||
        !thumbnail ||
        !code ||
        !stock
      ) {
        return next(
          CustomError.createError(
            "Invalid or missing properties.",
            addProductArguments(),
            "Must complete all valid properties to add product.",
            TYPES_ERROR.INVALID_ARGUMENTS
          )
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
      });

      let { docs: productsList } = await productsServices.getProductsPaginate();
      io.emit("newproduct", productsList);
      console.log("added");

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ message: "Product added.", newProduct });
    } catch (error) {
      next(
        CustomError.createError(
          "Internal Error",
          addProduct(),
          "Failed to add products.",
          TYPES_ERROR.INTERNAL_SERVER_ERROR
        )
      );
    }
  };

  static updateProduct = async (req, res, next) => {
    try {
      let id = req.params.pid;

      if (!isValidObjectId(id)) {
        return next(
          CustomError.createError(
            "Invalid Mongo Id.",
            errorMongoId(),
            "Please choose a valid Mongo Id.",
            TYPES_ERROR.DATA_TYPE
          )
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
          return next(
            CustomError.createError(
              "Code already exists.",
              productCode(updateProperties.code),
              "There is already another product with the same code.",
              TYPES_ERROR.INVALID_ARGUMENTS
            )
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
      ];
      let properties = Object.keys(updateProperties);
      let valid = properties.every((prop) => validProperties.includes(prop));

      if (!updateProperties || Object.keys(updateProperties).length === 0) {
        return next(
          CustomError.createError(
            "Properties not valid.",
            updateProductArguments(validProperties),
            "You must give at least one valid property to update product.",
            TYPES_ERROR.INVALID_ARGUMENTS
          )
        );
      }

      if (!valid) {
        return next(
          CustomError.createError(
            "Properties not valid.",
            updateProductArguments(validProperties),
            "You must choose a valid property to update product.",
            TYPES_ERROR.INVALID_ARGUMENTS
          )
        );
      }

      let updatedProduct = await productsServices.updateProduct(
        id,
        updateProperties
      );

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({
        message: `Product with id ${id} was updated.`,
        updatedProduct,
      });
    } catch (error) {
      next(
        CustomError.createError(
          "Internal Error",
          error,
          "Failed to update products.",
          TYPES_ERROR.INTERNAL_SERVER_ERROR
        )
      );
    }
  };

  static deleteProduct = async (req, res, next) => {
    try {
      let id = req.params.pid;

      if (!isValidObjectId(id)) {
        return next(
          CustomError.createError(
            "Invalid Mongo Id.",
            errorMongoId(),
            "Please choose a valid Mongo Id.",
            TYPES_ERROR.DATA_TYPE
          )
        );
      }

      let product = await productsServices.getProductbyId(id);
      if (!product) {
        return next(
          CustomError.createError(
            "Product not found.",
            productNotFound(id),
            "Could not find the selected product.",
            TYPES_ERROR.NOT_FOUND
          )
        );
      }

      let result = await productsServices.deleteProduct(id);
      if (result.deletedCount > 0) {
        let { docs: products } = await productsServices.getProductsPaginate();
        io.emit("deletedproduct", products);
        console.log("Product deleted");
        return res
          .status(200)
          .json({ message: `Product with id ${id} was deleted.` });
      } else {
        return next(
          CustomError.createError(
            "Could not delete product.",
            deleteProduct(),
            "Failed to delete product.",
            TYPES_ERROR.INTERNAL_SERVER_ERROR
          )
        );
      }
    } catch (error) {
      next(
        CustomError.createError(
          "Internal Error",
          error,
          "Could not delete product.",
          TYPES_ERROR.INTERNAL_SERVER_ERROR
        )
      );
    }
  };

  static getMockingProducts = async (req, res, next) => {
    try {
      let mockingProducts = [];

      for (let i = 0; i < 100; i++) {
        mockingProducts.push(generateMockingProducts());
      }

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ "Mocking Products": mockingProducts });
    } catch (error) {
      next(
        CustomError.createError(
          "Could not get mocking products.",
          error,
          "Failed to get mocking products.",
          TYPES_ERROR.INTERNAL_SERVER_ERROR
        )
      );
    }
  };
}
