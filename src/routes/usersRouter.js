import { Router } from "express";
import { UsersController } from "../controller/UsersController.js";
import { authUser } from "../middleware/authUser.js";

export const router7 = Router();

router7.put("/premium/:uid", authUser(["admin"]), UsersController.getPremium);
