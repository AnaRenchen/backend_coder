import { Router } from "express";
import { MockingController } from "../controller/MockingController.js";

export const router5 = Router();

router5.get("/mockingproducts", MockingController.getMockingProducts);
