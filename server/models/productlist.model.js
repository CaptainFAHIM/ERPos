import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';

// Pass mongoose to mongoose-sequence
const AutoIncrement = mongooseSequence(mongoose);

const productSchema = new mongoose.Schema({
    barcode: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    purchasePrice: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    totalQuantity: { type: Number, required: true }
}, { timestamps: true });

// Apply Auto-Increment Plugin
productSchema.plugin(AutoIncrement, { inc_field: 'productId' });

const Product = mongoose.model('Product', productSchema);
export default Product;
