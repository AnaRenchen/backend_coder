import { Router } from "express";
import { VistasController } from "../controller/VistasController.js";
import { authUserVistas } from "../middleware/authUserVistas.js";
import { checkAuthenticated } from "../middleware/checkAuthenticate.js";
import { auth } from "../middleware/auth.js";

export const router3 = Router();

router3.get("/home", VistasController.getHome);

router3.get(
  "/realtimeproducts",
  authUserVistas(["admin", "premium"]),
  VistasController.getRealTimeProducts
);

router3.get("/products", VistasController.getProducts);

router3.get(
  "/chat",
  authUserVistas(["user", "premium"]),
  VistasController.getChat
);

router3.get(
  "/carts/:cid",
  authUserVistas(["admin", "user", "premium"]),
  VistasController.getCarts
);

router3.get("/register", checkAuthenticated, VistasController.getRegister);

router3.get("/login", VistasController.getLogin);

router3.get(
  "/profile",
  authUserVistas(["admin", "user", "premium"]),
  VistasController.getProfile
);

router3.get("/error", auth, VistasController.getError);

router3.get("/checkout/:tid", VistasController.getcheckout);

router3.get("/recoverPassword", VistasController.getRecoverPassword);

router3.get("/reset-password", VistasController.getResetPassword);

router3.get(
  "/manageusers",
  authUserVistas(["admin"]),
  VistasController.getUsers
);
