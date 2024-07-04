import { TYPES_ERROR } from "./EErrors.js";

export default class CustomError {
  static createError(
    name = "Error",
    cause,
    message,
    code = TYPES_ERROR.INTERNAL_SERVER_ERROR
  ) {
    const error = new Error(message, { cause: cause });
    error.name = name;
    error.code = code;

    throw error;
  }
}
