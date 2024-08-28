import { cartsServices } from "../repository/CartsServices.js";
import { productsServices } from "../repository/ProductsServices.js";
import { ticketsServices } from "../repository/TicketsServices.js";
import { isValidObjectId } from "mongoose";
import CustomError from "../utils/CustomError.js";
import { TYPES_ERROR } from "../utils/EErrors.js";
import { usersServices } from "../repository/UsersServices.js";

export class VistasController {
  static getHome = async (req, res, next) => {
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

  static getRealTimeProducts = async (req, res, next) => {
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
        "owner",
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

  static getProducts = async (req, res, next) => {
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
        "owner",
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

  static getChat = async (req, res, next) => {
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

  static getCarts = async (req, res, next) => {
    try {
      const cid = req.params.cid;
      let cart = null;

      if (req.session.user) {
        cart = await cartsServices.getCartbyId({ _id: cid }, true);
      }

      if (!cart) {
        throw CustomError.createError(
          "Cart not found.",
          null,
          "Could not find the selected cart.",
          TYPES_ERROR.NOT_FOUND
        );
      }
      res.status(200).render("carts", {
        cart,
        login: req.session.user,
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

  static getRegister = (req, res, next) => {
    try {
      let { error } = req.query;
      res.status(200).render("register", { error, login: req.session.user });
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

  static getLogin = async (req, res, next) => {
    try {
      let { error } = req.query;

      res.status(200).render("login", { error, login: req.session.user });
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

  static getProfile = async (req, res, next) => {
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

  static getError = async (req, res, next) => {
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

  static getcheckout = async (req, res, next) => {
    try {
      let cart = null;
      if (req.session.user) {
        cart = {
          _id: req.session.user.cart._id,
        };
      }
      const { tid } = req.params;

      if (!isValidObjectId(tid)) {
        throw CustomError.createError(
          "Invalid ticket Id.",
          null,
          "Ticket Id is not valid.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      const ticket = await ticketsServices.getTicketbyId(tid);

      if (!ticket) {
        throw CustomError.createError(
          "Ticket not found.",
          null,
          "Ticket not found.",
          TYPES_ERROR.NOT_FOUND
        );
      }

      res.render("checkout", {
        ticket,
        login: req.session.user,
        cart,
      });
    } catch (error) {
      req.logger.error("Error fetching ticket:", error);
      return next(error);
    }
  };

  static getRecoverPassword = async (req, res, next) => {
    try {
      let { error } = req.query;

      res
        .status(200)
        .render("recoverPassword", { error, login: req.session.user });
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

  static getResetPassword = async (req, res, next) => {
    try {
      const { token } = req.query;

      if (!token) {
        throw CustomError.createError(
          "Invalid token.",
          null,
          "Not valid or missing token.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      res.render("resetPassword", { token, login: req.session.user });
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

  static getUsers = async (req, res, next) => {
    try {
      let cart = null;
      if (req.session.user) {
        cart = {
          _id: req.session.user.cart._id,
        };
      }

      let users = await usersServices.getUsers();

      users = users.map((user) => {
        let status =
          user.documents && user.documents.length === 3 ? "yes" : "no";

        let lastConnectionFormatted = "";
        if (user.last_connection) {
          const date = new Date(user.last_connection);
          lastConnectionFormatted = `${date.getDate()}-${
            date.getMonth() + 1
          }-${date.getFullYear()}`;
        }

        return {
          ...user,
          status,
          last_connection: lastConnectionFormatted,
        };
      });

      res.setHeader("Content-Type", "text/html");
      res.status(200).render("manageusers", {
        cart,
        login: req.session.user,
        users,
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
}
