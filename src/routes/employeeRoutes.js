import express from "express";
import {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
} from "../controllers/employeeController.js";
import protect from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";
import { authorizeDepartment } from "../middleware/authorizeDepartment.js";
import { authorizeRoles } from "../middleware/authorizeRole.js";

const router = express.Router();

// Get all employees (with search, filter, pagination)
router.get("/", protect,  authorizeRoles("admin", "manager"), authorizeDepartment("HR"), getEmployees);

// Get single employee
router.get("/:id", protect, authorizeRoles("admin", "manager"), authorizeDepartment("HR"), getEmployeeById);

// Update employee details
router.patch("/:id", protect, authorizeRoles("admin", "manager"), authorizeDepartment("HR"), updateEmployee);

// Change employee status
router.patch("/:id/status", protect, authorizeRoles("admin", "manager"), authorizeDepartment("HR"), updateEmployeeStatus);

// Soft delete employee
    router.delete("/:id", protect, authorizeRoles("admin", "manager"), authorizeDepartment("HR"), deleteEmployee);

export default router;