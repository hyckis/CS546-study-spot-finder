const mongoose = require("mongoose");

const coordinateSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
  },
  { _id: false }
);

const spotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["Library", "Cafe", "Campus", "Other"],
    },
    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },
    boroughOrCity: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 2,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    coordinates: {
      type: coordinateSchema,
      required: true,
    },
    wifiAvailable: {
      type: Boolean,
      default: false,
    },
    outletsAvailable: {
      type: Boolean,
      default: false,
    },
    openStatus: {
      type: String,
      enum: ["Open", "Closed", "Unknown"],
      default: "Unknown",
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    sourceType: {
      type: String,
      enum: ["dataset", "admin", "approvedSuggestion"],
      default: "admin",
    },
    approved: {
      type: Boolean,
      default: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewNotes: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

spotSchema.index({ name: "text", address: "text", boroughOrCity: "text", description: "text" });
spotSchema.index({ approved: 1, category: 1, openStatus: 1 });

module.exports = mongoose.model("Spot", spotSchema, "studySpots");
