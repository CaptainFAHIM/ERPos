import express from 'express';
import { createStockIn, getAllStockIn, getStockInById, updateStockIn, deleteStockIn } from '../controllers/stockin.controllers.js';

const router = express.Router();

router.post('/', createStockIn);
router.get('/', getAllStockIn);
router.get('/:id', getStockInById);
router.put('/:id', updateStockIn);
router.delete('/:id', deleteStockIn);

export default router;
