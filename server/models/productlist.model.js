import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';

const productSchema = new mongoose.Schema({
    barcode: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    purchasePrice: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    totalQuantity: { type: Number, required: true }
}, { timestamps: true });

// Auto-incrementing ID
productSchema.plugin(AutoIncrement(mongoose), { inc_field: 'productId' });

const Product = mongoose.model('Product', productSchema);
export default Product;
