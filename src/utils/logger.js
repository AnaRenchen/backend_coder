import winston from "winston";
import { config } from "../config/config.js";
import { model } from "mongoose";

const customLevelOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: "bold white redBG",
    error: "red",
    warning: "magenta",
    info: "green",
    http: "cyan",
    debug: "blue",
  },
};

winston.addColors(customLevelOptions.colors);

const devTransport = new winston.transports.Console({
  level: "debug",
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.simple()
  ),
});

const prodTransport = new winston.transports.Console({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.simple()
  ),
});

export const logger = winston.createLogger({
  levels: customLevelOptions.levels,
  transports: [
    new winston.transports.File({
      level: "error",
      filename: "./src/utils/errors.log",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" })
      ),
    }),
  ],
});
if (config.MODE === "dev") {
  logger.add(devTransport);
} else if (config.MODE === "prod") {
  logger.add(prodTransport);
}

export const middLogger = (req, res, next) => {
  req.logger = logger;
  next();
};
