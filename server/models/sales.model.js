import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
    transactionNo: { type: Number, required: true, unique: true }, 
    invoiceNo: { type: Number, required: true, unique: true },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            totalPrice: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true }, // Total price before discount
    discount: { type: Number, default: 0 }, // Discount applied (default is 0)
    finalAmount: { type: Number, required: true }, // Final amount after discount
    paymentMethod: { type: String, enum: ['cash', 'card'], required: true },
    customerName: { type: String, required: true },
    customerNumber: { type: String, required: false }
}, { timestamps: true });

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;
