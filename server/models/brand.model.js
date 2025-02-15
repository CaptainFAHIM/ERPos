import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';

const brandSchema = new mongoose.Schema({
    brandName: { type: String, required: true, unique: true }
}, { timestamps: true });

// Auto-incrementing ID
brandSchema.plugin(AutoIncrement(mongoose), { inc_field: 'brandId' });

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
