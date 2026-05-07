import { Router } from "express";
import {
  getFavoritesByUserId,
  addFavorite,
  removeFavorite
} from "../data/favorites.js";
import { getSpotById } from "../data/spots.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const spots = await getFavoritesByUserId(req.session.userId);

    res.render("user/favorites", {
      title: "My Favorites",
      spots
    });
  } catch (err) {
    res.render("error", {
      title: "Error",
      error: err.message || err
    });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const { spotId } = req.body;

  try {
    const spot = await getSpotById(spotId);

    if (!spot) {
      return res.status(404).render("error", {
        title: "Not Found",
        error: "Spot not found."
      });
    }

    await addFavorite(req.session.userId, spotId);

    res.redirect(`/spots/${spotId}`);
  } catch (err) {
    res.render("error", {
      title: "Error",
      error: err.message || err
    });
  }
});

router.post("/:spotId/remove", requireAuth, async (req, res) => {
  try {
    await removeFavorite(req.session.userId, req.params.spotId);
    res.redirect("/favorites");
  } catch (err) {
    res.render("error", {
      title: "Error",
      error: err.message || err
    });
  }
});

export default router;