import Cart from '../models/cart.model.js';
import Product from '../models/productlist.model.js';

// Add item to cart (or update quantity if already exists)
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Fetch the product to ensure it exists and check stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if there's enough stock
        if (product.totalQuantity < quantity) {
            return res.status(400).json({ message: 'Not enough stock' });
        }

        // Check if the product already exists in the cart
        let cartItem = await Cart.findOne({ productId });

        if (cartItem) {
            // If the product exists in the cart, update the quantity
            cartItem.quantity += quantity;
        } else {
            // If the product doesn't exist in the cart, create a new cart entry
            cartItem = new Cart({
                productId,
                quantity
            });
        }

        // Save the updated or new cart item
        await cartItem.save();

        res.status(201).json({ message: 'Item added to cart successfully', cartItem });
    } catch (error) {
        res.status(500).json({ message: 'Error adding item to cart', error });
    }
};

// Get all items in the cart
export const getCart = async (req, res) => {
    try {
        const cartItems = await Cart.find().populate('productId');
        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart items', error });
    }
};