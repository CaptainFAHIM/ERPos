import Product from "../models/productlist.model.js"; 

export const getLowStockProducts = async (req, res) => {
    try {
      const fixedQuantity = 60; // Fixed quantity for comparison
      const lowStockThreshold = fixedQuantity * 0.10; // 10% of 60 is 6
  
      const products = await Product.find({ totalQuantity: { $lt: lowStockThreshold } });
  
      if (products.length === 0) {
        return res.status(404).json({ message: "No products with low stock.", lowStockCount: 0 });
      }
  
      return res.status(200).json({
        lowStockCount: products.length, // Add the count of products with low stock
        products: products
      });
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      return res.status(500).json({ message: "Error fetching low stock products." });
    }
  };
