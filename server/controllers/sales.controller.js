import Sale from '../models/sales.model.js';
import Product from '../models/productlist.model.js';

export const createSale = async (req, res) => {
    try {
        const { transactionNo, products, discount = 0, paymentMethod, customerName, customerNumber } = req.body;

        // Ensure required fields are provided
        if (!transactionNo || !products || products.length === 0) {
            return res.status(400).json({ message: "Transaction number and products are required" });
        }

        // Check if transactionNo already exists
        const existingSale = await Sale.findOne({ transactionNo });
        if (existingSale) {
            return res.status(400).json({ message: "Transaction number already exists" });
        }

        // Generate a unique invoice number
        let invoiceNo;
        let isUnique = false;
        while (!isUnique) {
            invoiceNo = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
            const existingInvoice = await Sale.findOne({ invoiceNo });
            if (!existingInvoice) {
                isUnique = true;
            }
        }

        let totalAmount = 0;
        let saleProducts = [];

        // Loop through each product in the order
        for (let item of products) {
            const { productId, quantity } = item;

            // Find the product
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${productId}` });
            }

            // Check stock availability
            if (product.totalQuantity < quantity) {
                return res.status(400).json({ message: `Not enough stock for product: ${product.barcode}` });
            }

            // Calculate total price for this product
            const totalPrice = product.sellPrice * quantity;
            totalAmount += totalPrice;

            // Reduce stock
            product.totalQuantity -= quantity;
            await product.save();

            // Add product details to the sale record
            saleProducts.push({
                productId: product._id,
                quantity,
                totalPrice
            });
        }

        // Apply discount (if any)
        const finalAmount = totalAmount - discount;

        if (finalAmount < 0) {
            return res.status(400).json({ message: "Discount cannot be greater than total amount" });
        }

        // Create the sale
        const newSale = new Sale({
            transactionNo,
            invoiceNo,
            products: saleProducts,
            totalAmount,
            discount,
            finalAmount,
            paymentMethod,
            customerName,
            customerNumber
        });

        // Save the sale
        await newSale.save();

        return res.status(201).json({
            message: "Sale completed successfully",
            sale: newSale
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get all sales
export const getAllSales = async (req, res) => {
    try {
        const sales = await Sale.find().populate('products.productId', 'barcode description sellPrice');
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single sale
export const getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id).populate('products.productId', 'barcode description sellPrice');
        if (!sale) return res.status(404).json({ message: 'Sale not found' });

        res.status(200).json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a sale
export const deleteSale = async (req, res) => {
    try {
        const sale = await Sale.findByIdAndDelete(req.params.id);
        if (!sale) return res.status(404).json({ message: 'Sale not found' });

        res.status(200).json({ message: 'Sale deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
