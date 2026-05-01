const mongoose = require("mongoose");

const coordinatesSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
  },
  { _id: false }
);

const spotSuggestionSchema = new mongoose.Schema(
  {
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    submittedByName: { type: String, trim: true, default: "Guest User" },
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
    coordinates: { type: coordinatesSchema, required: false },
    wifiAvailable: { type: Boolean, default: false },
    outletsAvailable: { type: Boolean, default: false },
    openStatus: {
      type: String,
      enum: ["Open", "Closed", "Temporarily Closed", "Unknown"],
      default: "Unknown",
    },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Denied"],
      default: "Pending",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewNotes: { type: String, trim: true, default: "" },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SpotSuggestion", spotSuggestionSchema);
