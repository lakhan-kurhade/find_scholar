const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    provider: {
      type: String,
      required: true,
      trim: true
    },

    providerType: {
      type: String,
      enum: ["government", "private", "psu", "international", "university", "other"],
      default: "other"
    },

    description: {
      type: String,
      trim: true
    },

    // =========================
    // EDUCATION ELIGIBILITY
    // =========================

    educationLevels: {
      type: [String],
      default: []
    },

    fieldsOfStudy: {
      type: [String],
      default: []
    },

    // =========================
    // ELIGIBILITY
    // =========================

    categories: {
      type: [String],
      default: []
    },

    genders: {
      type: [String],
      enum: ["male", "female", "prefer not to say"],
      default: []
    },

    // Maximum annual family income allowed
    maxIncome: {
      type: Number,
      default: null
    },

    academicCriteria: {
      type: String,
      trim: true
    },

    incomeCriteria: {
      type: String,
      trim: true
    },

    eligibility: {
      type: [String],
      default: []
    },

    benefits: {
      type: [String],
      default: []
    },

    documentsRequired: {
      type: [String],
      default: []
    },

    restrictions: {
      type: [String],
      default: []
    },

    // =========================
    // LOCATION
    // =========================

    location: {
      type: [String],
      default: ["India"]
    },

    officialLink: {
      type: String,
      trim: true
    },

    lastVerified: {
      type: Date
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Scholarship", scholarshipSchema);