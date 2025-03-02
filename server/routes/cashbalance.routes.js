import express from 'express';
import { getCashBalance, withdrawCash, recordTransaction } from '../controllers/cashbalance.controller.js';

const router = express.Router();

// Get the current cash balance and transactions
router.get('/', getCashBalance);

// Withdraw from the cash balance
router.post('/withdraw', withdrawCash);

// Record a sale or supplier payment transaction
router.post('/transaction', recordTransaction);

export default router;
