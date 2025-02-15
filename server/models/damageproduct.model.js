import mongoose from "mongoose";

const damageProductSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true, unique: true },
    product: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true }
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const DamageProduct = mongoose.models.DamageProduct || mongoose.model("DamageProduct", damageProductSchema);

export default DamageProduct;
