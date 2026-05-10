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

import { isFavorited } from "../data/favorites.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

function cleanString(value, fieldName) {
  if (typeof value !== "string") throw new Error(`${fieldName} must be a string.`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${fieldName} cannot be empty.`);
  return trimmed;
}

function optionalString(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function parseBoolean(value) {
  return value === true || value === "true" || value === "on" || value === "yes";
}

function parseCoordinate(value, fieldName, min, max) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) throw new Error(`${fieldName} must be a number.`);
  if (numberValue < min || numberValue > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}.`);
  }
  return numberValue;
}

function filterSpots(spots, query) {
  let results = [...spots];

  const q = optionalString(query.q).toLowerCase();
  if (q) {
    results = results.filter((spot) => {
      return [spot.name, spot.address, spot.boroughOrCity, spot.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q));
    });
  }

  if (query.category) {
    results = results.filter((spot) => spot.category === query.category);
  }

  if (query.openStatus) {
    results = results.filter((spot) => spot.openStatus === query.openStatus);
  }

  if (query.wifiAvailable === "true") {
    results = results.filter((spot) => spot.wifiAvailable === true);
  }

  if (query.outletsAvailable === "true") {
    results = results.filter((spot) => spot.outletsAvailable === true);
  }

  return results;
}

function buildMapUrl(spot) {
  const lat = spot?.coordinates?.latitude;
  const lng = spot?.coordinates?.longitude;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const delta = 0.005;
  const left = lng - delta;
  const right = lng + delta;
  const bottom = lat - delta;
  const top = lat + delta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
}

router.get("/", async (req, res) => {
  try {
    const allSpots = await getAllSpots();
    const spots = filterSpots(allSpots, req.query);

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

router.get("/suggest", requireAuth, (req, res) => {
  res.render("spots/suggest", { title: "Suggest a Study Spot" });
});

router.post("/suggest", requireAuth, async (req, res) => {
  try {
    const suggestion = await createSpotSuggestion({
      submittedBy: req.session.userId,
      submittedByName: req.session.username || "Registered User",
      name: cleanString(req.body.name, "Name"),
      category: cleanString(req.body.category, "Category"),
      address: cleanString(req.body.address, "Address"),
      boroughOrCity: cleanString(req.body.boroughOrCity, "City"),
      state: cleanString(req.body.state, "State"),
      zipCode: cleanString(req.body.zipCode, "ZIP code"),
      coordinates: {
        latitude: parseCoordinate(req.body.latitude, "Latitude", -90, 90),
        longitude: parseCoordinate(req.body.longitude, "Longitude", -180, 180)
      },
      wifiAvailable: parseBoolean(req.body.wifiAvailable),
      outletsAvailable: parseBoolean(req.body.outletsAvailable),
      openStatus: optionalString(req.body.openStatus) || "Unknown",
      description: cleanString(req.body.description, "Description")
    });

    res.redirect(`/spots/suggestion-submitted/${suggestion._id}`);
  } catch (err) {
    res.status(400).render("spots/suggest", {
      title: "Suggest a Study Spot",
      error: err.message || err,
      form: req.body
    });
  }
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
    const reviewsOwner = reviews.map((review) => ({
      ...review,
      isOwner: req.session.userId === review.userId
    }));

    const alreadyFavorited = req.session.userId
      ? await isFavorited(req.session.userId, req.params.id)
      : false;

    res.render("spots/detail", {
      title: spot.name,
      spot,
      mapEmbedUrl: buildMapUrl(spot),
      activeReports: activeReports || [],
      hasActiveReports: activeReports && activeReports.length > 0,
      reportSummary: reportSummary || {
        reportCount: 0,
        wifiStatus: "No recent reports",
        socketStatus: "No recent reports",
        crowdednessStatus: "No recent reports"
      },
      reviews: reviewsOwner || [],
      hasReviews: reviews && reviewsOwner.length > 0,
      currentUserId: req.session.userId || null,
      reviewSuccess: req.query.success === "review",
      reviewUpdated: req.query.success === "reviewUpdated",
      reviewDeleted: req.query.success === "reviewDeleted",
      isClosed: spot.openStatus === "Closed",
      isFavorited: alreadyFavorited
    });
  } catch (err) {
    res.status(400).render("error", {
      title: "Error",
      error: err.message || "Invalid spot id."
    });
  }
});

export default router;