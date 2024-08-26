import { Router } from "express";
import { UsersController } from "../controller/UsersController.js";
import { authUser } from "../middleware/authUser.js";
import { upload } from "../utils.js";

export const router7 = Router();

router7.put("/premium/:uid", authUser(["admin"]), UsersController.changeRole);

router7.post(
  "/:uid/documents",
  upload.fields([
    { name: "ID", maxCount: 1 },
    { name: "Proof of address", maxCount: 1 },
    { name: "Account statement", maxCount: 1 },
  ]),
  UsersController.postDocuments
);
router7.post(
  "/:uid/profilePic",
  upload.single("profilePic"),
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
