import express from 'express';
import { createSale, getAllSales, getSaleById, deleteSale } from '../controllers/sales.controller.js';

const router = express.Router();

router.post('/', createSale);
router.get('/', getAllSales);
router.get('/:id', getSaleById);
router.delete('/:id', deleteSale);

export default router;
