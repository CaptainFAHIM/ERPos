import Product from '../models/productlist.model.js';

// Calculate Total Stock Value (Based on Purchase Price)
export const getStockValue = async (req, res) => {
    try {
        const products = await Product.find();

        const totalStockValue = products.reduce((total, product) => {
            return total + (product.totalQuantity * product.purchasePrice);
        }, 0);

        res.status(200).json({ stockValue: totalStockValue });
    } catch (error) {
        res.status(500).json({ message: "Error fetching stock value", error });
    }
};
