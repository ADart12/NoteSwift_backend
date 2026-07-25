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

const router = express.Router();

/* ============================
   Employee Routes
============================ */

router.get("/me", authMiddleware, getMyAttendance);

router.get("/me/history", authMiddleware, getMyAttendanceHistory);

/* ============================
   HR / Admin Routes
============================ */

router.post("/check-in",authMiddleware, authorizeRoles("admin", "hr"), checkIn );

router.patch("/check-out", authMiddleware, authorizeRoles("admin", "hr"), checkOut);


router.get("/today", authMiddleware, authorizeRoles("admin", "hr"), getTodayAttendance);

router.get( "/:employeeId/history", authMiddleware, authorizeRoles("admin", "hr"), getEmployeeAttendanceHistory);

export default router;