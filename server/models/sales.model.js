import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';

const saleSchema = new mongoose.Schema({
    transactionNo: { type: Number, unique: true },
    customerName: { type: String, required: true },
    customerNumber: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    createdAt: { type: Date, default: Date.now }
});

// ✅ Fix: Properly apply the Auto-Increment plugin
saleSchema.plugin(AutoIncrement(mongoose), { inc_field: 'transactionNo' });

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;
