import express from "express";
import {
  createExpenseCategory,
  getAllExpenseCategories,
  getExpenseCategoryById,
  updateExpenseCategory,
  deleteExpenseCategory
} from "../controllers/expenseCategory.controller.js";

const router = express.Router();

router.post("/", createExpenseCategory); // Create an expense category
router.get("/", getAllExpenseCategories); // Get all expense categories
router.get("/:id", getExpenseCategoryById); // Get single expense category
router.put("/:id", updateExpenseCategory); // Update expense category
router.delete("/:id", deleteExpenseCategory); // Delete expense category

export default router;
