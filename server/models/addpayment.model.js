import mongoose from 'mongoose';

const PaySupplierSchema = new mongoose.Schema({
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    product: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
    dueAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    notes: { type: String }
}, { timestamps: true });

export default mongoose.model('PaySupplier', PaySupplierSchema);
