import express from "express";
import {
  applyLeave,
  getMyLeaves,
  getMyLeaveById,
  deleteLeave,
  getAllLeaves,
  getLeaveById,
  rejectLeave,
  approveLeave,
  getLeaveSummary
} from "../controllers/leaveController.js";
import protect from "../middleware/authMiddleware.js";
import {authorizeRoles} from "../middleware/authorizeRole.js";
import { authorizeDepartment } from "../middleware/authorizeDepartment.js";

const router = express.Router();

// Employee Routes
router.post("/",protect, authorizeRoles("employee"),applyLeave);

router.get("/me",protect, authorizeRoles("employee"), getMyLeaves);

router.get("/me/:id", protect, authorizeRoles("employee"), getMyLeaveById);

router.delete("/:id",protect, authorizeRoles("employee"), deleteLeave);



// HR/Admin Routes
router.get("/",protect, authorizeRoles("admin", "manager"), authorizeDepartment("HR"), getAllLeaves);

router.get("/summary",protect, authorizeRoles("admin", "manager"), authorizeDepartment("HR"), getLeaveSummary);

router.get("/:id",protect,authorizeRoles("admin", "manager"), authorizeDepartment("HR") , getLeaveById);

router.patch("/:id/approve", protect, authorizeRoles("admin", "manager"), authorizeDepartment("HR"), approveLeave);

router.patch("/:id/reject", protect, authorizeRoles("admin", "manager"), authorizeDepartment("HR"), rejectLeave);


export default router;