// controllers/finance/expenseController.js

import Expense from "../../models/FinanceModel/expenseSchema.js";
import Budget from "../../models/FinanceModel/budgetSchema.js";

export const createExpense = async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      category,
      department,
      budget,
      expenseDate,
    } = req.body;

    // 1. Validate required fields
    if (!title || !amount || !category || !department || !budget) {
      return res.status(400).json({
        success: false,
        message:
          "Title, amount, category, department and budget are required",
      });
    }

    // 2. Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Expense amount must be greater than 0",
      });
    }

    // 3. Check whether budget exists
    const existingBudget = await Budget.findById(budget);

    if (!existingBudget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    // 4. Expense must belong to an approved budget
    if (existingBudget.status !== "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Expense can only be created for an approved budget",
      });
    }

    // 5. Check remaining budget
    if (amount > existingBudget.remainingAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient budget available",
      });
    }

    // 6. Create expense
    const expense = await Expense.create({
      title,
      description,
      amount,
      category,
      department,
      budget,
      requestedBy: req.user._id,
      expenseDate: expenseDate || Date.now(),
      status: "PENDING",
    });

    // 7. Send response
    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
      expense,
    });
  } catch (error) {
    console.error("Create Expense Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create expense",
      error: error.message,
    });
  }
};