import express from 'express';
import { getSalesProfit } from '../controllers/sale-profit.controller.js';

const router = express.Router();

router.get('/', getSalesProfit);

export default router;
