const express = require("express");
const router = express.Router();
const User = require("../models/User");
const requireAuth = require("../middleware/requireAuth");

// GET /users/:id — view profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash").lean();
    if (!user) {
      return res.status(404).render("error", { title: "Not Found", error: "User not found." });
    }
    const isOwner = req.session.userId === user._id.toString();
    res.render("user/profile", { title: user.username + "'s Profile", user, isOwner });
  } catch (err) {
    res.render("error", { title: "Error", error: err.message });
  }
});

// POST /users/:id — update profile (must be logged in as that user)
router.post("/:id", requireAuth, async (req, res) => {
  if (req.session.userId !== req.params.id) {
    return res.status(403).render("error", { title: "Forbidden", error: "You can only edit your own profile." });
  }

  const { username, email } = req.body;

  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { username, email },
      { new: true, runValidators: true }
    )
      .select("-passwordHash")
      .lean();

    req.session.username = updated.username;
    res.redirect("/users/" + req.params.id);
  } catch (err) {
    res.render("error", { title: "Error", error: err.message });
  }
});

// POST /users/:id/delete — delete account (must be logged in as that user)
router.post("/:id/delete", requireAuth, async (req, res) => {
  if (req.session.userId !== req.params.id) {
    return res.status(403).render("error", { title: "Forbidden", error: "You can only delete your own account." });
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    req.session.destroy(() => {
      res.redirect("/");
    });
  } catch (err) {
    res.render("error", { title: "Error", error: err.message });
  }
});

module.exports = router;
