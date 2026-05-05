import { Router } from "express";
import {
  getUserByEmail,
  createUser,
  comparePassword
} from "../data/users.js";

const router = Router();

router.get("/login", (req, res) => {
  if (req.session.userId) return res.redirect("/");
  res.render("auth/login", { title: "Login" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return res.render("auth/login", {
        title: "Login",
        error: "Invalid email or password."
      });
    }

    const valid = await comparePassword(password, user.passwordHash);

    if (!valid) {
      return res.render("auth/login", {
        title: "Login",
        error: "Invalid email or password."
      });
    }

    req.session.userId = user._id.toString();
    req.session.username = user.username;
    req.session.userRole = user.role || "user";

    res.redirect("/");
  } catch (err) {
    res.render("auth/login", {
      title: "Login",
      error: err.message || err
    });
  }
});

router.get("/signup", (req, res) => {
  if (req.session.userId) return res.redirect("/");
  res.render("auth/signup", { title: "Sign Up" });
});

router.post("/signup", async (req, res) => {
  const { username, email, password, firstName, lastName, major } = req.body;

  try {
    const existing = await getUserByEmail(email);

    if (existing) {
      return res.render("auth/signup", {
        title: "Sign Up",
        error: "Email already in use."
      });
    }

    const user = await createUser({
      username,
      email,
      password,
      firstName,
      lastName,
      major,
      role: "user"
    });

    req.session.userId = user._id.toString();
    req.session.username = user.username;
    req.session.userRole = user.role || "user";

    res.redirect("/");
  } catch (err) {
    res.render("auth/signup", {
      title: "Sign Up",
      error: err.message || err
    });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.redirect("/");
    res.clearCookie("connect.sid");
    res.redirect("/auth/login");
  });
});

export default router;