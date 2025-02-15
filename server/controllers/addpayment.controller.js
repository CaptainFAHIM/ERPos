import PaySupplier from "../models/addpayment.model.js";
import Supplier from "../models/Supplier.model.js";

export const createPayment = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.body.supplier);
        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        const payment = new PaySupplier(req.body);

        // ✅ Check if supplier has any due amount and set status accordingly
        const paymentStatus = supplier.dueAmount <= 0 ? "Paid" : "Pending";
        payment.status = paymentStatus;

        await payment.save();

        // ✅ Correctly update supplier's due amount (subtract payment)
        supplier.dueAmount -= payment.dueAmount;
        if (supplier.dueAmount < 0) supplier.dueAmount = 0; // Ensure dueAmount doesn't go negative
        await supplier.save();

        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getPayments = async (req, res) => {
    try {
        const payments = await PaySupplier.find().populate("supplier", "name");
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const payment = await PaySupplier.findById(req.params.id).populate("supplier", "name");
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

        const updatedPayment = await PaySupplier.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedPayment) {
            return res.status(404).json({ message: "Error updating payment" });
        }

        // ✅ Correct supplier dueAmount calculation
        const supplier = await Supplier.findById(updatedPayment.supplier);
        if (supplier) {
            // Update dueAmount based on the difference between old and new payment amounts
            supplier.dueAmount += oldPayment.dueAmount - updatedPayment.dueAmount;
            if (supplier.dueAmount < 0) supplier.dueAmount = 0; // Ensure dueAmount doesn't go negative
            await supplier.save();
        }

        // ✅ Update status based on dueAmount after payment update
        const paymentStatus = supplier.dueAmount <= 0 ? "Paid" : "Pending";
        updatedPayment.status = paymentStatus;
        await updatedPayment.save();

        res.status(200).json(updatedPayment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePayment = async (req, res) => {
    try {
        const payment = await PaySupplier.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: "Payment not found" });

        const supplier = await Supplier.findById(payment.supplier);
        if (supplier) {
            supplier.dueAmount += payment.dueAmount; // ✅ Restore the dueAmount
            await supplier.save();
        }

        await PaySupplier.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Payment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
