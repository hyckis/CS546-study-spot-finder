import { Router } from "express";

import {
  getAllSpots,
  getSpotById
} from "../data/spots.js";

import {
  getActiveStatusReportsBySpotId,
  getAggregatedReportStatus
} from "../data/reports.js";

import {
  getReviewsBySpotId
} from "../data/reviews.js";

import {
  createSpotSuggestion,
  getSpotSuggestionById
} from "../data/spotSuggestions.js";

const router = Router();

function cleanString(value, fieldName) {
  if (typeof value !== "string") throw new Error(`${fieldName} must be a string.`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${fieldName} cannot be empty.`);
  return trimmed;
}

function parseBoolean(value) {
  return value === true || value === "true" || value === "on" || value === "yes";
}

router.get("/", async (req, res) => {
  try {
    const spots = await getAllSpots();

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
    res.status(500).render("error", {
      title: "Error",
      error: err.message || err
    });
  }
});

router.get("/suggest", (req, res) => {
  res.render("spots/suggest", { title: "Suggest a Study Spot" });
});

router.post("/suggest", async (req, res) => {
  const suggestion = await createSpotSuggestion({
    submittedBy: req.session && req.session.userId ? req.session.userId : null,
    submittedByName: req.session && req.session.username ? req.session.username : "Guest User",
    name: cleanString(req.body.name, "Name"),
    category: cleanString(req.body.category, "Category"),
    address: cleanString(req.body.address, "Address"),
    boroughOrCity: cleanString(req.body.boroughOrCity, "City"),
    state: cleanString(req.body.state, "State"),
    zipCode: cleanString(req.body.zipCode, "ZIP code"),
    coordinates: {
      latitude: Number(req.body.latitude) || 0,
      longitude: Number(req.body.longitude) || 0
    },
    wifiAvailable: parseBoolean(req.body.wifiAvailable),
    outletsAvailable: parseBoolean(req.body.outletsAvailable),
    openStatus: req.body.openStatus || "Unknown",
    description: cleanString(req.body.description, "Description")
  });

  res.redirect(`/spots/suggestion-submitted/${suggestion._id}`);
});

router.get("/suggestion-submitted/:id", async (req, res) => {
  try {
    const suggestion = await getSpotSuggestionById(req.params.id);

    if (!suggestion) {
      return res.status(404).render("error", {
        title: "Not Found",
        error: "Suggestion not found."
      });
    }

    res.render("spots/suggestionSubmitted", {
      title: "Suggestion Submitted",
      suggestion
    });
  } catch (err) {
    res.status(400).render("error", {
      title: "Error",
      error: err.message || "Invalid suggestion id."
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const spot = await getSpotById(req.params.id);

    if (!spot) {
      return res.status(404).render("error", {
        title: "Not Found",
        error: "Study spot not found."
      });
    }

    const activeReports = await getActiveStatusReportsBySpotId(req.params.id);
    const reportSummary = await getAggregatedReportStatus(req.params.id);
    const reviews = await getReviewsBySpotId(req.params.id);

    res.render("spots/detail", {
      title: spot.name,
      spot,
      activeReports: activeReports || [],
      hasActiveReports: activeReports && activeReports.length > 0,
      reportSummary: reportSummary || {
        reportCount: 0,
        wifiStatus: "No recent reports",
        socketStatus: "No recent reports",
        crowdednessStatus: "No recent reports"
      },
      reviews: reviews || []
    });    

  } catch (err) {
    res.status(400).render("error", {
      title: "Error",
      error: err.message || "Invalid spot id."
    });
  }
});

export default router;