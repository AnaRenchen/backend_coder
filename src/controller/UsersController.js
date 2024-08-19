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

      const requiredDocuments = ["ID", "Proof of address", "Account statement"];
      const userDocuments = user.documents.map((doc) => doc.name);
      const hasAllDocuments = requiredDocuments.every((docName) =>
        userDocuments.includes(docName)
      );

      if (user.role === "user" && hasAllDocuments) {
        user.role = "premium";
      } else if (user.role === "premium") {
        user.role = "user";
      } else {
        throw CustomError.createError(
          "Role changing not valid.",
          null,
          "User role can only be changed between 'user' and 'premium' or you must upload your ID, Proof of address and Acount statement to become a 'premium' user.",
          TYPES_ERROR.AUTHORIZATION
        );
      }

      let updatedUser = await usersServices.updateUser(uid, {
        role: user.role,
      });

      return res.status(200).json({
        message: "User role updated successfully.",
        user: updatedUser,
      });
    } catch (error) {
      return next(error);
    }
  };

  static postDocuments = async (req, res, next) => {
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

      const files = req.files || {};
      const newDocuments = Object.keys(files).map((key) => ({
        name: key,
        reference: files[key][0].path,
      }));

      const existingDocuments = user.documents || [];

      const updatedDocuments = existingDocuments
        .filter(
          (doc) => !newDocuments.some((newDoc) => newDoc.name === doc.name)
        )
        .concat(newDocuments);

      await usersServices.updateUser(uid, {
        documents: updatedDocuments,
      });

      res.status(200).json({
        message: "Documents uploaded successfully.",
        documents: req.files,
      });
    } catch (error) {
      return next(error);
    }
  };

  static postProfilePic = async (req, res, next) => {
    try {
      const { uid } = req.params;

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

      let profilePic;
      if (req.file) {
        profilePic = req.file.path;
      }

      await usersServices.updateUser(uid, {
        profilePic: profilePic,
      });

      res.status(200).json({
        message: "Profile photo uploaded successfully.",
        profilePic: req.file,
      });
    } catch (error) {
      return next(error);
    }
  };
}
