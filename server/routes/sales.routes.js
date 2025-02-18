import express from 'express';
import { createSale, getAllSales, getSaleById, deleteSale, returnSale } from '../controllers/sales.controller.js';

const router = express.Router();

router.post('/', createSale);
router.get('/', getAllSales);
router.get('/:id', getSaleById);
router.delete('/:id', deleteSale);
router.post('/return', returnSale);

export default router;
