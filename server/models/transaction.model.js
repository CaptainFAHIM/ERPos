import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true }, // Also serves as the invoice number
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true } // Price at the time of transaction
    }],
    totalAmount: { type: Number, required: true },
    transactionDate: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;