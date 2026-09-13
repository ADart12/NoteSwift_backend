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



export const getExpenses = async (req, res) => {
  try {
    // 🔐 Controller-level authorization
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Admin can access
    if (req.user.role !== "admin") {

      // Only manager can access
      if (req.user.role !== "manager") {
        return res.status(403).json({
          success: false,
          message: "Only Finance Manager can access expenses",
        });
      }

      // Must be Finance department
      if (req.user.department?.code !== "FIN") {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to access Finance expenses",
        });
      }
    }

    // 📊 Get only active expenses
    const expenses = await Expense.find({
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });

  } catch (error) {
    console.error("Error fetching expenses:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
    });
  }
};


export const getExpenseById = async (req, res) => {
  try {
    // 🔐 Controller-level authorization
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Admin can access
    if (req.user.role !== "admin") {

      // Only manager can access
      if (req.user.role !== "manager") {
        return res.status(403).json({
          success: false,
          message: "Only Finance Manager can access expenses",
        });
      }

      // Must be Finance department
      if (req.user.department?.code !== "FIN") {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to access Finance expenses",
        });
      }
    }

    // 🔎 Get expense ID from URL
    const { id } = req.params;

    // 📌 Get only non-deleted expense
    const expense = await Expense.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      success: true,
      expense,
    });

  } catch (error) {
    console.error("Error fetching expense:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expense",
    });
  }
};

export const updateExpense = async (req, res) => {
  try {
    // 🔐 Controller-level authorization
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Admin can access
    if (req.user.role !== "admin") {

      // Only manager can update expenses
      if (req.user.role !== "manager") {
        return res.status(403).json({
          success: false,
          message: "Only Finance Manager can update expenses",
        });
      }

      // Must be Finance department
      if (req.user.department?.code !== "FIN") {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update Finance expenses",
        });
      }
    }

    const { id } = req.params;

    const expense = await Expense.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Update only fields sent in request
    Object.assign(expense, req.body);

    const updatedExpense = await expense.save();

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense: updatedExpense,
    });

  } catch (error) {
    console.error("Error updating expense:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update expense",
    });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    // 🔐 Controller-level authorization
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Admin can delete
    if (req.user.role !== "admin") {

      // Only manager can delete
      if (req.user.role !== "manager") {
        return res.status(403).json({
          success: false,
          message: "Only Finance Manager can delete expenses",
        });
      }

      // Must be Finance department
      if (req.user.department?.code !== "FIN") {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete Finance expenses",
        });
      }
    }

    const { id } = req.params;

    // 🔎 Find only active expense
    const expense = await Expense.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // 🗑️ Soft delete
    expense.isDeleted = true;
    expense.deletedAt = new Date();
    expense.deletedBy = req.user._id;

    await expense.save();

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting expense:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete expense",
    });
  }
};