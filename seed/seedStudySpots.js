const mongoose = require("mongoose");
const axios = require("axios");
const User = require("../models/User");
const Spot = require("../models/Spot");
const SpotSuggestion = require("../models/SpotSuggestion");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Group15_Project";
const NYC_WIFI_URL = "https://data.cityofnewyork.us/resource/yjub-udmw.json?$limit=8";

const fallbackSpots = [
  {
    name: "Hoboken Public Library",
    category: "Library",
    address: "500 Park Ave, Hoboken, NJ",
    boroughOrCity: "Hoboken",
    state: "NJ",
    zipCode: "07030",
    coordinates: { latitude: 40.7448, longitude: -74.0324 },
    wifiAvailable: true,
    outletsAvailable: true,
    openStatus: "Open",
    description: "Quiet public library with reliable WiFi and many tables.",
    averageRating: 4.5,
    sourceType: "dataset",
    approved: true,
  },
  {
    name: "New York Public Library - Stavros Niarchos Foundation Library",
    category: "Library",
    address: "455 5th Ave, New York, NY",
    boroughOrCity: "New York",
    state: "NY",
    zipCode: "10016",
    coordinates: { latitude: 40.7519, longitude: -73.9822 },
    wifiAvailable: true,
    outletsAvailable: true,
    openStatus: "Open",
    description: "Large library near Bryant Park with quiet study areas and public WiFi.",
    averageRating: 4.7,
    sourceType: "dataset",
    approved: true,
  },
  {
    name: "Think Coffee Broadway",
    category: "Cafe",
    address: "248 Mercer St, New York, NY",
    boroughOrCity: "New York",
    state: "NY",
    zipCode: "10012",
    coordinates: { latitude: 40.7282, longitude: -73.9942 },
    wifiAvailable: true,
    outletsAvailable: false,
    openStatus: "Open",
    description: "Cafe study spot with WiFi, coffee, and moderate noise level.",
    averageRating: 4.1,
    sourceType: "admin",
    approved: true,
  },
];

const safeNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildDatasetSpots = async () => {
  try {
    const { data } = await axios.get(NYC_WIFI_URL, { timeout: 8000 });
    const spots = data
      .filter((item) => item.latitude && item.longitude)
      .slice(0, 6)
      .map((item, index) => ({
        name: item.name || item.location || `NYC WiFi Study Spot ${index + 1}`,
        category: "Other",
        address: item.location || item.street_address || "New York, NY",
        boroughOrCity: item.city || item.borough || "New York",
        state: "NY",
        zipCode: item.postcode || "10001",
        coordinates: {
          latitude: safeNumber(item.latitude, 40.7128),
          longitude: safeNumber(item.longitude, -74.006),
        },
        wifiAvailable: true,
        outletsAvailable: false,
        openStatus: "Unknown",
        description: "Imported from NYC Open Data WiFi hotspot dataset as an initial study spot candidate.",
        averageRating: 0,
        sourceType: "dataset",
        approved: true,
      }));

    return spots.length > 0 ? spots : fallbackSpots;
  } catch (err) {
    console.log("Could not load NYC Open Data. Using fallback seed data.");
    return fallbackSpots;
  }
};

const seed = async () => {
  await mongoose.connect(MONGO_URI);

  await Spot.deleteMany({});
  await SpotSuggestion.deleteMany({});

  await User.deleteMany({ email: { $in: ["admin@spotscouter.com", "student@spotscouter.com"] } });

  const admin = new User({
    username: "admin",
    email: "admin@spotscouter.com",
    passwordHash: "Admin123!",
    firstName: "Admin",
    lastName: "User",
    major: "Computer Science",
    role: "admin",
  });
  await admin.save();

  const student = new User({
    username: "student",
    email: "student@spotscouter.com",
    passwordHash: "Student123!",
    firstName: "Student",
    lastName: "User",
    major: "Computer Science",
    role: "user",
  });
  await student.save();

  const datasetSpots = await buildDatasetSpots();
  await Spot.insertMany(datasetSpots.map((spot) => ({ ...spot, createdBy: admin._id })));

  await SpotSuggestion.create({
    submittedBy: student._id,
    name: "Hidden Grounds Coffee",
    category: "Cafe",
    address: "79 Hudson St, Hoboken, NJ",
    boroughOrCity: "Hoboken",
    state: "NJ",
    zipCode: "07030",
    latitude: 40.7378,
    longitude: -74.0307,
    wifiAvailable: true,
    outletsAvailable: true,
    openStatus: "Open",
    description: "Small cafe with good coffee, decent WiFi, and some outlets.",
    status: "Pending",
  });

  console.log("Seed completed.");
  console.log("Admin login: admin@spotscouter.com / Admin123!");
  console.log("Student login: student@spotscouter.com / Student123!");
  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
