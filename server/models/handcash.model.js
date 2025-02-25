import mongoose from 'mongoose';

const handCashSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // YYYY-MM-DD format
    totalSales: { type: Number, default: 0 }, // Total sales for the day
    supplierPayments: [
        {
            amount: { type: Number, required: true }, // Payment amount
            paidAt: { type: Date, default: Date.now } // Timestamp of payment
        }
    ],
    handCash: { type: Number, default: 0 } // Remaining cash after payments
}, { timestamps: true });

export default mongoose.model('HandCash', handCashSchema);
