import express from 'express';
import {
    getTotalSales,
    getTotalExpenses,
    getTotalStockValue,
    getTotalDamageValue,
    getTotalTransactions,
    getCOGS,
    getGrossProfit,
    getNetProfit,
    getMonthlyRevenue,
    getTotalRevenue
} from '../controllers/summary.controller.js';

const router = express.Router();

router.get('/total-sales', getTotalSales);
router.get('/total-revenue', getTotalRevenue);
router.get('/total-expenses', getTotalExpenses);
router.get('/total-stock-value', getTotalStockValue);
router.get('/total-damage-value', getTotalDamageValue);
router.get('/total-transactions', getTotalTransactions);
router.get('/cogs', getCOGS);
router.get('/gross-profit', getGrossProfit);
router.get('/net-profit', getNetProfit);
router.get('/monthly-revenue', getMonthlyRevenue);


export default router;