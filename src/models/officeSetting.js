import mongoose from "mongoose";

const companySettingsSchema = new mongoose.Schema(
  {
    officeStartTime: {
      type: String,
      default: "09:00",
    },

    officeEndTime: {
      type: String,
      default: "17:00",
    },

    workingHours: {
      type: Number,
      default: 8,
    },

    gracePeriod: {
      type: Number, // minutes
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

const CompanySettings = mongoose.model(
  "CompanySettings",
  companySettingsSchema
);

export default CompanySettings;