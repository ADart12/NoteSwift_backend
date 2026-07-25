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

const router = express.Router();

// Get all employees (with search, filter, pagination)
router.get("/", protect, isAdmin, getEmployees);

// Get single employee
router.get("/:id", protect, isAdmin, getEmployeeById);

// Update employee details
router.patch("/:id", protect, isAdmin, updateEmployee);

// Change employee status
router.patch("/:id/status", protect, isAdmin, updateEmployeeStatus);

// Soft delete employee
    router.delete("/:id", protect, isAdmin, deleteEmployee);

export default router;