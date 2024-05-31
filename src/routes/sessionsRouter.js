import { Router } from "express";
import passport from "passport";
import { passportCall } from "../middleware/passportCall.js";

export const router4 = Router();

router4.get("/github", passport.authenticate("github", {}), (req, res) => {});

router4.get("/callbackGithub", passportCall("github"), (req, res) => {
  req.session.user = req.user;

  return res.redirect(
    `/products?message=Welcome, ${req.user.name}, rol: ${req.user.rol}!`
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
      rol: user.rol,
    });
  } catch (error) {
    console.log(error);
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

router4.get("/current", (req, res) => {
  if (req.session.user) {
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      message: "User's Profile",
      user: req.session.user,
    });
  } else {
    res.setHeader("Content-Type", "application/json");
    return res.status(401).json({
      error: "Unauthorized",
      message: "No user is currently logged in.",
    });
  }
});
