import Sale from "../models/sales.model.js";
import Product from "../models/productlist.model.js";

const getSalesProfit = async (req, res) => {
    try {
        const now = new Date();
        const timeFrames = {
            currentMonth: new Date(now.getFullYear(), now.getMonth(), 1),
            last3Months: new Date(now.getFullYear(), now.getMonth() - 2, 1),
            last6Months: new Date(now.getFullYear(), now.getMonth() - 5, 1),
            last1Year: new Date(now.getFullYear() - 1, now.getMonth(), 1),
            last3Years: new Date(now.getFullYear() - 3, now.getMonth(), 1)
        };

        // Function to calculate total sales & profit using MongoDB aggregation
        const calculateSalesProfit = async (startDate) => {
            const filter = startDate ? { createdAt: { $gte: startDate, $lt: now } } : {};
            
            const sales = await Sale.aggregate([
                { $match: filter },
                { $unwind: "$products" },
                {
                    $lookup: {
                        from: "products", // Ensure this matches the actual collection name
                        localField: "products.productId",
                        foreignField: "_id",
                        as: "productInfo"
                    }
                },
                { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: "$finalAmount" }, // Sum of final amounts after discount
                        totalCost: {
                            $sum: {
                                $multiply: [
                                    { $ifNull: ["$productInfo.purchasePrice", 0] },
                                    { $ifNull: ["$products.quantity", 0] }
                                ]
                            }
                        }
                    }
                }
            ]);

            if (!sales.length) return { totalSales: 0, totalProfit: 0 };

            const { totalSales, totalCost } = sales[0];
            return { totalSales, totalProfit: totalSales - totalCost };
        };

        // Fetch data for all time periods in parallel
        const results = await Promise.all(
            Object.entries(timeFrames).map(async ([key, value]) => [key, await calculateSalesProfit(value)])
        );

        // Convert array to object
        const salesData = Object.fromEntries(results);

        // Fetch all-time sales & profit
        salesData.allTime = await calculateSalesProfit(null);

        res.json(salesData);
    } catch (error) {
        console.error("Error fetching sales and profit:", error);
        res.status(500).json({ message: "Error fetching sales and profit", error });
    }
};

export { getSalesProfit };
