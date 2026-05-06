const express = require("express");
const router = express.Router();
const Spot = require("../models/Spot");
const SpotSuggestion = require("../models/SpotSuggestion");
const requireAdmin = require("../middleware/requireAdmin");

router.use(requireAdmin);

const spotFieldsFromBody = (body, adminId, sourceType = "admin") => ({
  name: body.name,
  category: body.category,
  address: body.address,
  boroughOrCity: body.boroughOrCity,
  state: body.state,
  zipCode: body.zipCode,
  coordinates: {
    latitude: Number(body.latitude),
    longitude: Number(body.longitude),
  },
  wifiAvailable: body.wifiAvailable === "on",
  outletsAvailable: body.outletsAvailable === "on",
  openStatus: body.openStatus || "Unknown",
  description: body.description,
  averageRating: body.averageRating === "" || body.averageRating === undefined ? 0 : Number(body.averageRating),
  sourceType,
  approved: true,
  reviewedBy: adminId || null,
  reviewNotes: body.reviewNotes || "",
  createdBy: adminId || null,
});

router.get("/", async (_req, res) => {
  try {
    const spots = await Spot.find({}).sort({ createdAt: -1 }).lean();
    res.render("admin/spots", { title: "Admin Study Spots", spots });
  } catch (err) {
    res.status(500).render("error", { title: "Error", error: err.message });
  }
});

router.get("/new", (_req, res) => {
  res.render("admin/spotForm", {
    title: "Create Study Spot",
    action: "/admin/spots/new",
    submitLabel: "Create Spot",
    spot: { category: "Library", state: "NY", openStatus: "Unknown", averageRating: 0 },
  });
});

router.post("/new", async (req, res) => {
  try {
    const spot = new Spot(spotFieldsFromBody(req.body, req.session.userId, "admin"));
    await spot.save();
    res.redirect("/admin/spots");
  } catch (err) {
    res.status(400).render("admin/spotForm", {
      title: "Create Study Spot",
      action: "/admin/spots/new",
      submitLabel: "Create Spot",
      error: err.message,
      spot: req.body,
    });
  }
});

router.get("/suggestions/review", async (_req, res) => {
  try {
    const suggestions = await SpotSuggestion.find({}).populate("submittedBy", "username email").sort({ createdAt: -1 }).lean();
    res.render("admin/suggestions", { title: "Review Spot Suggestions", suggestions });
  } catch (err) {
    res.status(500).render("error", { title: "Error", error: err.message });
  }
});

router.post("/suggestions/:id/approve", async (req, res) => {
  try {
    const suggestion = await SpotSuggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).render("error", { title: "Not Found", error: "Suggestion not found." });
    }
    if (suggestion.status !== "Pending") {
      return res.redirect("/admin/spots/suggestions/review");
    }

    const spot = new Spot({
      name: suggestion.name,
      category: suggestion.category,
      address: suggestion.address,
      boroughOrCity: suggestion.boroughOrCity,
      state: suggestion.state,
      zipCode: suggestion.zipCode,
      coordinates: {
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
      },
      wifiAvailable: suggestion.wifiAvailable,
      outletsAvailable: suggestion.outletsAvailable,
      openStatus: suggestion.openStatus,
      description: suggestion.description,
      averageRating: 0,
      sourceType: "approvedSuggestion",
      approved: true,
      reviewedBy: req.session.userId,
      reviewNotes: req.body.reviewNotes || "Approved by admin.",
      createdBy: suggestion.submittedBy,
    });
    await spot.save();

    suggestion.status = "Approved";
    suggestion.reviewedBy = req.session.userId;
    suggestion.reviewNotes = req.body.reviewNotes || "Approved by admin.";
    suggestion.reviewedAt = new Date();
    suggestion.createdSpotId = spot._id;
    await suggestion.save();

    res.redirect("/admin/spots/suggestions/review");
  } catch (err) {
    res.status(400).render("error", { title: "Error", error: err.message });
  }
});

router.post("/suggestions/:id/deny", async (req, res) => {
  try {
    const suggestion = await SpotSuggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).render("error", { title: "Not Found", error: "Suggestion not found." });
    }

    suggestion.status = "Denied";
    suggestion.reviewedBy = req.session.userId;
    suggestion.reviewNotes = req.body.reviewNotes || "Denied by admin.";
    suggestion.reviewedAt = new Date();
    await suggestion.save();

    res.redirect("/admin/spots/suggestions/review");
  } catch (err) {
    res.status(400).render("error", { title: "Error", error: err.message });
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id).lean();
    if (!spot) {
      return res.status(404).render("error", { title: "Not Found", error: "Study spot not found." });
    }

    res.render("admin/spotForm", {
      title: "Edit Study Spot",
      action: `/admin/spots/${spot._id}/edit`,
      submitLabel: "Update Spot",
      spot,
    });
  } catch (err) {
    res.status(400).render("error", { title: "Error", error: "Invalid study spot id." });
  }
});

router.post("/:id/edit", async (req, res) => {
  try {
    const update = spotFieldsFromBody(req.body, req.session.userId, req.body.sourceType || "admin");
    delete update.createdBy;

    const spot = await Spot.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!spot) {
      return res.status(404).render("error", { title: "Not Found", error: "Study spot not found." });
    }

    res.redirect("/admin/spots");
  } catch (err) {
    res.status(400).render("admin/spotForm", {
      title: "Edit Study Spot",
      action: `/admin/spots/${req.params.id}/edit`,
      submitLabel: "Update Spot",
      error: err.message,
      spot: { ...req.body, _id: req.params.id },
    });
  }
});

router.post("/:id/delete", async (req, res) => {
  try {
    await Spot.findByIdAndDelete(req.params.id);
    res.redirect("/admin/spots");
  } catch (err) {
    res.status(400).render("error", { title: "Error", error: "Could not delete study spot." });
  }
});

module.exports = router;
