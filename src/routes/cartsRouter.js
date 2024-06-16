import { Router } from "express";
import { authUser } from "../middleware/authUser.js";
import { CartsController } from "../controller/CartsController.js";
export const router2 = Router();

router2.post("/", authUser(["user", "admin"]), CartsController.createCart);

router2.get("/:cid", CartsController.getCarts);

router2.post(
  "/:cid/product/:pid",
  authUser(["user"]),
  CartsController.addProduct
);

router2.put("/:cid", authUser(["user", "admin"]), CartsController.updateCart);

router2.put(
  "/:cid/products/:pid",
  authUser(["user", "admin"]),
  CartsController.updateQuantity
);
router2.delete(
  "/:cid/product/:pid",
  authUser(["user", "admin"]),
  CartsController.deleteProduct
);

router2.delete(
  "/:cid/",
  authUser(["user", "admin"]),
  CartsController.deleteCart
);

router2.post("/:cid/purchase", CartsController.createPurchase);
