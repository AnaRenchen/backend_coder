export const checkAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/profile");
  }
  next();
};
