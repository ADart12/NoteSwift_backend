import cron from "node-cron";
import { markAbsentEmployees } from "../controllers/attendenceController.js";

cron.schedule(
  "59 23 * * *",
  async () => {
    console.log("Running absent marking...");

    await markAbsentEmployees();
  },
  {
    timezone: "Asia/Kolkata",
  }
);