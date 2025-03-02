import express from 'express';
import { getTodayHandCash, withdrawHandCash, getWithdrawalHistory, getTotalHandCash } from '../controllers/handcash.controller.js';

const router = express.Router();

// Get today's hand cash and withdrawals
router.get('/today', getTodayHandCash);

// Withdraw hand cash
router.post('/withdraw', withdrawHandCash);

// Get total withdrawal history
router.get('/withdrawals', getWithdrawalHistory);

// Get total hand cash (sum of all closing balances)
router.get('/total', getTotalHandCash);

export default router;
