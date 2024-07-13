import { Router } from "express";
import { authUser } from "../middleware/authUser.js";
import { ProductsController } from "../controller/ProductsController.js";

export const router = Router();

router.get("/", ProductsController.getProducts);

router.get("/:pid", ProductsController.getProduct);

router.post("/", authUser(["admin", "premium"]), ProductsController.addProduct);

router.put("/:pid", authUser(["admin"]), ProductsController.updateProduct);

router.delete("/:pid", authUser(["admin"]), ProductsController.deleteProduct);
