import Sale from '../models/sales.model.js';
import Product from '../models/productlist.model.js';

// Create a new sale
export const createSale = async (req, res) => {
    try {
        const { customerName, customerNumber, products, discount } = req.body;

        if (!customerName || !customerNumber || !products || products.length === 0) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        let totalAmount = 0;
        const saleProducts = [];

        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });

            if (product.totalQuantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.description}` });
            }

            const productTotal = product.sellPrice * item.quantity;
            totalAmount += productTotal;

            saleProducts.push({
                productId: product._id,
                quantity: item.quantity,
                price: product.sellPrice
            });

            // Update product stock
            product.totalQuantity -= item.quantity;
            await product.save();
        }

        const finalAmount = totalAmount - discount;

        const newSale = new Sale({
            customerName,
            customerNumber,
            totalAmount,
            discount,
            finalAmount,
            products: saleProducts
        });

        await newSale.save();
        res.status(201).json({ message: 'Sale recorded successfully', sale: newSale });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all sales
export const getAllSales = async (req, res) => {
    try {
        const sales = await Sale.find().populate('products.productId', 'description sellPrice');
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single sale by ID
export const getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id).populate('products.productId', 'description sellPrice');
        if (!sale) return res.status(404).json({ message: 'Sale not found' });

        res.status(200).json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a sale
export const deleteSale = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) return res.status(404).json({ message: 'Sale not found' });

        // Restore product stock
        for (const item of sale.products) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.totalQuantity += item.quantity;
                await product.save();
            }
        }

        await sale.deleteOne();
        res.status(200).json({ message: 'Sale deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
