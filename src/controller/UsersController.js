import { usersServices } from "../repository/UsersServices.js";
import { isValidObjectId } from "mongoose";
import { TYPES_ERROR } from "../utils/EErrors.js";
import CustomError from "../utils/CustomError.js";
import { errorMongoId } from "../utils/errorsProducts.js";

export class UsersController {
  static getPremium = async (req, res, next) => {
    const { uid } = req.params;
    try {
      if (!isValidObjectId(uid)) {
        throw CustomError.createError(
          "Invalid Mongo Id.",
          errorMongoId(),
          "Please choose a valid Mongo Id.",
          TYPES_ERROR.INVALID_ARGUMENTS
        );
      }

      let user = await usersServices.getBy({ _id: uid });
      if (!user) {
        throw CustomError.createError(
          "User not found.",
          null,
          "Could not find the selected user.",
          TYPES_ERROR.NOT_FOUND
        );
      }

      if (user.role === "user") {
        user.role = "premium";
      } else if (user.role === "premium") {
        user.role = "user";
      } else {
        throw CustomError.createError(
          "Role changing not valid.",
          null,
          "User role can only be changed between 'user' and 'premium",
          TYPES_ERROR.AUTHORIZATION
        );
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
      return next(error);
    }
  };
}
