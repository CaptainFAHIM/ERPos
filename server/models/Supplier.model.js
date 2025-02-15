import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    contactPerson: { type: String },
    phone: { type: String, required: true },
    email: { type: String, unique: true },
    address: { type: String }
  },
  { timestamps: true }
);

// Prevent model overwrite error
const Supplier = mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);

export default Supplier;
