import mongoose from "mongoose";

const stockInSchema = new mongoose.Schema(
  {
    referenceNo: { type: String, required: true, unique: true },
    supplier: { type: String, required: true },
    stockInBy: { type: String, required: true },
    stockInDate: { type: Date, required: true },
    contactPerson: { type: String },
    address: { type: String },
    productName: { type: String, required: true }, 
    barcode: { type: String, required: true, unique: true }, 
    quantity: { type: Number, required: true, min: 1 } 
  },
  { timestamps: true }
);

//Prevent OverwriteModelError
const StockIn = mongoose.models.StockIn || mongoose.model("StockIn", stockInSchema);

export default StockIn;
