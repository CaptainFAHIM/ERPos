import Transaction from '../models/transaction.model.js';
import Cart from '../models/cart.model.js';
import Product from '../models/productlist.model.js';

// Generate a unique invoice number
const generateInvoiceNumber = async () => {
    const lastTransaction = await Transaction.findOne().sort({ transactionDate: -1 });
    const lastInvoiceNumber = lastTransaction ? parseInt(lastTransaction.invoiceNumber.replace('INV', '')) : 0;
    return `INV${String(lastInvoiceNumber + 1).padStart(5, '0')}`; // Example: INV00001, INV00002, ...
};

// Create a transaction
export const createTransaction = async (req, res) => {
    try {
        const { customerName, customerPhone } = req.body;

        // Fetch all items in the cart
        const cartItems = await Cart.find().populate('productId');
        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        let totalAmount = 0;
        const items = [];

        // Calculate total amount and update product quantities
        for (const cartItem of cartItems) {
            const product = cartItem.productId;

            // Check if there's enough stock
            if (product.totalQuantity < cartItem.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${product.description}` });
            }

            // Update product quantity
            product.totalQuantity -= cartItem.quantity;
            await product.save();

            // Add item to transaction
            items.push({
                productId: product._id,
                quantity: cartItem.quantity,
                price: product.sellPrice
            });

            // Calculate total amount
            totalAmount += product.sellPrice * cartItem.quantity;
        }

        // Generate invoice number
        const invoiceNumber = await generateInvoiceNumber();

        // Create the transaction
        const transaction = new Transaction({
            invoiceNumber, // Ensure this is assigned
            customerName,
            customerPhone,
            items,
            totalAmount
        });

        await transaction.save();

        // Clear the cart
        await Cart.deleteMany({});

        res.status(201).json({ message: 'Transaction completed successfully', transaction });
    } catch (error) {
        res.status(500).json({ message: 'Error processing transaction', error });
    }
};