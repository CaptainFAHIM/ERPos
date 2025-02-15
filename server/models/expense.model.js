import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    expenseDate: { type: Date, required: true },
    expenseCategory: { type: String, required: true },
    expenseAmount: { type: Number, required: true, min: 0 },
    expenseNote: { type: String }
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const Expense = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);

export default Expense;
