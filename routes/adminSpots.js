const express = require("express");
const router = express.Router();
const Spot = require("../models/Spot");
const SpotSuggestion = require("../models/SpotSuggestion");
const requireAdmin = require("../middleware/requireAdmin");

function cleanString(value, fieldName) {
  if (typeof value !== "string") throw new Error(`${fieldName} must be a string.`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${fieldName} cannot be empty.`);
  return trimmed;
}

function parseBoolean(value) {
  return value === true || value === "true" || value === "on" || value === "yes";
}

function formToSpot(body, sourceType = "admin") {
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  if (!Number.isFinite(latitude)) throw new Error("Latitude must be a number.");
  if (!Number.isFinite(longitude)) throw new Error("Longitude must be a number.");
  const avg = body.averageRating === undefined || body.averageRating === "" ? 0 : Number(body.averageRating);
  if (!Number.isFinite(avg) || avg < 0 || avg > 5) throw new Error("Average rating must be between 0 and 5.");

  return {
    name: cleanString(body.name, "Name"),
    category: cleanString(body.category, "Category"),
    address: cleanString(body.address, "Address"),
    boroughOrCity: cleanString(body.boroughOrCity, "City"),
    state: cleanString(body.state, "State"),
    zipCode: cleanString(body.zipCode, "ZIP code"),
    coordinates: { latitude, longitude },
    wifiAvailable: parseBoolean(body.wifiAvailable),
    outletsAvailable: parseBoolean(body.outletsAvailable),
    openStatus: body.openStatus || "Unknown",
    description: cleanString(body.description, "Description"),
    averageRating: avg,
    sourceType,
    createdBy: "admin",
  };
}

router.use(requireAdmin);

router.get("/", async (req, res) => {
  try {
    const spots = await Spot.find({}).sort({ name: 1 }).lean();
    res.render("admin/spots", { title: "Admin - Study Spots", spots });
  } catch (err) {
    res.status(500).render("error", { title: "Error", error: err.message });
  }
});

router.get("/new", (req, res) => {
  res.render("admin/spotForm", { title: "Create Study Spot", action: "/admin/spots", buttonText: "Create Spot" });
});

router.post("/", async (req, res) => {
  try {
    const spot = await Spot.create(formToSpot(req.body, "admin"));
    res.redirect(`/spots/${spot._id}`);
  } catch (err) {
    res.status(400).render("admin/spotForm", { title: "Create Study Spot", action: "/admin/spots", buttonText: "Create Spot", error: err.message, spot: req.body });
  }
});

router.get("/suggestions/review", async (req, res) => {
  try {
    const suggestions = await SpotSuggestion.find({}).sort({ createdAt: -1 }).lean();
    res.render("admin/suggestions", { title: "Admin - Spot Suggestions", suggestions });
  } catch (err) {
    res.status(500).render("error", { title: "Error", error: err.message });
  }
});

router.post("/suggestions/:id/approve", async (req, res) => {
  try {
    const suggestion = await SpotSuggestion.findById(req.params.id);
    if (!suggestion) return res.status(404).render("error", { title: "Not Found", error: "Suggestion not found." });
    if (suggestion.status !== "Pending") return res.redirect("/admin/spots/suggestions/review");
    const spot = await Spot.create({ name: suggestion.name, category: suggestion.category, address: suggestion.address, boroughOrCity: suggestion.boroughOrCity, state: suggestion.state, zipCode: suggestion.zipCode, coordinates: suggestion.coordinates || { latitude: 0, longitude: 0 }, wifiAvailable: suggestion.wifiAvailable, outletsAvailable: suggestion.outletsAvailable, openStatus: suggestion.openStatus, description: suggestion.description, averageRating: 0, sourceType: "approvedSuggestion", createdBy: "admin" });
    suggestion.status = "Approved";
    suggestion.reviewedBy = req.session.userId;
    suggestion.reviewNotes = req.body.reviewNotes || "Approved and added to study spots.";
    suggestion.reviewedAt = new Date();
    await suggestion.save();
    res.redirect(`/spots/${spot._id}`);
  } catch (err) {
    res.status(400).render("error", { title: "Error", error: err.message });
  }
});

router.post("/suggestions/:id/deny", async (req, res) => {
  try {
    const suggestion = await SpotSuggestion.findById(req.params.id);
    if (!suggestion) return res.status(404).render("error", { title: "Not Found", error: "Suggestion not found." });
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
    if (!spot) return res.status(404).render("error", { title: "Not Found", error: "Study spot not found." });
    res.render("admin/spotForm", { title: "Edit Study Spot", action: `/admin/spots/${spot._id}`, buttonText: "Update Spot", spot });
  } catch (err) {
    res.status(400).render("error", { title: "Error", error: "Invalid spot id." });
  }
});

router.post("/:id", async (req, res) => {
  try {
    await Spot.findByIdAndUpdate(req.params.id, formToSpot(req.body, req.body.sourceType || "admin"), { runValidators: true });
    res.redirect(`/spots/${req.params.id}`);
  } catch (err) {
    res.status(400).render("admin/spotForm", { title: "Edit Study Spot", action: `/admin/spots/${req.params.id}`, buttonText: "Update Spot", error: err.message, spot: { ...req.body, _id: req.params.id } });
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
