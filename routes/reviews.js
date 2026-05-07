import { Router } from "express";
import { createReview, updateReview, deleteReview } from "../data/reviews.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

router.post("/spots/:spotId", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { rating, comment } = req.body;  
  try {
    await createReview(
      spotId,
      req.session.userId,
      Number(rating),
      comment
    );

    return res.redirect(`/spots/${spotId}?success=review`);
  } catch (err) {
    return res.status(400).render("error", {
      title: "Review Error",
      error: err.message || err
    });
  }
});

router.post("/spots/:spotId", requireAuth, async(req, res) => {
  const {spotId} = req.params;
  const {rating, comment} = req.body;
  try {
    await createReview(
      spotId,
      req.session.userId,
      Number(rating),
      comment
    );
    return res.redirect(`/spots/${spotId}?success=review`);
  } catch (err) {
    return res.status(400).render("error", {
      title: "Review Error",
      error: err.message || err
    });
  }
});

router.post("/:reviewId/update", requireAuth, async(req, res) => {
  try {
    const spotId = await updateReview(
      req.params.reviewId,
      req.session.userId,
      req.body.rating,
      req.body.comment
    );
    return res.redirect(`/spots/${spotId}?success=reviewUpdated`);
  } catch (err) {
    return res.status(400).render("error", {
      title: "Update Review Error",
      error: err.message || err
    });
  }
});

router.post("/:reviewId/delete", requireAuth, async(req, res) => {
  try {
    const spotId = await deleteReview(
      req.params.reviewId,
      req.session.userId
    );
    return res.redirect(`/spots/${spotId}?success=reviewDeleted`);
  } catch (err) {
    return res.status(400).render("error", {
      title: "Delete Review Error",
      error: err.message || err
    });
  }
});

export default router;