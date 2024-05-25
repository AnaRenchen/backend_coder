import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { SECRET } from "../utils.js";

export const router4 = Router();

router4.get("/github", passport.authenticate("github", {}), (req, res) => {});

router4.get(
  "/callbackGithub",
  passport.authenticate("github", {
    failureRedirect: "/login?error=Failed to login, please try again.",
  }),
  (req, res) => {
    req.session.user = req.user;

    return res.redirect(
      `/products?message=Welcome, ${req.user.name}, rol: ${req.user.rol}!`
    );
  }
);

router4.get("/error", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  return res.status(500).json({
    error: `Unexpected error.`,
    detail: `Failed to register.`,
  });
});

router4.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/register?error=Failed to register, please try again.",
  }),
  async (req, res) => {
    let { web } = req.body;
    if (web) {
      return res.redirect(`/login?message=Registration sucessful!`);
    } else {
      res.setHeader("Content-Type", "application/json");
      return res.status(201).json({
        message: "Registration process successful.",
      });
    }
  }
);

router4.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/login?error=Failed to login, please try again.",
  }),
  async (req, res) => {
    try {
      let { web } = req.body;

      let user = { ...req.user };
      delete user.password;
      req.session.user = user;

      if (web) {
        return res.redirect(
          `/products?message=Welcome, ${user.name}! rol:${user.rol}`
        );
      } else {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(200)
          .json({ payload: "Login successful!", username: user.name });
      }
    } catch (error) {
      console.log(error);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Unexpected error.`,
        detalle: `${error.message}`,
      });
    }
  }
);

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
