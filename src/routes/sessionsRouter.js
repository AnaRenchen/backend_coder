import { Router } from "express";
import passport from "passport";
import { passportCall } from "../middleware/passportCall.js";
import { authUser } from "../middleware/authUser.js";
import { usersServices } from "../repository/UsersServices.js";
import { UsersDTO } from "../dto/UsersDTO.js";
import { isValidObjectId } from "mongoose";
import { config } from "../config/config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { emailRecoverPassword } from "../config/mailing.config.js";
import { generateHash, validatePassword } from "../utils.js";

export const router4 = Router();

router4.get("/github", passport.authenticate("github", {}), (req, res) => {});

router4.get("/callbackGithub", passportCall("github"), (req, res) => {
  req.session.user = req.user;

  return res.redirect(
    `/products?message=Welcome, ${req.user.name}, role: ${req.user.role}!`
  );
});

router4.get("/error", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  return res.status(500).json({
    error: `Unexpected error.`,
  });
});

router4.post("/register", passportCall("register"), async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({ message: `Registration sucessful.` });
});

router4.post("/login", passportCall("login"), async (req, res) => {
  try {
    let user = { ...req.user };
    delete user.password;
    req.session.user = user;

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      payload: "Login successful!",
      username: user.name,
      role: user.role,
    });
  } catch (error) {
    req.logger.error(
      JSON.stringify(
        {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code,
        },
        null,
        5
      )
    );
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Unexpected error.`,
      detalle: `${error.message}`,
    });
  }
});

router4.get("/logout", async (req, res) => {
  try {
    req.session.destroy((e) => {
      if (e) {
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({
          error: `Unexpected error.`,
          detalle: `${error.message}`,
        });
      }
    });
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ payload: "Logout successful." });
  } catch (error) {
    req.logger.error(
      JSON.stringify(
        {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code,
        },
        null,
        5
      )
    );
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Unexpected error.`,
      detalle: `${error.message}`,
    });
  }
});

router4.get(
  "/current",
  authUser(["user", "admin", "premium"]),
  async (req, res) => {
    let userId = req.session.user._id;

    let user = await usersServices.getBy({ _id: userId });
    user = new UsersDTO(user);

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ login: user });
  }
);

router4.put("/premium/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    if (!isValidObjectId(uid)) {
      return res.status(400).json({
        error: `You must choose a valid Mongo ID.`,
      });
    }

    let user = await usersServices.getBy({ _id: uid });
    if (!user) {
      return res.status(404).json({
        error: `Could not find the seleccted user.`,
      });
    }

    if (user.role === "user") {
      user.role = "premium";
    } else if (user.role === "premium") {
      user.role = "user";
    } else {
      return res.status(400).json({
        error: `"User role can only be changed between 'user' and 'premium'.`,
      });
    }

    let updatedUser = await usersServices.updateUser(uid, {
      role: user.role,
    });

    req.logger.info(updatedUser);

    return res.status(200).json({
      message: "User role updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Unexpected error.`,
      detalle: `${error.message}`,
    });
  }
});

router4.post("/requestPassword", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please enter your email." });
  }

  try {
    const user = await usersServices.getBy({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with given email does not exist." });
    }

    const token = jwt.sign({ userId: user._id }, config.SECRET, {
      expiresIn: "1h",
    });

    console.log(token);
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    await emailRecoverPassword(user.email, resetUrl);
    return res
      .status(200)
      .json({ message: "Password recover link was sent to your email." });
  } catch (error) {
    req.logger.error("Error requesting password recovery:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router4.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decodeToken = jwt.verify(token, config.SECRET);
    const user = await usersServices.getBy({ _id: decodeToken.userId });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired token. Please request a new password recovery.",
      });
    }

    const passwordIsSame = bcrypt.compareSync(newPassword, user.password);
    console.log("New Password:", newPassword);
    console.log("User Password Hash:", user.password);
    console.log("Password Validation Result:", passwordIsSame);

    if (passwordIsSame) {
      return res
        .status(400)
        .json({ message: "You cannot use the same password as before." });
    }

    const hashedPassword = generateHash(newPassword);
    await usersServices.updateUser(user._id, { password: hashedPassword });

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error); // Cambiado a console.error
    req.logger.error("Error resetting password:", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
});
