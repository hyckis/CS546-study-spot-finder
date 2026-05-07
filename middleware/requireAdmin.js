const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }

  if (req.session.role !== "admin") {
    return res.status(403).render("error", {
      title: "Forbidden",
      error: "You must be an admin to access this page.",
    });
  }

  next();
};

export default requireAdmin;
