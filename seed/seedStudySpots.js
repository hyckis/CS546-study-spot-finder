import axios from "axios";
import { spots, spotSuggestions } from "../config/mongoCollections.js";
import { closeConnection } from "../config/mongoConnection.js";
import { createSpot } from "../data/spots.js";
import { createSpotSuggestion } from "../data/spotSuggestions.js";
import { createUser, getUserByEmail } from "../data/users.js";

const NYC_WIFI_URL = "https://data.cityofnewyork.us/resource/yjub-udmw.json?$limit=20";

const fallbackSpots = [
  {
    name: "Hoboken Public Library",
    category: "Library",
    address: "500 Park Ave",
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
    reviewedBy: null,
    reviewNotes: "Seeded fallback study spot.",
    createdBy: "seed"
  },
  {
    name: "NYPL Stavros Niarchos Foundation Library",
    category: "Library",
    address: "455 5th Ave",
    boroughOrCity: "New York",
    state: "NY",
    zipCode: "10016",
    coordinates: { latitude: 40.7519, longitude: -73.9818 },
    wifiAvailable: true,
    outletsAvailable: true,
    openStatus: "Open",
    description: "Large public library near Bryant Park with study seating and public WiFi.",
    averageRating: 4.7,
    sourceType: "dataset",
    approved: true,
    reviewedBy: null,
    reviewNotes: "Seeded fallback study spot.",
    createdBy: "seed"
  },
  {
    name: "Hidden Grounds Coffee Hoboken",
    category: "Cafe",
    address: "79 Hudson St",
    boroughOrCity: "Hoboken",
    state: "NJ",
    zipCode: "07030",
    coordinates: { latitude: 40.7375, longitude: -74.0304 },
    wifiAvailable: true,
    outletsAvailable: false,
    openStatus: "Open",
    description: "Small cafe that can work for short study sessions.",
    averageRating: 4.1,
    sourceType: "dataset",
    approved: true,
    reviewedBy: null,
    reviewNotes: "Seeded fallback study spot.",
    createdBy: "seed"
  }
];

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapWifiRecordToSpot(record, index) {
  const latitude = parseNumber(record.latitude || record.lat || record.location_latitude);
  const longitude = parseNumber(record.longitude || record.lon || record.long_ || record.location_longitude);

  if (latitude === null || longitude === null) return null;

  const address = record.location || record.location_name || record.address || record.street_address || "NYC WiFi Location";
  const city = record.city || record.borough || record.borough_name || "New York";
  const zipCode = record.zip || record.postcode || record.zip_code || "10001";

  return {
    name: record.name || record.location_name || `NYC WiFi Study Spot ${index + 1}`,
    category: "Public WiFi Spot",
    address,
    boroughOrCity: city,
    state: "NY",
    zipCode,
    coordinates: { latitude, longitude },
    wifiAvailable: true,
    outletsAvailable: false,
    openStatus: "Unknown",
    description: "Imported from the NYC Wi-Fi Hotspot Locations dataset as a possible study spot.",
    averageRating: 0,
    sourceType: "dataset",
    approved: true,
    reviewedBy: null,
    reviewNotes: "Imported by seed script from NYC Open Data.",
    createdBy: "seed"
  };
}

async function loadDatasetSpots() {
  try {
    const response = await axios.get(NYC_WIFI_URL, { timeout: 8000 });
    const datasetSpots = response.data
      .map(mapWifiRecordToSpot)
      .filter(Boolean)
      .slice(0, 10);

    if (datasetSpots.length > 0) return datasetSpots;
  } catch (err) {
    console.log("Could not import NYC dataset. Using fallback seed data instead.");
  }

  return fallbackSpots;
}

async function ensureSeedUsers() {
  let admin = await getUserByEmail("admin@spotscouter.com");
  if (!admin) {
    admin = await createUser({
      username: "admin",
      email: "admin@spotscouter.com",
      password: "Admin123!",
      firstName: "Admin",
      lastName: "User",
      major: "Computer Science",
      role: "admin"
    });
  }

  let student = await getUserByEmail("student@spotscouter.com");
  if (!student) {
    student = await createUser({
      username: "student",
      email: "student@spotscouter.com",
      password: "Student123!",
      firstName: "Student",
      lastName: "User",
      major: "Computer Science",
      role: "user"
    });
  }

  return { admin, student };
}

async function seed() {
  const spotCollection = await spots();
  const suggestionCollection = await spotSuggestions();

  await spotCollection.deleteMany({});
  await suggestionCollection.deleteMany({});

  const { student } = await ensureSeedUsers();
  const seedSpots = await loadDatasetSpots();

  for (const spot of seedSpots) {
    await createSpot(spot);
  }

  await createSpotSuggestion({
    submittedBy: student._id,
    submittedByName: student.username,
    name: "Cafe Study Corner",
    category: "Cafe",
    address: "100 Washington St",
    boroughOrCity: "Hoboken",
    state: "NJ",
    zipCode: "07030",
    coordinates: { latitude: 40.741, longitude: -74.0305 },
    wifiAvailable: true,
    outletsAvailable: true,
    openStatus: "Open",
    description: "Suggested cafe with good tables and a quiet second floor."
  });

  console.log("Seed completed.");
  console.log("Admin login: admin@spotscouter.com / Admin123!");
  console.log("Student login: student@spotscouter.com / Student123!");
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeConnection();
  });
