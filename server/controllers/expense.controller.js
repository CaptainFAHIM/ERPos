import Expense from "../models/expense.model.js";
import mongoose from "mongoose";

// ✅ Create a new expense entry
export const createExpense = async (req, res) => {
  try {
    const { expenseDate, expenseCategory, expenseAmount, expenseNote } = req.body;

    const expense = new Expense({ expenseDate, expenseCategory, expenseAmount, expenseNote });
    await expense.save();

    res.status(201).json({ message: "Expense entry added successfully", expense });
  } catch (error) {
    res.status(500).json({ message: "Error adding expense entry", error });
  }
};

// ✅ Get all expenses
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Error fetching expenses", error });
  }
};

// ✅ Get an expense by ID
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Expense ID format" });
    }

    const expense = await Expense.findById(id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expense", error });
  }
};

// ✅ Update an expense entry
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { expenseDate, expenseCategory, expenseAmount, expenseNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Expense ID format" });
    }

    const expense = await Expense.findByIdAndUpdate(
      id,
      { expenseDate, expenseCategory, expenseAmount, expenseNote },
      { new: true }
    );

    if (!expense) return res.status(404).json({ message: "Expense not found" });

    res.status(200).json({ message: "Expense entry updated successfully", expense });
  } catch (error) {
    res.status(500).json({ message: "Error updating expense entry", error });
  }
};

// ✅ Delete an expense entry
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Expense ID format" });
    }

    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    res.status(200).json({ message: "Expense entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense entry", error });
  }
};
