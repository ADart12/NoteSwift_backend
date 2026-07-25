import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRole.js";
import { getDashboardSummary } from "../controllers/dashboardController.js";

const router = express.Router();

router.get(
  "/summary",
  authMiddleware,
  authorizeRoles("admin", "hr"),
  getDashboardSummary
);

export default router;