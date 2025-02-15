import express from 'express';
import { createReturnItem, getAllReturnItems, getReturnItemById, updateReturnItem, deleteReturnItem } from '../controllers/sales_returns.controller.js';

const router = express.Router();

router.post('/', createReturnItem);
router.get('/', getAllReturnItems);
router.get('/:id', getReturnItemById);
router.put('/:id', updateReturnItem);
router.delete('/:id', deleteReturnItem);

export default router;