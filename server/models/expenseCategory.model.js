import mongoose from "mongoose";

const expenseCategorySchema = new mongoose.Schema(
  {
    categoryName: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const ExpenseCategory = mongoose.models.ExpenseCategory || mongoose.model("ExpenseCategory", expenseCategorySchema);

export default ExpenseCategory;
