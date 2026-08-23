import express from "express";
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendance,
  getMyAttendanceHistory,
  getEmployeeAttendanceHistory
} from "../controllers/attendenceController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRole.js";
import { authorizeDepartment } from "../middleware/authorizeDepartment.js";

const router = express.Router();

/* ============================
   Employee Routes
============================ */

router.get("/me", authMiddleware, getMyAttendance);

router.get("/me/history", authMiddleware, getMyAttendanceHistory);

/* ============================
   HR / Admin Routes
============================ */

router.post("/check-in",authMiddleware, authorizeRoles("admin", "manager"), authorizeDepartment("HR"), checkIn );

router.patch("/check-out", authMiddleware, authorizeRoles("admin", "manager"),authorizeDepartment("HR"), checkOut);


router.get("/today", authMiddleware, authorizeRoles("admin", "manager"), authorizeDepartment("HR"), getTodayAttendance);

router.get( "/:employeeId/history", authMiddleware, authorizeRoles("admin", "manager"),authorizeDepartment("HR"),  getEmployeeAttendanceHistory);

export default router;