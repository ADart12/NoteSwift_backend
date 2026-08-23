import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRole.js";
import { getDashboardSummary, getAttendanceOverview } from "../controllers/dashboardController.js";
import { authorizeDepartment } from "../middleware/authorizeDepartment.js";

const router = express.Router();

// Dashboard Stats
router.get( "/summary", authMiddleware, authorizeRoles("admin", "manager"), authorizeDepartment("HR"), getDashboardSummary );

// Attendance Overview (Bar Chart)
router.get("/attendance-overview", authMiddleware, authorizeRoles("admin", "manager"), authorizeDepartment("HR"), getAttendanceOverview );

export default router;