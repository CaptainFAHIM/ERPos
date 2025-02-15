import ExpenseCategory from "../models/expenseCategory.model.js";
import mongoose from "mongoose";

// ✅ Create a new expense category
export const createExpenseCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    const existingCategory = await ExpenseCategory.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).json({ message: "Expense category already exists" });
    }

    const expenseCategory = new ExpenseCategory({ categoryName });
    await expenseCategory.save();

    res.status(201).json({ message: "Expense category added successfully", expenseCategory });
  } catch (error) {
    res.status(500).json({ message: "Error adding expense category", error });
  }
};

// ✅ Get all expense categories
export const getAllExpenseCategories = async (req, res) => {
  try {
    const categories = await ExpenseCategory.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching expense categories:", error);
    res.status(500).json({ message: "Error fetching expense categories", error });
  }
};

// ✅ Get an expense category by ID
export const getExpenseCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Expense Category ID format" });
    }

    const category = await ExpenseCategory.findById(id);
    if (!category) return res.status(404).json({ message: "Expense category not found" });

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expense category", error });
  }
};

// ✅ Update an expense category
export const updateExpenseCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Expense Category ID format" });
    }

    const category = await ExpenseCategory.findByIdAndUpdate(
      id,
      { categoryName },
      { new: true }
    );

    if (!category) return res.status(404).json({ message: "Expense category not found" });

    res.status(200).json({ message: "Expense category updated successfully", category });
  } catch (error) {
    res.status(500).json({ message: "Error updating expense category", error });
  }
};

// ✅ Delete an expense category
export const deleteExpenseCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Expense Category ID format" });
    }

    const category = await ExpenseCategory.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: "Expense category not found" });

    res.status(200).json({ message: "Expense category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense category", error });
  }
};
