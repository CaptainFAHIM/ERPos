// controllers/summaryController.js
import Product from '../models/productlist.model.js';
import Sale from '../models/sales.model.js';
import Expense from '../models/expense.model.js';
import DamageProduct from '../models/damageproduct.model.js';

const getDateRange = (startDate, endDate) => {
    let start = startDate ? new Date(startDate) : new Date(0);
    let end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

export const getTotalSales = async (req, res) => {
    try {
        const { start, end } = getDateRange(req.query.startDate, req.query.endDate);
        const totalSales = await Sale.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: null, totalSalesAmount: { $sum: '$finalAmount' } } }
        ]);
        res.json({ totalSalesAmount: totalSales.length ? totalSales[0].totalSalesAmount : 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching total sales', error });
    }
};

export const getTotalExpenses = async (req, res) => {
    try {
        const { start, end } = getDateRange(req.query.startDate, req.query.endDate);
        const totalExpenses = await Expense.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: null, totalExpenseAmount: { $sum: '$expenseAmount' } } }
        ]);
        res.json({ totalExpenseAmount: totalExpenses.length ? totalExpenses[0].totalExpenseAmount : 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching total expenses', error });
    }
};

export const getTotalStockValue = async (req, res) => {
    try {
        const products = await Product.find();
        const totalStockValue = products.reduce((acc, product) => acc + (product.totalQuantity * product.sellPrice), 0);
        res.json({ totalStockValue });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching total stock value', error });
    }
};

export const getTotalDamageValue = async (req, res) => {
    try {
        const { start, end } = getDateRange(req.query.startDate, req.query.endDate);
        const damagedProducts = await DamageProduct.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: null, totalDamageValue: { $sum: { $multiply: ['$quantity', '$price'] } } } }
        ]);
        res.json({ totalDamageValue: damagedProducts.length ? damagedProducts[0].totalDamageValue : 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching total damage value', error });
    }
};

export const getTotalRevenue = async (req, res) => {
    try {
        const { start, end } = getDateRange(req.query.startDate, req.query.endDate);

        const totalRevenue = await Sale.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: null, totalRevenue: { $sum: '$finalAmount' } } }
        ]);

        res.json({ totalRevenue: totalRevenue.length ? totalRevenue[0].totalRevenue : 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching total revenue', error });
    }
};


export const getTotalTransactions = async (req, res) => {
    try {
        const { start, end } = getDateRange(req.query.startDate, req.query.endDate);
        const totalTransactions = await Sale.countDocuments({ createdAt: { $gte: start, $lte: end } });
        res.json({ totalTransactions });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching total transactions', error });
    }
};

export const getCOGS = async (req, res) => {
    try {
        const { start, end } = getDateRange(req.query.startDate, req.query.endDate);
        const sales = await Sale.find({ createdAt: { $gte: start, $lte: end } }).populate('products.productId');
        const totalCOGS = sales.reduce((acc, sale) => acc + sale.products.reduce((subAcc, product) => subAcc + (product.productId.purchasePrice * product.quantity), 0), 0);
        res.json({ totalCOGS });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching COGS', error });
    }
};

export const getGrossProfit = async (req, res) => {
    try {
        const { start, end } = getDateRange(req.query.startDate, req.query.endDate);

        // Fetch total sales
        const totalSales = await Sale.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: null, totalSalesAmount: { $sum: '$finalAmount' } } }
        ]);

        // Fetch COGS (Cost of Goods Sold)
        const sales = await Sale.find({ createdAt: { $gte: start, $lte: end } }).populate('products.productId');
        const totalCOGS = sales.reduce((acc, sale) =>
            acc + sale.products.reduce((subAcc, product) =>
                subAcc + (product.productId.purchasePrice * product.quantity), 0
            ), 0
        );

        // Calculate Gross Profit
        const grossProfit = (totalSales.length ? totalSales[0].totalSalesAmount : 0) - totalCOGS;

        res.json({ grossProfit });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching gross profit', error });
    }
};


export const getNetProfit = async (req, res) => {
    try {
        const { start, end } = getDateRange(req.query.startDate, req.query.endDate);

        // Fetch Gross Profit
        const totalSales = await Sale.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: null, totalSalesAmount: { $sum: '$finalAmount' } } }
        ]);

        const sales = await Sale.find({ createdAt: { $gte: start, $lte: end } }).populate('products.productId');
        const totalCOGS = sales.reduce((acc, sale) =>
            acc + sale.products.reduce((subAcc, product) =>
                subAcc + (product.productId.purchasePrice * product.quantity), 0
            ), 0
        );

        const grossProfit = (totalSales.length ? totalSales[0].totalSalesAmount : 0) - totalCOGS;

        // Fetch Total Expenses
        const totalExpenses = await Expense.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: null, totalExpenseAmount: { $sum: '$expenseAmount' } } }
        ]);

        // Calculate Net Profit
        const netProfit = grossProfit - (totalExpenses.length ? totalExpenses[0].totalExpenseAmount : 0);

        res.json({ netProfit });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching net profit', error });
    }
};


export const getMonthlyRevenue = async (req, res) => {
    try {
        const now = new Date();
        const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const currentMonthSales = await Sale.aggregate([
            { $match: { createdAt: { $gte: firstDayOfCurrentMonth, $lte: lastDayOfCurrentMonth } } },
            { $group: { _id: null, revenue: { $sum: '$finalAmount' } } }
        ]);

        const lastMonthSales = await Sale.aggregate([
            { $match: { createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth } } },
            { $group: { _id: null, revenue: { $sum: '$finalAmount' } } }
        ]);

        const currentRevenue = currentMonthSales.length ? currentMonthSales[0].revenue : 0;
        const lastRevenue = lastMonthSales.length ? lastMonthSales[0].revenue : 0;
        
        let growth = 0;
        if (lastRevenue !== 0) {
            growth = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
        }

        res.json({
            currentMonthRevenue: currentRevenue,
            lastMonthRevenue: lastRevenue,
            growthPercentage: growth.toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching monthly revenue', error });
    }
};
