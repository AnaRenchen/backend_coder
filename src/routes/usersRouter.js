import { Router } from "express";
import { UsersController } from "../controller/UsersController.js";
import { authUser } from "../middleware/authUser.js";
import { upload } from "../utils.js";
import { uploadProfiles } from "../utils.js";

export const router7 = Router();

router7.put("/premium/:uid", authUser(["admin"]), UsersController.getPremium);

router7.post("/:uid/documents", upload, UsersController.postDocuments);
router7.post(
  "/:uid/profilePic",
  uploadProfiles,
  UsersController.postProfilePic
);

router7.get("/", UsersController.getUsers);

router7.get(
  "/inactiveUsers",
  authUser(["admin"]),
  UsersController.getInactiveUsers
);

router7.delete("/", authUser(["admin"]), UsersController.deleteUsers);

router7.delete("/:uid", authUser(["admin"]), UsersController.deleteOneUser);
