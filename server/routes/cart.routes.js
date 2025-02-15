import express from 'express';
import { addToCart, getCart } from '../controllers/cart.controller.js';

const router = express.Router();

router.post('/add', addToCart); // Add item to cart
router.get('/', getCart); // Get all items in cart

export default router;