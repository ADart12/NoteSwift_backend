import mongoose from "mongoose";
import dotenv from "dotenv";
import OfficeSettings from "./src/models/officeSetting.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_DB);

await OfficeSettings.create({
  companyName: "ABC Pvt Ltd",
  officeStartTime: "09:00",
  officeEndTime: "17:00",
  workingHours: 8,
  gracePeriod: 10,
});

console.log("Office settings created");

process.exit();