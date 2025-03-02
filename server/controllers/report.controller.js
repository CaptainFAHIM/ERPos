// controllers/reportController.js
import Sale from "../models/sales.model.js";
import Expense from "../models/expense.model.js";
import DamageProduct from "../models/damageproduct.model.js";




// 📈 Get Sales Data (All-Time / Today / Weekly / Monthly)
export const getSalesData = async (req, res) => {
    try {
        const { type } = req.params;
        const filter = getDateFilter(type);

        const totalSales = await Sale.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: "$finalAmount" } } }
        ]);

        res.json({ totalSales: totalSales[0]?.total || 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 💸 Get Expense Data
export const getExpensesData = async (req, res) => {
    try {
        const { type } = req.params;
        const filter = getDateFilter(type, "expenseDate");

        const totalExpenses = await Expense.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: "$expenseAmount" } } }
        ]);

        res.json({ totalExpenses: totalExpenses[0]?.total || 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📉 Get Damage Costs
export const getDamagesData = async (req, res) => {
    try {
        const { type } = req.params;
        const filter = getDateFilter(type);

        const totalDamages = await DamageProduct.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: { $multiply: ["$price", "$quantity"] } } } }
        ]);

        res.json({ totalDamages: totalDamages[0]?.total || 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📊 Get Profit Calculation
export const getProfitData = async (req, res) => {
    try {
        const { type } = req.params;
        const filter = getDateFilter(type);

        const totalSales = await Sale.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: "$finalAmount" } } }]);
        const totalExpenses = await Expense.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: "$expenseAmount" } } }]);
        const totalDamages = await DamageProduct.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: { $multiply: ["$price", "$quantity"] } } } }]);

        const profit = (totalSales[0]?.total || 0) - (totalExpenses[0]?.total || 0) - (totalDamages[0]?.total || 0);
        res.json({ profit });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📜 Get Full Summary Report
export const getSummary = async (req, res) => {
    try {
        const { type } = req.params;
        const filter = getDateFilter(type);

        const totalSales = await Sale.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: "$finalAmount" } } }]);
        const totalExpenses = await Expense.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: "$expenseAmount" } } }]);
        const totalDamages = await DamageProduct.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: { $multiply: ["$price", "$quantity"] } } } }]);
        const profit = (totalSales[0]?.total || 0) - (totalExpenses[0]?.total || 0) - (totalDamages[0]?.total || 0);

        res.json({
            sales: totalSales[0]?.total || 0,
            expenses: totalExpenses[0]?.total || 0,
            damages: totalDamages[0]?.total || 0,
            profit
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🛠 Helper Function: Generate Date Filter
const getDateFilter = (type, dateField = "createdAt") => {
    const today = new Date();

    // Start and end of today (12:00 AM - 11:59:59 PM)
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Calculate the start of the current week (Saturday to Friday)
    const startOfWeek = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Adjust to the most recent Saturday
    const daysToSaturday = (dayOfWeek + 1) % 7; // If today is Saturday (6), it should be 0 days back
    startOfWeek.setDate(today.getDate() - daysToSaturday);
    startOfWeek.setHours(0, 0, 0, 0);

    switch (type) {
        case "today":
            return { [dateField]: { $gte: startOfToday, $lte: endOfToday } }; // ✅ Fixed Today Filter (12 AM - 11:59 PM)
        case "weekly":
            return { [dateField]: { $gte: startOfWeek } };
        case "monthly":
            return { [dateField]: { $gte: new Date(today.getFullYear(), today.getMonth(), 1) } };
        default:
            return {}; // All-time filter
    }
};
