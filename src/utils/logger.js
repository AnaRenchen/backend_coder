import winston from "winston";
import { config } from "../config/config.js";

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
    fatal: "red",
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
    winston.format.timestamp(),
    winston.format.simple()
  ),
});

export const logger = winston.createLogger({
  levels: customLevelOptions.levels,
  transports: [
    new winston.transports.File({
      level: "error",
      filename: "./src/utils/errors.log",
      format: winston.format.combine(winston.format.timestamp()),
    }),
  ],
});
if (config.MODE === "dev") {
  logger.add(devTransport);
}
export const middLogger = (req, res, next) => {
  req.logger = logger;
  next();
};
