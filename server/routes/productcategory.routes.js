import express from 'express';
import { getProductsByCategory } from '../controllers/product.category.controller.js';

const router = express.Router();

// Get the number of products by category
router.get('/:categoryName', getProductsByCategory);

export default router;
