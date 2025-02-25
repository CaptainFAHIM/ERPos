import HandCash from '../models/handcash.model.js';
import Sale from '../models/sales.model.js';

export const updateHandCash = async (req, res) => {
    try {
        const { amount } = req.body;
        console.log("Request Body:", req.body);

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid payment amount" });
        }

        const today = new Date().toISOString().split('T')[0];

        let handCashRecord = await HandCash.findOne({ date: today });

        if (!handCashRecord) {
            return res.status(400).json({ success: false, message: "No sales record for today" });
        }

        handCashRecord.supplierPayments.push({ amount, paidAt: new Date() });
        handCashRecord.handCash -= amount;

        await handCashRecord.save();

        res.status(200).json({ success: true, data: handCashRecord });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get hand cash details for a specific date
export const getHandCashByDate = async (req, res) => {
    try {
        const { date } = req.params;
        
        // Fetch total sales for the given date
        const totalSales = await Sale.aggregate([
            {
                $match: {
                    createdAt: { 
                        $gte: new Date(date + 'T00:00:00.000Z'),
                        $lt: new Date(date + 'T23:59:59.999Z')
                    }
                }
            },
            { $group: { _id: null, totalSales: { $sum: "$finalAmount" } } }
        ]);

        const salesAmount = totalSales.length > 0 ? totalSales[0].totalSales : 0;

        // Find hand cash record for the given date
        let handCash = await HandCash.findOne({ date });

        if (!handCash) {
            handCash = { date, totalSales: salesAmount, supplierPayments: [], handCash: salesAmount };
        }

        res.status(200).json({ success: true, data: handCash });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all hand cash records sorted by latest date
export const getAllHandCash = async (req, res) => {
    try {
        const handCashRecords = await HandCash.find().sort({ date: -1 });

        res.status(200).json({ success: true, data: handCashRecords });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};