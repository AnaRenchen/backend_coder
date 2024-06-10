import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { checkAuthenticated } from "../middleware/checkAuthenticate.js";
import { VistasController } from "../controller/VistasController.js";

export const router3 = Router();

router3.get("/home", VistasController.getHome);

router3.get("/realtimeproducts", auth, VistasController.getRealTimeProducts);

router3.get("/products", VistasController.getProducts);

router3.get("/chat", VistasController.getChat);

router3.get("/carts/:cid", auth, VistasController.getCarts);

router3.get("/register", checkAuthenticated, VistasController.getRegister);

router3.get("/login", VistasController.getLogin);

router3.get("/profile", auth, VistasController.getProfile);
