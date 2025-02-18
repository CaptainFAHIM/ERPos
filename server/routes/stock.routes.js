import express from 'express';
import { getStockValue } from '../controllers/stock.controller.js';

const router = express.Router();

router.get('/', getStockValue);

export default router;
