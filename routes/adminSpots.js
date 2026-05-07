import { Router } from "express";
import {
  getAllSpots,
  getSpotById,
  createSpot,
  updateSpot,
  deleteSpot
} from "../data/spots.js";

import requireAdmin from "../middleware/requireAdmin.js";

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

function formToSpot(body, sourceType = "admin") {
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);

  if (!Number.isFinite(latitude)) throw new Error("Latitude must be a number.");
  if (!Number.isFinite(longitude)) throw new Error("Longitude must be a number.");

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
    openStatus: body.openStatus || "Unknown",
    description: cleanString(body.description, "Description"),
    averageRating: avg,
    sourceType,
    createdBy: "admin",
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
    const spot = await createSpot(formToSpot(req.body, "admin"));
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

// Temporarily disabled until spotSuggestions data functions are implemented
router.get("/suggestions/review", async (req, res) => {
  res.status(501).render("error", {
    title: "Not Implemented",
    error: "Spot suggestion review is not implemented yet."
  });
});

router.post("/suggestions/:id/approve", async (req, res) => {
  res.status(501).render("error", {
    title: "Not Implemented",
    error: "Spot suggestion approval is not implemented yet."
  });
});

router.post("/suggestions/:id/deny", async (req, res) => {
  res.status(501).render("error", {
    title: "Not Implemented",
    error: "Spot suggestion denial is not implemented yet."
  });
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
      formToSpot(req.body, req.body.sourceType || "admin")
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
      error: err.message || "Could not delete study spot."
    });
  }
});

export default router;