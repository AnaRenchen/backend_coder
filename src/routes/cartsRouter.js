import { Router } from "express";
import { authUser } from "../middleware/authUser.js";
import { CartsController } from "../controller/CartsController.js";
export const router2 = Router();

router2.post("/", authUser(["user", "admin"]), CartsController.createCart);

router2.get("/:cid", CartsController.getCarts);

router2.post(
  "/:cid/product/:pid",
  authUser(["user", "premium"]),
  CartsController.addProduct
);

router2.put(
  "/:cid",

  CartsController.updateCart
);
//authUser(["user", "admin", "premium"]),

router2.put(
  "/:cid/products/:pid",
  authUser(["user", "admin", "premium"]),
  CartsController.updateQuantity
);
router2.delete(
  "/:cid/product/:pid",
  authUser(["user", "admin", "premium"]),
  CartsController.deleteProduct
);

router2.delete(
  "/:cid/",
  authUser(["user", "admin", "premium"]),
  CartsController.deleteCart
);

router2.post(
  "/:cid/purchase",
  authUser(["user", "premium"]),
  CartsController.createPurchase
);
