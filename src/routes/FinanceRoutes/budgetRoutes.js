import express from "express";

import {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget,
    approveBudget,
    rejectBudget,
    getBudgetUtilization,
} from "../../controllers/Finance/budgetController";
import { authorizeRoles } from "../../middleware/authorizeRole";
import { authorizeDepartment } from "../../middleware/authorizeDepartment";

const router = express.Router();


// Create Budget
router.post("/",authorizeRoles("manager", "admin"), authorizeDepartment("FIN"), createBudget);


// Get All Budgets
router.get("/", getBudgets);


// Get Single Budget
router.get("/:id", authorizeRoles("manager", "admin"), authorizeDepartment("FIN"), getBudgetById);


// Update Budget
router.put("/:id", authorizeRoles("manager", "admin"), authorizeDepartment("FIN"), updateBudget);


// Delete Budget
router.delete("/:id", authorizeRoles("manager", "admin"), authorizeDepartment("FIN"), deleteBudget);


// Approve Budget
router.patch("/:id/approve", authorizeRoles("manager", "admin"), authorizeDepartment("FIN"), approveBudget);


// Reject Budget
router.patch("/:id/reject", authorizeRoles("manager", "admin"), authorizeDepartment("FIN"), rejectBudget);


// Get Budget Utilization
router.get("/:id/utilization", authorizeRoles("manager", "admin"), authorizeDepartment("FIN"), getBudgetUtilization);


export default router;