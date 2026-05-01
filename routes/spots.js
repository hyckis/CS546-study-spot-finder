const express = require("express");
const router = express.Router();
const Spot = require("../models/Spot");
const SpotSuggestion = require("../models/SpotSuggestion");

function cleanString(value, fieldName) {
  if (typeof value !== "string") throw new Error(`${fieldName} must be a string.`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${fieldName} cannot be empty.`);
  return trimmed;
}

function parseBoolean(value) {
  return value === true || value === "true" || value === "on" || value === "yes";
}

function buildSearchQuery(query) {
  const filter = {};
  const keyword = typeof query.q === "string" ? query.q.trim() : "";
  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { address: { $regex: keyword, $options: "i" } },
      { boroughOrCity: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];
  }
  if (query.category) filter.category = query.category;
  if (query.wifiAvailable === "true") filter.wifiAvailable = true;
  if (query.outletsAvailable === "true") filter.outletsAvailable = true;
  if (query.openStatus) filter.openStatus = query.openStatus;
  return filter;
}

router.get("/", async (req, res) => {
  try {
    const spots = await Spot.find(buildSearchQuery(req.query)).sort({ name: 1 }).lean();
    res.render("spots/list", {
      title: "Study Spots",
      spots,
      q: req.query.q || "",
      category: req.query.category || "",
      openStatus: req.query.openStatus || "",
      wifiChecked: req.query.wifiAvailable === "true",
      outletsChecked: req.query.outletsAvailable === "true",
    });
  } catch (err) {
    res.status(500).render("error", { title: "Error", error: err.message });
  }
});

router.get("/suggest", (req, res) => {
  res.render("spots/suggest", { title: "Suggest a Study Spot" });
});

router.post("/suggest", async (req, res) => {
  try {
    const suggestion = await SpotSuggestion.create({
      submittedBy: req.session && req.session.userId ? req.session.userId : undefined,
      submittedByName: req.session && req.session.username ? req.session.username : "Guest User",
      name: cleanString(req.body.name, "Name"),
      category: cleanString(req.body.category, "Category"),
      address: cleanString(req.body.address, "Address"),
      boroughOrCity: cleanString(req.body.boroughOrCity, "City"),
      state: cleanString(req.body.state, "State"),
      zipCode: cleanString(req.body.zipCode, "ZIP code"),
      coordinates: {
        latitude: Number(req.body.latitude) || 0,
        longitude: Number(req.body.longitude) || 0,
      },
      wifiAvailable: parseBoolean(req.body.wifiAvailable),
      outletsAvailable: parseBoolean(req.body.outletsAvailable),
      openStatus: req.body.openStatus || "Unknown",
      description: cleanString(req.body.description, "Description"),
    });
    res.redirect(`/spots/suggestion-submitted/${suggestion._id}`);
  } catch (err) {
    res.status(400).render("spots/suggest", { title: "Suggest a Study Spot", error: err.message, form: req.body });
  }
});

router.get("/suggestion-submitted/:id", async (req, res) => {
  try {
    const suggestion = await SpotSuggestion.findById(req.params.id).lean();
    if (!suggestion) return res.status(404).render("error", { title: "Not Found", error: "Suggestion not found." });
    res.render("spots/suggestionSubmitted", { title: "Suggestion Submitted", suggestion });
  } catch (err) {
    res.status(400).render("error", { title: "Error", error: "Invalid suggestion id." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id).lean();
    if (!spot) return res.status(404).render("error", { title: "Not Found", error: "Study spot not found." });
    res.render("spots/detail", { title: spot.name, spot });
  } catch (err) {
    res.status(400).render("error", { title: "Error", error: "Invalid spot id." });
  }
});

module.exports = router;
