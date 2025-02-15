import StockIn from "../models/stockin.model.js";
import mongoose from "mongoose";

// Create a new stock-in entry
export const createStockIn = async (req, res) => {
  try {
    const { referenceNo, supplier, stockInBy, stockInDate, contactPerson, address, productName, barcode, quantity } = req.body;

    const stockIn = new StockIn({ referenceNo, supplier, stockInBy, stockInDate, contactPerson, address, productName, barcode, quantity });
    await stockIn.save();

    res.status(201).json({ message: "Stock In entry added successfully", stockIn });
  } catch (error) {
    res.status(500).json({ message: "Error adding Stock In entry", error });
  }
};

// Get all stock-in entries
export const getAllStockIn = async (req, res) => {
  try {
    const stockInEntries = await StockIn.find();
    res.status(200).json(stockInEntries);
  } catch (error) {
    console.error("Error fetching Stock In entries:", error);
    res.status(500).json({ message: "Error fetching Stock In entries", error });
  }
};

//  Get stock-in entry by ID
export const getStockInById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Stock In ID format" });
    }

    const stockIn = await StockIn.findById(id);
    if (!stockIn) return res.status(404).json({ message: "Stock In entry not found" });

    res.status(200).json(stockIn);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Stock In entry", error });
  }
};

// Update stock-in entry
export const updateStockIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { referenceNo, supplier, stockInBy, stockInDate, contactPerson, address, productName, barcode, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Stock In ID format" });
    }

    const stockIn = await StockIn.findByIdAndUpdate(
      id,
      { referenceNo, supplier, stockInBy, stockInDate, contactPerson, address, productName, barcode, quantity },
      { new: true }
    );

    if (!stockIn) return res.status(404).json({ message: "Stock In entry not found" });

    res.status(200).json({ message: "Stock In entry updated successfully", stockIn });
  } catch (error) {
    res.status(500).json({ message: "Error updating Stock In entry", error });
  }
};

// Delete stock-in entry
export const deleteStockIn = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Stock In ID format" });
    }

    const stockIn = await StockIn.findByIdAndDelete(id);
    if (!stockIn) return res.status(404).json({ message: "Stock In entry not found" });

    res.status(200).json({ message: "Stock In entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Stock In entry", error });
  }
};
