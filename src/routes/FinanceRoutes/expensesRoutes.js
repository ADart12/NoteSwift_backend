import express from "express";

import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../../controllers/Finance/expensesController.js";

import protect from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/authorizeRole.js";
import { authorizeDepartment } from "../../middleware/authorizeDepartment.js";

const router = express.Router();

// Finance Manager + Admin access
router.use(
  protect,
  authorizeRoles("manager", "admin"),
  authorizeDepartment("FIN")
);

// Create expense
router.post("/", createExpense);

// Get all expenses
router.get("/", getExpenses);

// Get single expense
router.get("/:id", getExpenseById);

// Update expense
router.put("/:id", updateExpense);

// Soft delete expense
router.delete("/:id", deleteExpense);

export default router;