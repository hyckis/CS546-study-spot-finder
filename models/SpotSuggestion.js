const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema(
  {
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
      default: "New York",
    },
    state: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 2,
      default: "NY",
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
      default: "10001",
    },
    latitude: {
      type: Number,
      default: 40.7128,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      default: -74.006,
      min: -180,
      max: 180,
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
    status: {
      type: String,
      enum: ["Pending", "Approved", "Denied"],
      default: "Pending",
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
    reviewedAt: {
      type: Date,
      default: null,
    },
    createdSpotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Spot",
      default: null,
    },
  },
  { timestamps: true }
);

suggestionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("SpotSuggestion", suggestionSchema, "spotSuggestions");
