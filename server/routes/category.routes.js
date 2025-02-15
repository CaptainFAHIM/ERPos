import express from 'express';
import { createCategory, getAllCategories, updateCategory, deleteCategory } from '../controllers/category.controller.js';

const router = express.Router();

router.post('/', createCategory); // Add category
router.get('/', getAllCategories); // Get all categories
router.put('/:id', updateCategory); // Update category
router.delete('/:id', deleteCategory); // Delete category

export default router;
