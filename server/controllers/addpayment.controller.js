import PaySupplier from "../models/addpayment.model.js";
import Supplier from "../models/Supplier.model.js";
import Product from "../models/productlist.model.js";
import Expense from "../models/expense.model.js";
import HandCash from '../models/handcash.model..js';


export const createPayment = async (req, res) => {
    try {
        const { supplier, products, paidAmount, totalAmount, paymentMethod, invoiceNumber, notes } = req.body;

        // Fetch supplier data
        const supplierData = await Supplier.findById(supplier);
        if (!supplierData) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        let dueAmount = totalAmount - paidAmount;
        let paymentStatus = dueAmount <= 0 ? "Paid" : "Pending";

        // Format products with description
        const formattedProducts = products.map(item => ({
            product: item.product,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            description: item.description // Include description
        }));

        const payment = new PaySupplier({
            supplier,
            products: formattedProducts, // Store formatted products
            totalAmount,
            paidAmount,
            dueAmount,
            paymentMethod,
            invoiceNumber,
            notes,
            status: paymentStatus
        });

        await payment.save();

        // Update product quantities
        for (const item of products) {
            const product = await Product.findById(item.product);
            if (product) {
                product.purchasePrice = item.unitPrice;
                product.sellPrice = item.sellPrice;
                product.totalQuantity += item.quantity;
                await product.save();
            }
        }

        // Deduct from hand cash and record as a withdrawal
        const today = new Date().toISOString().split('T')[0];
        let handCash = await HandCash.findOne({ date: today });

        if (!handCash) {
            return res.status(400).json({ message: "No hand cash record found for today" });
        }

        if (handCash.closingBalance < paidAmount) {
            return res.status(400).json({ message: "Insufficient hand cash balance" });
        }

        // Deduct the payment amount
        handCash.closingBalance -= paidAmount;

        // Record the withdrawal with a note
        handCash.withdrawals.push({
            amount: paidAmount,
            reason: `Payment to Supplier: Invoice #${invoiceNumber}`,
            date: new Date()
        });

        handCash.withdrawalCount += 1;
        await handCash.save();

        // Update supplier due amount
        supplierData.dueAmount -= paidAmount;
        if (supplierData.dueAmount < 0) supplierData.dueAmount = 0;
        await supplierData.save();

        res.status(201).json({
            message: "Payment successful",
            payment,
            updatedHandCash: handCash.closingBalance,
            withdrawalRecorded: true
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};





export const getPayments = async (req, res) => {
    try {
        const payments = await PaySupplier.find()
            .populate("supplier", "name")
            .populate("products.product", "name");
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const payment = await PaySupplier.findById(req.params.id)
            .populate("supplier", "name")
            .populate("products.product", "name");
        if (!payment) return res.status(404).json({ message: "Payment not found" });
        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePayment = async (req, res) => {
    try {
        const oldPayment = await PaySupplier.findById(req.params.id);
        if (!oldPayment) return res.status(404).json({ message: "Payment not found" });

        // Reverse old product quantities
        for (const oldItem of oldPayment.products) {
            const product = await Product.findById(oldItem.product);
            if (product) {
                product.totalQuantity -= oldItem.quantity;
                if (product.totalQuantity < 0) product.totalQuantity = 0;
                await product.save();
            }
        }

        // Get new payment details
        const { paidAmount, totalAmount } = req.body;
        let newDueAmount = totalAmount - paidAmount;
        let paymentStatus = newDueAmount <= 0 ? "Paid" : "Pending";

        // Calculate the amount newly paid towards due
        const newlyPaidAmount = paidAmount - oldPayment.paidAmount;

        // Update the payment record
        const updatedPayment = await PaySupplier.findByIdAndUpdate(
            req.params.id,
            { paidAmount, totalAmount, dueAmount: newDueAmount, status: paymentStatus },
            { new: true }
        );

        if (!updatedPayment) return res.status(404).json({ message: "Error updating payment" });

        // Update supplier's due amount
        const supplier = await Supplier.findById(updatedPayment.supplier);
        if (supplier) {
            supplier.dueAmount += oldPayment.dueAmount - updatedPayment.dueAmount;
            if (supplier.dueAmount < 0) supplier.dueAmount = 0;
            await supplier.save();
        }

        // If newly paid amount reduces due, deduct from hand cash & record withdrawal
        if (newlyPaidAmount > 0) {
            const today = new Date().toISOString().split('T')[0];
            let handCash = await HandCash.findOne({ date: today });

            if (!handCash) {
                return res.status(400).json({ message: "No hand cash record found for today" });
            }

            if (handCash.closingBalance < newlyPaidAmount) {
                return res.status(400).json({ message: "Insufficient hand cash balance" });
            }

            // Deduct the newly paid amount from hand cash and record withdrawal
            handCash.closingBalance -= newlyPaidAmount;
            handCash.withdrawals.push({
                amount: newlyPaidAmount,
                reason: `Supplier due Payment (Invoice #${updatedPayment.invoiceNumber})`,
                date: new Date()
            });
            handCash.withdrawalCount += 1;
            await handCash.save();

            // Add to expenses
            const expense = new Expense({
                expenseDate: new Date(),
                expenseCategory: "Supplier Payment",
                expenseAmount: newlyPaidAmount,
                expenseNote: `Payment for Invoice #${updatedPayment.invoiceNumber}`
            });
            await expense.save();
        }

        res.status(200).json({
            ...updatedPayment.toObject(),
            dueAmount: newDueAmount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};





export const deletePayment = async (req, res) => {
    try {
        const payment = await PaySupplier.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: "Payment not found" });

        // Restore quantities of products in `totalQuantity` when payment is deleted
        for (const item of payment.products) {
            const product = await Product.findById(item.product);
            if (product) {
                product.totalQuantity -= item.quantity;  // Subtract the quantity
                if (product.totalQuantity < 0) product.totalQuantity = 0;
                await product.save();
            }
        }

        // Restore supplier due amount
        const supplier = await Supplier.findById(payment.supplier);
        if (supplier) {
            supplier.dueAmount += payment.dueAmount;
            await supplier.save();
        }

        await PaySupplier.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Payment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
