import { Router } from "express";
import passport from "passport";
import { passportCall } from "../middleware/passportCall.js";
import { authUser } from "../middleware/authUser.js";
import { usersServices } from "../repository/UsersServices.js";
import { UsersDTO } from "../dto/UsersDTO.js";

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
  return res.status(200).json({ message: `Unexpected error.` });
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
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Unexpected error.`,
      detalle: `${error.message}`,
    });
  }
});

router4.get("/current", authUser(["user", "admin"]), async (req, res) => {
  let userId = req.session.user._id;

  let user = await usersServices.getBy({ _id: userId });
  user = new UsersDTO(user);

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ login: user });
});
