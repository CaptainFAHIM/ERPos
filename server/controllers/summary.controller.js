import Product from "../models/productlist.model.js";
import Sale from "../models/sales.model.js";
import Expense from "../models/expense.model.js";
import DamageProduct from "../models/damageproduct.model.js";
import mongoose from "mongoose";

// Generate Summary Report
export const getSummaryReport = async (req, res) => {
  try {
    // 1. Get total sales amount
    const totalSales = await Sale.aggregate([
      { $group: { _id: null, totalSalesAmount: { $sum: "$finalAmount" } } }
    ]);
    const totalSalesAmount = totalSales.length > 0 ? totalSales[0].totalSalesAmount : 0;

    // 2. Get total expenses amount
    const totalExpenses = await Expense.aggregate([
      { $group: { _id: null, totalExpenseAmount: { $sum: "$expenseAmount" } } }
    ]);
    const totalExpenseAmount = totalExpenses.length > 0 ? totalExpenses[0].totalExpenseAmount : 0;

    // 3. Get total stock value (quantity * sell price)
    const products = await Product.find();
    let totalStockValue = 0;
    products.forEach((product) => {
      totalStockValue += product.totalQuantity * product.sellPrice;
    });

    // 4. Get total damaged product value (quantity * price)
    const damagedProducts = await DamageProduct.aggregate([
      { $group: { _id: null, totalDamageValue: { $sum: { $multiply: ["$quantity", "$price"] } } } }
    ]);
    const totalDamageValue = damagedProducts.length > 0 ? damagedProducts[0].totalDamageValue : 0;

    // 5. Get total transactions (count of sales)
    const totalTransactions = await Sale.countDocuments();

    // 6. Calculate COGS (Cost of Goods Sold)
    let totalCOGS = 0;
    const sales = await Sale.find().populate("products.productId");
    sales.forEach((sale) => {
      sale.products.forEach((product) => {
        const productInfo = product.productId;
        const quantitySold = product.quantity;
        totalCOGS += productInfo.purchasePrice * quantitySold;
      });
    });

    // 7. Calculate profit (Gross Profit = Sales - COGS, Net Profit = Gross Profit - Expenses)
    const grossProfit = totalSalesAmount - totalCOGS;
    const netProfit = grossProfit - totalExpenseAmount;

    // 8. Get Monthly Revenue (total sales amount for the current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, monthlyRevenue: { $sum: "$finalAmount" } } }
    ]);
    const monthlyRevenue = monthlySales.length > 0 ? monthlySales[0].monthlyRevenue : 0;

    // 9. Compile the Summary Report
    const summaryReport = {
      totalSalesAmount,
      totalExpenseAmount,
      totalStockValue,
      totalDamageValue,
      totalTransactions,
      profit: netProfit,  // Net Profit is now the overall profit value
      monthlyRevenue,
      grossProfit,
      netProfit
    };

    // Return the summary report
    res.status(200).json({ message: "Summary Report generated successfully", summaryReport });
  } catch (error) {
    console.error("Error generating Summary Report:", error); // Log the error to the console
    res.status(500).json({ message: "Error generating Summary Report", error: error.message });
  }
};
