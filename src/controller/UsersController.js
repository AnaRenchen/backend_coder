import { usersServices } from "../repository/UsersServices.js";
import { isValidObjectId } from "mongoose";
import { TYPES_ERROR } from "../utils/EErrors.js";
import CustomError from "../utils/CustomError.js";
import { UsersDTO } from "../dto/UsersDTO.js";
import moment from "moment";
import { sendDeletedUsersEmail } from "../config/mailing.config.js";

export class UsersController {
  static getPremium = async (req, res, next) => {
    const { uid } = req.params;
    try {
      if (!isValidObjectId(uid)) {
        throw CustomError.createError(
          "Invalid Mongo Id.",
          null,
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
      req.logger.error(
        JSON.stringify(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          null,
          5
        )
      );
      return next(error);
    }
  };

  static postDocuments = async (req, res, next) => {
    const { uid } = req.params;

    try {
      if (!isValidObjectId(uid)) {
        throw CustomError.createError(
          "Invalid Mongo Id.",
          null,
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

      return res.status(200).json({
        message: "Documents uploaded successfully.",
        documents: req.files,
      });
    } catch (error) {
      req.logger.error(
        JSON.stringify(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          null,
          5
        )
      );
      return next(error);
    }
  };

  static postProfilePic = async (req, res, next) => {
    try {
      const { uid } = req.params;

      if (!isValidObjectId(uid)) {
        throw CustomError.createError(
          "Invalid Mongo Id.",
          null,
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

      return res.status(200).json({
        message: "Profile photo uploaded successfully.",
        profilePic: req.file,
      });
    } catch (error) {
      req.logger.error(
        JSON.stringify(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          null,
          5
        )
      );
      return next(error);
    }
  };

  static getUsers = async (req, res, next) => {
    try {
      let users = await usersServices.getUsers();

      if (!users || users.length === 0) {
        throw CustomError.createError(
          "No users found.",
          null,
          "Could not find users.",
          TYPES_ERROR.NOT_FOUND
        );
      }
      let usersDTO = users.map((user) => new UsersDTO(user));

      return res.status(200).json({
        message: "These are all the registered users.",
        users: usersDTO,
      });
    } catch (error) {
      req.logger.error(
        JSON.stringify(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          null,
          5
        )
      );
      return next(error);
    }
  };

  static getInactiveUsers = async (req, res, next) => {
    try {
      const maxTimeConnection = moment().subtract(2, "days").toDate();

      const filter = {
        last_connection: { $lt: maxTimeConnection },
      };

      let inactiveUsers = await usersServices.getByMany(filter);

      if (inactiveUsers.length === 0) {
        return res.status(200).json({
          message: "There are no inactive users.",
        });
      }

      return res.status(200).json({
        message: "These are the inactive users:",
        payload: inactiveUsers,
      });
    } catch (error) {
      req.logger.error(
        JSON.stringify(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          null,
          5
        )
      );
      return next(error);
    }
  };

  static deleteUsers = async (req, res, next) => {
    try {
      const maxTimeConnection = moment().subtract(2, "days").toDate();

      const filter = {
        last_connection: { $lt: maxTimeConnection },
      };

      let inactiveUsers = await usersServices.getByMany(filter);

      if (inactiveUsers.length === 0) {
        return res.status(200).json({
          message: "There are no inactive users.",
        });
      }
      const deletedEmails = inactiveUsers.map((user) => user.email);

      await sendDeletedUsersEmail(deletedEmails);

      let result = await usersServices.deleteUsers(filter);

      req.logger.info(result);

      return res.status(200).json({
        message: `${result.deletedCount} user(s) deleted due to inactivity.`,
      });
    } catch (error) {
      req.logger.error(
        JSON.stringify(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          null,
          5
        )
      );
      return next(error);
    }
  };

  static deleteOneUser = async (req, res, next) => {
    try {
      const { uid } = req.params;

      if (!isValidObjectId(uid)) {
        throw CustomError.createError(
          "Invalid Mongo Id.",
          null,
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

      await usersServices.deleteUser({ _id: uid });

      return res.status(200).json({
        message: `User with id ${uid} was deleted `,
      });
    } catch (error) {
      req.logger.error(
        JSON.stringify(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          null,
          5
        )
      );
      return next(error);
    }
  };
}
