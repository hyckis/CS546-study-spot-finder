const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.userId) return res.redirect("/auth/login");
  if (req.session.userRole !== "admin") {
    return res.status(403).render("error", {
      title: "Forbidden",
      error: "Admin access is required for this page.",
    });
  }
  next();
};

export default requireAdmin;
