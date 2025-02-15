import express from "express";
import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
} from "../controllers/expense.controller.js";

const router = express.Router();

router.post("/", createExpense); // Create an expense entry
router.get("/", getAllExpenses); // Get all expenses
router.get("/:id", getExpenseById); // Get single expense entry
router.put("/:id", updateExpense); // Update expense entry
router.delete("/:id", deleteExpense); // Delete expense entry

export default router;
