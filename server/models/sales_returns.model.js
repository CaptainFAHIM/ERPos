import mongoose from 'mongoose';

const ReturnItemSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  product: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  returnReason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ReturnItem', ReturnItemSchema);
