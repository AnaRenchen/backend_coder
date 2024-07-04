import { TYPES_ERROR } from "../utils/EErrors.js";

export const errorHandler = (error, req, res, next) => {
  console.log(`${error.cause ? error.cause : error.message}`);

  switch (error.code) {
    case TYPES_ERROR.AUTHENTICATION:
      res.setHeader("Content-Type", "application/json");
      return res.status(401).json({ error: "Invalid Credentials." });

    case TYPES_ERROR.AUTHORIZATION:
      res.setHeader("Content-Type", "application/json");
      return res
        .status(403)
        .json({ error: "Unauthorised.Insufficient privileges to access." });

    case TYPES_ERROR.DATA_TYPE:
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `${error.message}` });

    case TYPES_ERROR.INVALID_ARGUMENTS:
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `${error.message}` });

    case TYPES_ERROR.NOT_FOUND:
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ error: `${error.message}` });

    case TYPES_ERROR.INTERNAL_SERVER_ERROR:
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: "Internal Server Error." });

    default:
      res.setHeader("Content-Type", "application/json");
      return res
        .status(500)
        .json({ error: "Error - please contact the administrator." });
  }
};
