import { Router } from "express";
import { authUser } from "../middleware/authUser.js";
import { ProductsController } from "../controller/ProductsController.js";
import { upload } from "../utils.js";

export const router = Router();

router.get("/", ProductsController.getProducts);

router.get("/:pid", ProductsController.getProduct);

router.post(
  "/",
  authUser(["admin", "premium"]),
  upload.single("thumbnail"),
  ProductsController.addProduct
);

router.put(
  "/:pid",
  authUser(["admin", "premium"], true),
  ProductsController.updateProduct
);

router.delete(
  "/:pid",
  authUser(["admin", "premium"], true),
  ProductsController.deleteProduct
);
