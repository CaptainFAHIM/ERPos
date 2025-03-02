// controllers/handCashController.js
import HandCash from "../models/handcash.model..js";

// 💰 Withdraw from Hand Cash
export const withdrawHandCash = async (req, res) => {
    try {
        const { amount } = req.body;

        if (amount <= 0) {
            return res.status(400).json({ error: "Withdrawal amount must be greater than zero." });
        }

        // Get total hand cash
        const totalDeposits = await HandCash.aggregate([
            { $match: { type: "deposit" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalWithdrawals = await HandCash.aggregate([
            { $match: { type: "withdraw" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const currentHandCash = (totalDeposits[0]?.total || 0) - (totalWithdrawals[0]?.total || 0);

        if (amount > currentHandCash) {
            return res.status(400).json({ error: "Insufficient hand cash balance." });
        }

        // Save withdrawal transaction
        const withdrawal = new HandCash({ amount, type: "withdraw" });
        await withdrawal.save();

        res.json({ message: "Withdrawal successful", newBalance: currentHandCash - amount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
