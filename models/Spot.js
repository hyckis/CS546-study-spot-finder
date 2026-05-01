const mongoose = require("mongoose");

const coordinatesSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false }
);

const spotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Library", "Cafe", "Study Room", "Campus Building", "Other"],
      trim: true,
    },
    address: { type: String, required: true, trim: true },
    boroughOrCity: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true, uppercase: true },
    zipCode: { type: String, required: true, trim: true },
    coordinates: { type: coordinatesSchema, required: true },
    wifiAvailable: { type: Boolean, default: false },
    outletsAvailable: { type: Boolean, default: false },
    openStatus: {
      type: String,
      enum: ["Open", "Closed", "Temporarily Closed", "Unknown"],
      default: "Unknown",
    },
    description: { type: String, required: true, trim: true },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    sourceType: {
      type: String,
      enum: ["dataset", "admin", "approvedSuggestion"],
      default: "admin",
    },
    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true }
);

spotSchema.index({ name: 1, address: 1 }, { unique: true });
module.exports = mongoose.model("Spot", spotSchema);
