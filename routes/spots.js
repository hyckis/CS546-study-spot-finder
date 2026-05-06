const express = require("express");
const router = express.Router();
const Spot = require("../models/Spot");
const SpotSuggestion = require("../models/SpotSuggestion");
const requireAuth = require("../middleware/requireAuth");

const buildFilter = (query) => {
  const filter = { approved: true };

  if (query.search && query.search.trim()) {
    const search = query.search.trim();
    filter.$or = [
      { name: new RegExp(search, "i") },
      { address: new RegExp(search, "i") },
      { boroughOrCity: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
    ];
  }

  if (query.category && query.category !== "All") {
    filter.category = query.category;
  }

  if (query.wifiAvailable === "true") {
    filter.wifiAvailable = true;
  }

  if (query.outletsAvailable === "true") {
    filter.outletsAvailable = true;
  }

  if (query.openStatus && query.openStatus !== "All") {
    filter.openStatus = query.openStatus;
  }

  return filter;
};

const buildMapLinks = (spot) => {
  const latitude = Number(spot?.coordinates?.latitude);
  const longitude = Number(spot?.coordinates?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { hasMap: false, mapEmbedUrl: null, mapOpenUrl: null };
  }

  const offset = 0.005;
  const left = longitude - offset;
  const bottom = latitude - offset;
  const right = longitude + offset;
  const top = latitude + offset;

  return {
    hasMap: true,
    mapEmbedUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latitude}%2C${longitude}`,
    mapOpenUrl: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`,
  };
};

router.get("/", async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const spots = await Spot.find(filter).sort({ name: 1 }).lean();

    res.render("spots/list", {
      title: "Study Spots",
      spots,
      query: req.query,
    });
  } catch (err) {
    res.status(500).render("error", { title: "Error", error: err.message });
  }
});

router.get("/suggest", requireAuth, (req, res) => {
  res.render("spots/suggest", { title: "Suggest a Study Spot" });
});

router.post("/suggest", requireAuth, async (req, res) => {
  try {
    const suggestion = new SpotSuggestion({
      submittedBy: req.session.userId,
      name: req.body.name,
      category: req.body.category,
      address: req.body.address,
      boroughOrCity: req.body.boroughOrCity,
      state: req.body.state,
      zipCode: req.body.zipCode,
      latitude: Number(req.body.latitude),
      longitude: Number(req.body.longitude),
      wifiAvailable: req.body.wifiAvailable === "on",
      outletsAvailable: req.body.outletsAvailable === "on",
      openStatus: req.body.openStatus || "Unknown",
      description: req.body.description,
      status: "Pending",
    });

    await suggestion.save();
    res.redirect("/spots/suggestion-submitted");
  } catch (err) {
    res.status(400).render("spots/suggest", {
      title: "Suggest a Study Spot",
      error: err.message,
      form: req.body,
    });
  }
});

router.get("/suggestion-submitted", requireAuth, (_req, res) => {
  res.render("spots/suggestionSubmitted", { title: "Suggestion Submitted" });
});

router.get("/:id", async (req, res) => {
  try {
    const spot = await Spot.findOne({ _id: req.params.id, approved: true }).lean();
    if (!spot) {
      return res.status(404).render("error", { title: "Not Found", error: "Study spot not found." });
    }

    const mapData = buildMapLinks(spot);

    res.render("spots/detail", {
      title: spot.name,
      spot,
      hasMap: mapData.hasMap,
      mapEmbedUrl: mapData.mapEmbedUrl,
      mapOpenUrl: mapData.mapOpenUrl,
    });
  } catch (err) {
    res.status(400).render("error", { title: "Error", error: "Invalid study spot id." });
  }
});

module.exports = router;
