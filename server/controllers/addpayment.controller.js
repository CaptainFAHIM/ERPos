import PaySupplier from "../models/addpayment.model.js";
import Supplier from "../models/Supplier.model.js";
import Product from "../models/productlist.model.js";
import Expense from "../models/expense.model.js";

export const createPayment = async (req, res) => {
    try {
        const { supplier, products, paidAmount, totalAmount, paymentMethod, invoiceNumber, notes } = req.body;

        const supplierData = await Supplier.findById(supplier);
        if (!supplierData) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        let dueAmount = totalAmount - paidAmount;
        let paymentStatus = dueAmount <= 0 ? "Paid" : "Pending";

        const payment = new PaySupplier({
            supplier,
            products,
            totalAmount,
            paidAmount,
            dueAmount,
            paymentMethod,
            invoiceNumber,
            notes,
            status: paymentStatus
        });

        await payment.save();

        // Update product quantities in the `totalQuantity` field
        for (const item of products) {
            const product = await Product.findById(item.product);
            if (product) {
                product.purchasePrice = item.unitPrice;
                product.sellPrice = item.sellPrice;
                product.totalQuantity += item.quantity;  // Update totalQuantity instead of quantity
                await product.save();
            }
        }

        // Record the expense if fully paid (no due amount)
        if (dueAmount <= 0) {
            const expense = new Expense({
                expenseDate: new Date(),
                expenseCategory: "Supplier Payment",
                expenseAmount: totalAmount,
                expenseNote: `Payment for Invoice #${invoiceNumber}`
            });
            await expense.save();
        }

        // Update supplier due amount
        supplierData.dueAmount -= dueAmount;
        if (supplierData.dueAmount < 0) supplierData.dueAmount = 0;
        await supplierData.save();

        res.status(201).json(payment);
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

        // Decrease the product quantities in the inventory based on the old payment
        for (const oldItem of oldPayment.products) {
            const product = await Product.findById(oldItem.product);
            if (product) {
                product.totalQuantity -= oldItem.quantity;
                if (product.totalQuantity < 0) product.totalQuantity = 0;
                await product.save();
            }
        }

        // Get updated fields (only for the payment, not products)
        const { paidAmount, totalAmount, products } = req.body;
        let dueAmount = totalAmount - paidAmount;
        let paymentStatus = dueAmount <= 0 ? "Paid" : "Pending";

        // Update the payment details (no product changes)
        const updatedPayment = await PaySupplier.findByIdAndUpdate(
            req.params.id,
            { paidAmount, totalAmount, dueAmount, status: paymentStatus },
            { new: true }
        );

        if (!updatedPayment) return res.status(404).json({ message: "Error updating payment" });

        // Recalculate the supplier's due amount after the payment update
        const supplier = await Supplier.findById(updatedPayment.supplier);
        if (supplier) {
            supplier.dueAmount += oldPayment.dueAmount - updatedPayment.dueAmount;
            if (supplier.dueAmount < 0) supplier.dueAmount = 0;
            await supplier.save();
        }

        // If the payment is fully paid (dueAmount is 0), add the total amount to the expense
        if (updatedPayment.dueAmount <= 0) {
            const expense = new Expense({
                expenseDate: new Date(),
                expenseCategory: "Supplier Payment",
                expenseAmount: updatedPayment.totalAmount,
                expenseNote: `Payment for Invoice #${updatedPayment.invoiceNumber}`
            });
            await expense.save();
        }

        // Return the updated payment information with the due amount
        res.status(200).json({
            ...updatedPayment.toObject(),
            dueAmount
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
