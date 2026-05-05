import Spot from "../models/Spot";
import SpotSuggestion from "../models/SpotSuggestion.js";
import User from "../models/User.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Group15_Project";

const spots = [
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
    createdBy: "seed",
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
    createdBy: "seed",
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
    createdBy: "seed",
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  await Spot.deleteMany({});
  await SpotSuggestion.deleteMany({});
  await Spot.insertMany(spots);

  let admin = await User.findOne({ email: "admin@spotscouter.com" });
  if (!admin) {
    admin = new User({
      username: "admin",
      email: "admin@spotscouter.com",
      passwordHash: "Admin123!",
      firstName: "Admin",
      lastName: "User",
      major: "Computer Science",
      role: "admin",
    });
    await admin.save();
  }

  await SpotSuggestion.create({
    submittedByName: "Sample Student",
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
    description: "Suggested cafe with good tables and a quiet second floor.",
  });

  console.log("Seed complete. Admin login: admin@spotscouter.com / Admin123!");
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
