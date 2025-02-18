// controllers/financeController.js
import Sale from "../models/sales.model.js";
import Expense from "../models/expense.model.js";

const getMonthRange = (monthOffset = 0) => {
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const firstDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
    return { firstDay, lastDay };
};

// Get Revenue
export const getRevenue = async (req, res) => {
    try {
        const monthOffset = parseInt(req.query.monthOffset) || 0;
        const { firstDay, lastDay } = getMonthRange(monthOffset);

        const sales = await Sale.aggregate([
            { $match: { createdAt: { $gte: firstDay, $lte: lastDay } } },
            { $group: { _id: null, totalRevenue: { $sum: "$finalAmount" } } }
        ]);

        const revenue = sales.length > 0 ? sales[0].totalRevenue : 0;

        res.json({ revenue });
    } catch (error) {
        res.status(500).json({ message: "Error calculating revenue", error });
    }
};

// Get Gross Profit
export const getGrossProfit = async (req, res) => {
    try {
        const monthOffset = parseInt(req.query.monthOffset) || 0;
        const { firstDay, lastDay } = getMonthRange(monthOffset);

        const sales = await Sale.aggregate([
            { $match: { createdAt: { $gte: firstDay, $lte: lastDay } } },
            { 
                $group: { 
                    _id: null, 
                    totalRevenue: { $sum: "$finalAmount" },
                    totalCostPrice: { $sum: "$totalCostPrice" }
                } 
            }
        ]);

        const revenue = sales.length > 0 ? sales[0].totalRevenue : 0;
        const totalCostPrice = sales.length > 0 ? sales[0].totalCostPrice : 0;
        const grossProfit = revenue - totalCostPrice;

        res.json({ grossProfit });
    } catch (error) {
        res.status(500).json({ message: "Error calculating gross profit", error });
    }
};

// Get Net Profit (After Expenses)
export const getNetProfit = async (req, res) => {
    try {
        const monthOffset = parseInt(req.query.monthOffset) || 0;
        const { firstDay, lastDay } = getMonthRange(monthOffset);

        const sales = await Sale.aggregate([
            { $match: { createdAt: { $gte: firstDay, $lte: lastDay } } },
            { 
                $group: { 
                    _id: null, 
                    totalRevenue: { $sum: "$finalAmount" },
                    totalCostPrice: { $sum: "$totalCostPrice" }
                } 
            }
        ]);

        const expenses = await Expense.aggregate([
            { $match: { createdAt: { $gte: firstDay, $lte: lastDay } } },
            { $group: { _id: null, totalExpenses: { $sum: "$expenseAmount" } } }
        ]);

        const revenue = sales.length > 0 ? sales[0].totalRevenue : 0;
        const totalCostPrice = sales.length > 0 ? sales[0].totalCostPrice : 0;
        const totalExpenses = expenses.length > 0 ? expenses[0].totalExpenses : 0;

        const grossProfit = revenue - totalCostPrice;
        const netProfit = grossProfit - totalExpenses;

        res.json({ netProfit });
    } catch (error) {
        res.status(500).json({ message: "Error calculating net profit", error });
    }
};

// Get Profit (Both Gross and Net Profit)
export const getProfit = async (req, res) => {
    try {
        const monthOffset = parseInt(req.query.monthOffset) || 0;
        const { firstDay, lastDay } = getMonthRange(monthOffset);

        const sales = await Sale.aggregate([
            { $match: { createdAt: { $gte: firstDay, $lte: lastDay } } },
            { 
                $group: { 
                    _id: null, 
                    totalRevenue: { $sum: "$finalAmount" },
                    totalCostPrice: { $sum: "$totalCostPrice" }
                } 
            }
        ]);

        const expenses = await Expense.aggregate([
            { $match: { createdAt: { $gte: firstDay, $lte: lastDay } } },
            { $group: { _id: null, totalExpenses: { $sum: "$expenseAmount" } } }
        ]);

        const revenue = sales.length > 0 ? sales[0].totalRevenue : 0;
        const totalCostPrice = sales.length > 0 ? sales[0].totalCostPrice : 0;
        const totalExpenses = expenses.length > 0 ? expenses[0].totalExpenses : 0;

        const grossProfit = revenue - totalCostPrice;
        const netProfit = grossProfit - totalExpenses;

        res.json({ grossProfit, netProfit });
    } catch (error) {
        res.status(500).json({ message: "Error calculating profit", error });
    }
};
