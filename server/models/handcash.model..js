import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const handCashSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  openingBalance: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  closingBalance: { type: Number, default: 0 },
  withdrawals: { type: [withdrawalSchema], default: [] }, // Store withdrawals as an array of objects
  withdrawalCount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 } // This field will track the total hand cash
});

export default mongoose.model('HandCash', handCashSchema);
