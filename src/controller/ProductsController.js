import { productsServices } from "../services/ProductsServices.js";
import { isValidObjectId } from "mongoose";
import { io } from "../app.js";

export class ProductsController {
  static getProducts = async (req, res) => {
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
      res.setHeader("Content-Type", "application/json");
      return res
        .status(500)
        .json({ status: "error", error: "Internal server error." });
    }
  };

  static getProduct = async (req, res) => {
    try {
      let id = req.params.pid;
      if (!isValidObjectId(id)) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: "Please choose a valid Mongo id." });
      }

      let product = await productsServices.getProductbyId({ _id: id });

      if (product) {
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ product });
      } else {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: `There are no products with id: ${id}` });
      }
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  static addProduct = async (req, res) => {
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
      try {
        exists = await productsServices.getProductBy({ code });
      } catch (error) {
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({ error: "Internal server error." });
      }

      if (exists) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: `Product with code ${code} already exists` });
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
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({
          error: `All fields are required: title, description, category, price, status, thumbnail, code, stock.`,
        });
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
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  static updateProduct = async (req, res) => {
    try {
      let id = req.params.pid;

      if (!isValidObjectId(id)) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: "Please choose a valid Mongo id." });
      }

      let updateProperties = req.body;

      if (updateProperties.code) {
        let exists;
        try {
          exists = await productsServices.getProductBy({
            _id: { $ne: id },
            code: updateProperties.code,
          });
          if (exists) {
            res.setHeader("Content-Type", "application/json");
            return res.status(400).json({
              error: `The code ${updateProperties.code} already exists.`,
            });
          }
        } catch (error) {
          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({ error: "Internal server error." });
        }
      }

      if (!updateProperties) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: "Properties not valid." });
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

      if (!valid) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({
          error: `The properties you are trying to update are not valid or do not exist. Valid properties are: ${validProperties}.`,
        });
      }

      let updatedProduct = await productsServices.updateProduct(
        id,
        updateProperties
      );

      if (!updatedProduct) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(404)
          .json({ error: `Product with id ${id} was not found.` });
      }

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({
        message: `Product with id ${id} was updated.`,
        updatedProduct,
      });
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  static deleteProduct = async (req, res) => {
    try {
      let id = req.params.pid;

      if (!isValidObjectId(id)) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: "Please choose a valid Mongo id." });
      }

      let product = await productsServices.getProductbyId(id);
      if (!product) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(404)
          .json({ error: `Product with id ${id} was not found.` });
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
        return res
          .status(400)
          .json({ error: `Product with id ${id} could not be deleted.` });
      }
    } catch (error) {
      return res.status(500).json({ error: "Internal server error." });
    }
  };
}
