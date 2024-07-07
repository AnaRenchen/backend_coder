import { Router } from "express";

export const router6 = Router();

router6.get("/", (req, res) => {
  req.logger.debug("Test logger debug");
  req.logger.http("Test logger http");
  req.logger.info("Test logger info");
  req.logger.warning("Test logger warning");
  req.logger.error("Test logger error");
  req.logger.fatal("Test logger fatal");

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({ message: "Loggers generated sucessfully." });
});
