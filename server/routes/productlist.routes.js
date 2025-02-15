import express from 'express';
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from '../controllers/productlist.controller.js';

const router = express.Router();

router.post('/', createProduct); // Add product
router.get('/', getAllProducts); // Get all products
router.get('/:id', getProductById); // Get product by ID
router.put('/:id', updateProduct); // Update product
router.delete('/:id', deleteProduct); // Delete product

export default router;
