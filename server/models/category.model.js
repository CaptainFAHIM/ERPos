import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';

const categorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true, unique: true }
}, { timestamps: true });

// Auto-incrementing ID
categorySchema.plugin(AutoIncrement(mongoose), { inc_field: 'categoryId' });

const Category = mongoose.model('Category', categorySchema);
export default Category;
