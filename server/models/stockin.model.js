import mongoose from "mongoose";

const stockInSchema = new mongoose.Schema(
  {
    referenceNo: { type: String, required: true, unique: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    stockInBy: { type: String, required: true },
    stockInDate: { type: Date, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

const StockIn = mongoose.models.StockIn || mongoose.model("StockIn", stockInSchema);
export default StockIn;