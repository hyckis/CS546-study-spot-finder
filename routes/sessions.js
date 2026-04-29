const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /sessions/current — returns the currently logged in user
router.get("/current", async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Not logged in." });
  }

  try {
    const user = await User.findById(req.session.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;