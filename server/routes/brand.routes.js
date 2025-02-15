import express from 'express';
import { createBrand, getAllBrands, updateBrand, deleteBrand } from '../controllers/brand.controller.js';

const router = express.Router();

router.post('/', createBrand); // Add brand
router.get('/', getAllBrands); // Get all brands
router.put('/:id', updateBrand); // Update brand
router.delete('/:id', deleteBrand); // Delete brand

export default router;
