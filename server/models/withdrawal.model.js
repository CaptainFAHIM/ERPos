import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'bank'], required: true },
    reason: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Withdrawal', withdrawalSchema);
