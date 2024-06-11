export const authUserVistas = (privileges = []) => {
  return (req, res, next) => {
    privileges = privileges.map((p) => p.toLowerCase());

    if (privileges.includes("public")) {
      return next();
    }

    if (!req.session.user?.role) {
      return res.redirect(`/login`);
    }

    if (!privileges.includes(req.session.user.role.toLowerCase())) {
      return res.redirect(
        `/error?message=Unauthorised. Insufficient privileges to access.`
      );
    }

    return next();
  };
};
