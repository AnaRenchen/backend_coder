import { Router } from "express";
import { UsersController } from "../controller/UsersController.js";
import { authUser } from "../middleware/authUser.js";
import { upload } from "../utils.js";

export const router7 = Router();

router7.put("/premium/:uid", authUser(["admin"]), UsersController.getPremium);

router7.post("/:uid/documents", upload, UsersController.postDocuments);
