export const authUser = (privileges = []) => {
  return (req, res, next) => {
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
        .json({ error: `Unauthorised.Insufficient privileges to access.` });
    }

    return next();
  };
};
