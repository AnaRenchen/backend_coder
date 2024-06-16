import { cartsServices } from "../repository/CartsServices.js";
import { productsServices } from "../repository/ProductsServices.js";

export class VistasController {
  static getHome = async (req, res) => {
    try {
      let cart = null;
      if (req.session.user) {
        cart = {
          _id: req.session.user.cart._id,
        };
      }

      let { docs: products } = await productsServices.getProductsPaginate();

      res.setHeader("Content-Type", "text/html");
      res.status(200).render("home", {
        products,
        titulo: "Horisada",
        login: req.session.user,
        cart,
      });
    } catch (error) {
      res.setHeader("Content-Type", "text/html");
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  static getRealTimeProducts = async (req, res) => {
    try {
      let cart = null;
      if (req.session.user) {
        cart = {
          _id: req.session.user.cart._id,
        };
      }

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

      const prevParams = new URLSearchParams({
        ...req.query,
        page: result.prevPage,
        totalPages: result.totalPages,
      });
      const prevLink = hasPrevPage
        ? `/realtimeproducts?${prevParams.toString()}`
        : null;

      const nextParams = new URLSearchParams({
        ...req.query,
        page: result.nextPage,
        totalPages: result.totalPages,
      });
      const nextLink = hasNextPage
        ? `/realtimeproducts?${nextParams.toString()}`
        : null;
      const currentPage = page;

      res.render("realtimeproducts", {
        cart,
        status: "success",
        products: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: page,
        hasPrevPage: hasPrevPage,
        hasNextPage: hasNextPage,
        prevLink: prevLink,
        nextLink: nextLink,
        currentPage,
        login: req.session.user,
      });
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  };

  static getProducts = async (req, res) => {
    try {
      let cart = null;
      if (req.session.user) {
        cart = {
          _id: req.session.user.cart._id,
        };
      }

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

      const prevParams = new URLSearchParams({
        ...req.query,
        page: result.prevPage,
        totalPages: result.totalPages,
      });
      const prevLink = hasPrevPage
        ? `/products?${prevParams.toString()}`
        : null;

      const nextParams = new URLSearchParams({
        ...req.query,
        page: result.nextPage,
        totalPages: result.totalPages,
      });
      const nextLink = hasNextPage
        ? `/products?${nextParams.toString()}`
        : null;
      const currentPage = page;

      res.render("products", {
        status: "success",
        products: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: page,
        hasPrevPage: hasPrevPage,
        hasNextPage: hasNextPage,
        prevLink: prevLink,
        nextLink: nextLink,
        currentPage,
        cart,
        login: req.session.user,
      });
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  };

  static getChat = async (req, res) => {
    try {
      let cart = null;
      if (req.session.user) {
        cart = {
          _id: req.session.user.cart._id,
        };
      }

      res.setHeader("Content-Type", "text/html");
      res.status(200).render("chat", { cart, login: req.session.user });
    } catch (error) {
      res.setHeader("Content-Type", "text/html");
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  static getCarts = async (req, res) => {
    try {
      const cid = req.params.cid;
      let cart = null;

      if (req.session.user) {
        cart = await cartsServices.getCartbyId({ _id: cid }, true);
      }

      if (!cart) {
        res.status(404).send("Cart not found");
        return;
      }
      res.status(200).render("carts", {
        cart,
        login: req.session.user,
      });
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  };

  static getRegister = (req, res) => {
    try {
      let { error } = req.query;
      res.status(200).render("register", { error, login: req.session.user });
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  };

  static getLogin = async (req, res) => {
    try {
      let { error } = req.query;

      res.status(200).render("login", { error, login: req.session.user });
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  };

  static getProfile = async (req, res) => {
    try {
      let cart = null;
      if (req.session.user) {
        cart = {
          _id: req.session.user.cart._id,
        };
      }

      res.status(200).render("profile", {
        user: req.session.user,
        login: req.session.user,
        cart,
      });
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  };

  static getError = async (req, res) => {
    try {
      const errorMessage = req.query.message || "Error";
      let cart = null;
      if (req.session.user) {
        cart = {
          _id: req.session.user.cart._id,
        };
      }

      let { docs: products } = await productsServices.getProductsPaginate();

      res.setHeader("Content-Type", "text/html");
      res.status(200).render("error", {
        products,
        titulo: "Horisada",
        login: req.session.user,
        cart,
        errorMessage,
      });
    } catch (error) {
      res.setHeader("Content-Type", "text/html");
      return res.status(500).json({ error: "Internal server error." });
    }
  };
}