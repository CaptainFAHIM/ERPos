import Product from '../models/productlist.model.js';
import Category from '../models/category.model.js';

// Get count of products by category
export const getProductsByCategory = async (req, res) => {
    try {
        const { categoryName } = req.params;

        // Find the category to make sure it exists
        const category = await Category.findOne({ categoryName });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Count how many products belong to the category
        const productCount = await Product.countDocuments({ category: categoryName });

        res.status(200).json({
            message: `Found ${productCount} products in the ${categoryName} category`,
            productCount,
        });
    } catch (error) {
        console.error("Error fetching products by category:", error);
        res.status(500).json({ message: 'Error fetching products by category', error });
    }
};
