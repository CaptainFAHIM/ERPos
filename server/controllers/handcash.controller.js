import HandCash from '../models/handcash.model..js';

// Get today's hand cash including withdrawals
export const getTodayHandCash = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    let handCash = await HandCash.findOne({ date: today });

    if (!handCash) {
      // If no record exists for today, create a new record
      handCash = new HandCash({
        date: today,
        openingBalance: 0,
        totalSales: 0,
        closingBalance: 0,
        withdrawals: [],
        withdrawalCount: 0,
      });
      await handCash.save();
    }

    res.status(200).json({
      todayHandCash: handCash,
      totalWithdrawalsToday: handCash.withdrawals.reduce((total, withdrawal) => total + withdrawal.amount, 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add sales amount to hand cash (after a sale)
export const addSaleToHandCash = async (sale) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Get today's date

    // Find the hand cash record for today
    let handCash = await HandCash.findOne({ date: today });

    if (!handCash) {
      // If no record exists for today, create one with default values
      handCash = new HandCash({
        date: today,
        openingBalance: 0,
        totalSales: 0,
        closingBalance: 0,
        withdrawals: [],
        withdrawalCount: 0,
      });
      await handCash.save();
    }

    // Update the hand cash with the sale amount
    handCash.totalSales += sale.finalAmount;
    handCash.closingBalance += sale.finalAmount; // Assuming all cash sales
    await handCash.save();

  } catch (error) {
    console.error("Error updating hand cash:", error);
  }
};

export const withdrawHandCash = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const today = new Date().toISOString().split('T')[0]; // Get today's date

    // Find today's hand cash record
    let handCash = await HandCash.findOne({ date: today });

    if (!handCash) {
      return res.status(400).json({ message: "No hand cash record found for today" });
    }

    // Check if there is enough hand cash for withdrawal
    if (handCash.closingBalance < amount) {
      return res.status(400).json({ message: "Insufficient hand cash" });
    }

    // Add the withdrawal details
    handCash.withdrawals.push({ amount, reason, date: new Date() });
    handCash.withdrawalCount += 1;
    handCash.closingBalance -= amount;

    // Update the total amount after the withdrawal
    handCash.totalAmount = await HandCash.aggregate([
      { $group: { _id: null, total: { $sum: "$closingBalance" } } }
    ]).then(result => result[0]?.total || 0); // Calculate the total hand cash

    // Save the updated hand cash record
    await handCash.save();

    res.status(200).json({ message: "Withdrawal successful", closingBalance: handCash.closingBalance, totalHandCash: handCash.totalAmount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get withdrawal history and total withdrawals
export const getWithdrawalHistory = async (req, res) => {
  try {
    const handCashRecords = await HandCash.find({ withdrawals: { $exists: true, $ne: [] } });

    // Calculate total withdrawals
    const totalWithdrawals = handCashRecords.reduce((total, record) => {
      return total + record.withdrawals.reduce((totalAmount, withdrawal) => totalAmount + withdrawal.amount, 0);
    }, 0);

    res.status(200).json({
      withdrawals: handCashRecords.flatMap(h => h.withdrawals),
      totalWithdrawals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get total hand cash (sum of all closing balances)
export const getTotalHandCash = async (req, res) => {
  try {
    const totalHandCash = await HandCash.aggregate([
      { $group: { _id: null, total: { $sum: "$closingBalance" } } }
    ]);

    res.status(200).json({
      totalHandCash: totalHandCash[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
