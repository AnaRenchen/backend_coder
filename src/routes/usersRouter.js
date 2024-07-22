import { Router } from "express";
import { UsersController } from "../controller/UsersController.js";

export const router7 = Router();

router7.put("/premium/:uid", UsersController.getPremium);
