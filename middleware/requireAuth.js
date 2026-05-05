const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }
  next();
};

export default requireAuth;
//module.exports = requireAuth;