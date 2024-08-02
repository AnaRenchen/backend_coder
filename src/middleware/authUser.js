import { productsServices } from "../repository/ProductsServices.js";
import { isValidObjectId } from "mongoose";

export const authUser = (privileges = [], checkOwnership = false) => {
  return async (req, res, next) => {
    privileges = privileges.map((p) => p.toLowerCase());

    if (privileges.includes("public")) {
      return next();
    }

    if (!req.session.user?.role) {
      req.logger.error(
        `Request ${req.method} from unauthenticated user to the route: ${req.originalUrl}`
      );
      return res
        .status(401)
        .json({ error: `Please login, or problem with the role` });
    }

    if (!privileges.includes(req.session.user.role.toLowerCase())) {
      req.logger.error(
        `Request ${req.method} from unauthenticated user ${req.session.user.email} to the route: ${req.originalUrl}`
      );
      return res
        .status(403)
        .json({ error: `Unauthorised. Insufficient privileges to access.` });
    }

    if (checkOwnership && (req.method === "DELETE" || req.method === "PUT")) {
      const { pid } = req.params;
      if (!isValidObjectId(pid)) {
        return res.status(400).json({
          message: "Please choose a valid Mongo Id.",
        });
      }
      const product = await productsServices.getProductbyId(pid);

      if (!product) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      if (
        req.session.user.role === "premium" &&
        product.owner !== req.session.user.email
      ) {
        return res.status(403).json({
          message:
            "You do not have permission to modify or delete this product.",
        });
      }
    }

    return next();
  };
};
