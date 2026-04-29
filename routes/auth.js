const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /auth/login
router.get("/login", (req, res) => {
  if (req.session.userId) return res.redirect("/");
  res.render("auth/login", { title: "Login" });
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("auth/login", { title: "Login", error: "Invalid email or password." });
    }

    const valid = await user.isValidPassword(password);
    if (!valid) {
      return res.render("auth/login", { title: "Login", error: "Invalid email or password." });
    }

    req.session.userId = user._id.toString();
    req.session.username = user.username;
    res.redirect("/");
  } catch (err) {
    res.render("auth/login", { title: "Login", error: err.message });
  }
});

// GET /auth/signup
router.get("/signup", (req, res) => {
  if (req.session.userId) return res.redirect("/");
  res.render("auth/signup", { title: "Sign Up" });
});

// POST /auth/signup
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.render("auth/signup", { title: "Sign Up", error: "Email already in use." });
    }

    const user = new User({ username, email, passwordHash: password });
    await user.save();

    req.session.userId = user._id.toString();
    req.session.username = user.username;
    res.redirect("/");
  } catch (err) {
    res.render("auth/signup", { title: "Sign Up", error: err.message });
  }
});

// POST /auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.redirect("/");
    res.clearCookie("connect.sid");
    res.redirect("/auth/login");
  });
});

module.exports = router;
