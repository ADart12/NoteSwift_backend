import Budget from "../../models/FinanceModel/budgetSchema";


export const createBudget = async (req, res) => {
    try {
        const {
            name,
            description,
            department,
            fiscalYear,
            allocatedAmount,
            startDate,
            endDate,
        } = req.body;

        // Required fields validation
        if (
            !name ||
            !department ||
            !fiscalYear ||
            allocatedAmount === undefined ||
            !startDate ||
            !endDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing",
            });
        }

        // Amount validation
        if (
            typeof allocatedAmount !== "number" ||
            allocatedAmount < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Allocated amount must be a valid positive number",
            });
        }

        // Date validation
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid start or end date",
            });
        }

        if (end < start) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date",
            });
        }

        const budget = await Budget.create({
            name,
            description,
            department,
            fiscalYear,
            allocatedAmount,
            startDate: start,
            endDate: end,
            createdBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Budget created successfully",
            data: budget,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create budget",
            error: error.message,
        });
    }
};

// Get All Budgets
export const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({
            isDeleted: false,
        })
            .populate("department", "name code")
            .populate("createdBy", "name email")
            .populate("approvedBy", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: budgets.length,
            data: budgets,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch budgets",
            error: error.message,
        });
    }
};


// Get Single Budget
export const getBudgetById = async (req, res) => {
    try {
        const { id } = req.params;

        const budget = await Budget.findOne({
            _id: id,
            isDeleted: false,
        })
            .populate("department", "name code")
            .populate("createdBy", "name email")
            .populate("approvedBy", "name email");

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: budget,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch budget",
            error: error.message,
        });
    }
};


// Update Budget
export const updateBudget = async (req, res) => {
    try {
        const { id } = req.params;

        const budget = await Budget.findOne({
            _id: id,
            isDeleted: false,
        });

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found",
            });
        }

        if (budget.status === "approved" || budget.status === "closed") {
            return res.status(400).json({
                success: false,
                message: "Approved or closed budget cannot be updated",
            });
        }

        const {
            name,
            description,
            department,
            fiscalYear,
            allocatedAmount,
            startDate,
            endDate,
        } = req.body;

        if (allocatedAmount !== undefined && allocatedAmount < 0) {
            return res.status(400).json({
                success: false,
                message: "Allocated amount cannot be negative",
            });
        }

        const finalStartDate = startDate || budget.startDate;
        const finalEndDate = endDate || budget.endDate;

        if (new Date(finalEndDate) < new Date(finalStartDate)) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date",
            });
        }

        budget.name = name ?? budget.name;
        budget.description = description ?? budget.description;
        budget.department = department ?? budget.department;
        budget.fiscalYear = fiscalYear ?? budget.fiscalYear;
        budget.allocatedAmount =
            allocatedAmount ?? budget.allocatedAmount;
        budget.startDate = finalStartDate;
        budget.endDate = finalEndDate;

        await budget.save();

        return res.status(200).json({
            success: true,
            message: "Budget updated successfully",
            data: budget,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update budget",
            error: error.message,
        });
    }
};


// Delete Budget
export const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;

        const budget = await Budget.findOne({
            _id: id,
            isDeleted: false,
        });

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found",
            });
        }

        if (budget.spentAmount > 0) {
            return res.status(400).json({
                success: false,
                message: "Budget with expenses cannot be deleted",
            });
        }

        budget.isDeleted = true;
        await budget.save();

        return res.status(200).json({
            success: true,
            message: "Budget deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete budget",
            error: error.message,
        });
    }
};


// Approve Budget
export const approveBudget = async (req, res) => {
    try {
        const { id } = req.params;

        const budget = await Budget.findOne({
            _id: id,
            isDeleted: false,
        });

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found",
            });
        }

        if (budget.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending budgets can be approved",
            });
        }

        budget.status = "approved";
        budget.approvedBy = req.user._id;
        budget.approvedAt = new Date();

        await budget.save();

        return res.status(200).json({
            success: true,
            message: "Budget approved successfully",
            data: budget,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to approve budget",
            error: error.message,
        });
    }
};


// Reject Budget
export const rejectBudget = async (req, res) => {
    try {
        const { id } = req.params;

        const budget = await Budget.findOne({
            _id: id,
            isDeleted: false,
        });

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found",
            });
        }

        if (budget.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending budgets can be rejected",
            });
        }

        budget.status = "rejected";

        await budget.save();

        return res.status(200).json({
            success: true,
            message: "Budget rejected successfully",
            data: budget,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to reject budget",
            error: error.message,
        });
    }
};


// Get Budget Utilization
export const getBudgetUtilization = async (req, res) => {
    try {
        const { id } = req.params;

        const budget = await Budget.findOne({
            _id: id,
            isDeleted: false,
        });

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found",
            });
        }

        const remainingAmount =
            budget.allocatedAmount - budget.spentAmount;

        const utilization =
            budget.allocatedAmount === 0
                ? 0
                : (budget.spentAmount / budget.allocatedAmount) * 100;

        return res.status(200).json({
            success: true,
            data: {
                allocatedAmount: budget.allocatedAmount,
                spentAmount: budget.spentAmount,
                remainingAmount,
                utilizationPercentage: Number(
                    utilization.toFixed(2)
                ),
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to calculate budget utilization",
            error: error.message,
        });
    }
};