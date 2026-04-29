const express = require("express");
const router = express.Router();
const Favorite = require("../models/Favorite");
const Spot = require("../models/Spot");
const requireAuth = require("../middleware/requireAuth");

// GET /favorites — list the logged-in user's favorites
router.get("/", requireAuth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.session.userId })
      .populate("spotId")
      .lean();

    // populate returns spotId as the full spot object; rename for clarity in template
    const spots = [];
    for (let i = 0; i < favorites.length; i++) {
      if (favorites[i].spotId) {
        spots.push(favorites[i].spotId);
      }
    }

    res.render("user/favorites", { title: "My Favorites", spots });
  } catch (err) {
    res.render("error", { title: "Error", error: err.message });
  }
});

// POST /favorites — add a spot to favorites
router.post("/", requireAuth, async (req, res) => {
  const { spotId } = req.body;

  try {
    const spot = await Spot.findById(spotId);
    if (!spot) {
      return res.status(404).render("error", { title: "Not Found", error: "Spot not found." });
    }

    const favorite = new Favorite({ userId: req.session.userId, spotId });
    await favorite.save();
    res.redirect("/spots/" + spotId);
  } catch (err) {
    if (err.code === 11000) {
      return res.redirect("/spots/" + req.body.spotId);
    }
    res.render("error", { title: "Error", error: err.message });
  }
});

// POST /favorites/:spotId/remove — remove a favorite
router.post("/:spotId/remove", requireAuth, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({
      userId: req.session.userId,
      spotId: req.params.spotId,
    });
    res.redirect("/favorites");
  } catch (err) {
    res.render("error", { title: "Error", error: err.message });
  }
});

module.exports = router;
