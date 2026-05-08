import { Router } from "express";
import {
  getAllSpots,
  getSpotById,
  createSpot,
  updateSpot,
  deleteSpot
} from "../data/spots.js";
import {
  getAllSpotSuggestions,
  getSpotSuggestionById,
  updateSpotSuggestionReview
} from "../data/spotSuggestions.js";

import requireAdmin from "../middleware/requireAdmin.js";

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

function formToSpot(body, sourceType = "admin", currentAdminId = null) {
  const latitude = parseCoordinate(body.latitude, "Latitude", -90, 90);
  const longitude = parseCoordinate(body.longitude, "Longitude", -180, 180);

  const avg =
    body.averageRating === undefined || body.averageRating === ""
      ? 0
      : Number(body.averageRating);

  if (!Number.isFinite(avg) || avg < 0 || avg > 5) {
    throw new Error("Average rating must be between 0 and 5.");
  }

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
    openStatus: optionalString(body.openStatus) || "Unknown",
    description: cleanString(body.description, "Description"),
    averageRating: avg,
    sourceType,
    approved: true,
    reviewedBy: currentAdminId,
    reviewNotes: optionalString(body.reviewNotes),
    createdBy: currentAdminId || "admin",
    updatedAt: new Date()
  };
}

router.use(requireAdmin);

router.get("/", async (req, res) => {
  try {
    const spots = await getAllSpots();
    res.render("admin/spots", { title: "Admin - Study Spots", spots });
  } catch (err) {
    res.status(500).render("error", {
      title: "Error",
      error: err.message || err
    });
  }
});

router.get("/new", (req, res) => {
  res.render("admin/spotForm", {
    title: "Create Study Spot",
    action: "/admin/spots",
    buttonText: "Create Spot"
  });
});

router.post("/", async (req, res) => {
  try {
    const spot = await createSpot(formToSpot(req.body, "admin", req.session.userId));
    res.redirect(`/spots/${spot._id.toString()}`);
  } catch (err) {
    res.status(400).render("admin/spotForm", {
      title: "Create Study Spot",
      action: "/admin/spots",
      buttonText: "Create Spot",
      error: err.message || err,
      spot: req.body
    });
  }
});

router.get("/suggestions/review", async (req, res) => {
  try {
    const suggestions = await getAllSpotSuggestions();
    res.render("admin/suggestions", {
      title: "Review Spot Suggestions",
      suggestions
    });
  } catch (err) {
    res.status(500).render("error", {
      title: "Error",
      error: err.message || err
    });
  }
});

router.post("/suggestions/:id/approve", async (req, res) => {
  try {
    const suggestion = await getSpotSuggestionById(req.params.id);
    if (!suggestion) {
      return res.status(404).render("error", {
        title: "Not Found",
        error: "Spot suggestion not found."
      });
    }

    if (suggestion.status !== "Pending") {
      return res.redirect("/admin/spots/suggestions/review");
    }

    const reviewNotes = optionalString(req.body.reviewNotes) || "Approved by admin.";

    const createdSpot = await createSpot({
      name: suggestion.name,
      category: suggestion.category,
      address: suggestion.address,
      boroughOrCity: suggestion.boroughOrCity,
      state: suggestion.state,
      zipCode: suggestion.zipCode,
      coordinates: suggestion.coordinates,
      wifiAvailable: suggestion.wifiAvailable,
      outletsAvailable: suggestion.outletsAvailable,
      openStatus: suggestion.openStatus || "Unknown",
      description: suggestion.description,
      averageRating: 0,
      sourceType: "approvedSuggestion",
      approved: true,
      reviewedBy: req.session.userId || null,
      reviewNotes,
      createdBy: suggestion.submittedBy || suggestion.submittedByName || "user"
    });

    await updateSpotSuggestionReview(req.params.id, {
      status: "Approved",
      reviewedBy: req.session.userId || null,
      reviewNotes,
      reviewedAt: new Date(),
      createdSpotId: createdSpot._id
    });

    res.redirect("/admin/spots/suggestions/review");
  } catch (err) {
    res.status(400).render("error", {
      title: "Error",
      error: err.message || err
    });
  }
});

router.post("/suggestions/:id/deny", async (req, res) => {
  try {
    const suggestion = await getSpotSuggestionById(req.params.id);
    if (!suggestion) {
      return res.status(404).render("error", {
        title: "Not Found",
        error: "Spot suggestion not found."
      });
    }

    if (suggestion.status !== "Pending") {
      return res.redirect("/admin/spots/suggestions/review");
    }

    await updateSpotSuggestionReview(req.params.id, {
      status: "Denied",
      reviewedBy: req.session.userId || null,
      reviewNotes: optionalString(req.body.reviewNotes) || "Denied by admin.",
      reviewedAt: new Date()
    });

    res.redirect("/admin/spots/suggestions/review");
  } catch (err) {
    res.status(400).render("error", {
      title: "Error",
      error: err.message || err
    });
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const spot = await getSpotById(req.params.id);

    if (!spot) {
      return res.status(404).render("error", {
        title: "Not Found",
        error: "Study spot not found."
      });
    }

    res.render("admin/spotForm", {
      title: "Edit Study Spot",
      action: `/admin/spots/${spot._id}`,
      buttonText: "Update Spot",
      spot
    });
  } catch (err) {
    res.status(400).render("error", {
      title: "Error",
      error: err.message || "Invalid spot id."
    });
  }
});

router.post("/:id", async (req, res) => {
  try {
    await updateSpot(
      req.params.id,
      formToSpot(req.body, req.body.sourceType || "admin", req.session.userId)
    );

    res.redirect(`/spots/${req.params.id}`);
  } catch (err) {
    res.status(400).render("admin/spotForm", {
      title: "Edit Study Spot",
      action: `/admin/spots/${req.params.id}`,
      buttonText: "Update Spot",
      error: err.message || err,
      spot: { ...req.body, _id: req.params.id }
    });
  }
});

router.post("/:id/delete", async (req, res) => {
  try {
    await deleteSpot(req.params.id);
    res.redirect("/admin/spots");
  } catch (err) {
    res.status(400).render("error", {
      title: "Error",
      error: err.message || err
    });
  }
});

export default router;
