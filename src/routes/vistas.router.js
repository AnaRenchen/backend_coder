import { Router } from "express";
import ProductManagerMongo from "../dao/productmanagerMongo.js";
import CartsManagerMongo from "../dao/cartsmanagerMongo.js";
import { auth } from "../middleware/auth.js";

export const router3 = Router();

const managerMongo = new ProductManagerMongo();
const cartsMongo = new CartsManagerMongo();

router3.get("/home", async (req, res) => {
  try {
    let cartId = null;
    if (req.session.user) {
      cartId = req.session.user.cart ? req.session.user.cart._id : null;
    }
    let { docs: products } = await managerMongo.getProductsPaginate();

    res.setHeader("Content-Type", "text/html");
    res.status(200).render("home", {
      products,
      titulo: "Horisada",
      login: req.session.user,
      cartId,
    });
  } catch (error) {
    console.log(error);
    res.setHeader("Content-Type", "text/html");
    return res.status(500).json({ error: "Internal server error." });
  }
});

router3.get("/realtimeproducts", auth, async (req, res) => {
  try {
    let cartId = null;
    if (req.session.user) {
      cartId = req.session.user.cart ? req.session.user.cart._id : null;
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

    let result = await managerMongo.getProductsPaginate(
      page,
      limit,
      filter,
      sortOptions
    );

    const hasNextPage = result.nextPage !== null;
    const hasPrevPage = result.prevPage !== null;

    const prevLink = hasPrevPage
      ? `/products?page=${result.prevPage}&limit=${limit}`
      : null;
    const nextLink = hasNextPage
      ? `/products?page=${result.nextPage}&limit=${limit}`
      : null;

    res.render("realtimeproducts", {
      cartId,
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
      login: req.session.user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router3.get("/products", async (req, res) => {
  try {
    let cartId = null;
    if (req.session.user) {
      cartId = req.session.user.cart ? req.session.user.cart._id : null;
    }

    let limit = req.query.limit || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort;
    let message = req.query;

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

    let result = await managerMongo.getProductsPaginate(
      page,
      limit,
      filter,
      sortOptions
    );

    const hasNextPage = result.nextPage !== null;
    const hasPrevPage = result.prevPage !== null;

    const prevLink = hasPrevPage
      ? `/products?page=${result.prevPage}&limit=${limit}`
      : null;
    const nextLink = hasNextPage
      ? `/products?page=${result.nextPage}&limit=${limit}`
      : null;

    const loginSuccess = req.query.loginSuccess === "true";

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
      cartId,
      loginSuccess: loginSuccess,
      login: req.session.user,
      message,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router3.get("/chat", async (req, res) => {
  try {
    let cartId = null;
    if (req.session.user) {
      cartId = req.session.user.cart ? req.session.user.cart._id : null;
    }

    res.setHeader("Content-Type", "text/html");
    res.status(200).render("chat", { cartId, login: req.session.user });
  } catch (error) {
    console.log(error);
    res.setHeader("Content-Type", "text/html");
    return res.status(500).json({ error: "Internal server error." });
  }
});

router3.get("/carts/:cid", auth, async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartsMongo.getCartbyId({ _id: cid }, true);

    if (!cart) {
      res.status(404).send("Cart not found");
      return;
    }
    res.status(200).render("carts", { cart, login: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router3.get(
  "/register",
  (req, res, next) => {
    if (req.session.user) {
      return res.redirect("/profile");
    }
    next();
  },
  (req, res) => {
    try {
      let { error } = req.query;
      res.status(200).render("register", { error, login: req.session.user });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  }
);

router3.get("/login", async (req, res) => {
  try {
    let { error, message } = req.query;

    res
      .status(200)
      .render("login", { error, message, login: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router3.get("/profile", auth, async (req, res) => {
  try {
    let cartId = null;
    if (req.session.user) {
      cartId = req.session.user.cart ? req.session.user.cart._id : null;
    }
    res.status(200).render("profile", {
      user: req.session.user,
      login: req.session.user,
      cartId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});
