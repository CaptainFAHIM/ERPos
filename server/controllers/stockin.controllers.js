import StockIn from "../models/stockin.model.js";
import Product from "../models/productlist.model.js"; // Import Product model
import mongoose from "mongoose";

// Create a new stock-in entry
export const createStockIn = async (req, res) => {
  try {
    const { referenceNo, supplier, stockInBy, stockInDate, contactPerson, address, productName, barcode, quantity } = req.body;

    // Create a new StockIn entry
    const stockIn = new StockIn({ referenceNo, supplier, stockInBy, stockInDate, contactPerson, address, productName, barcode, quantity });
    await stockIn.save();

    // Update the Product quantity
    const product = await Product.findOne({ barcode });
    if (product) {
      product.totalQuantity += quantity;
      await product.save();
    } else {
      return res.status(404).json({ message: "Product not found" });
    }

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

// Get stock-in entry by ID
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
    const { referenceNo, supplier, stockInBy, stockInDate, contactPerson, address, productName, barcode } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Stock In ID format" });
    }

    const stockIn = await StockIn.findById(id);
    if (!stockIn) return res.status(404).json({ message: "Stock In entry not found" });

    // Calculate the quantity difference based on the stock-in quantity that is being updated
    const quantityDifference = req.body.quantity - stockIn.quantity;
    
    // Update the StockIn entry
    stockIn.referenceNo = referenceNo;
    stockIn.supplier = supplier;
    stockIn.stockInBy = stockInBy;
    stockIn.stockInDate = stockInDate;
    stockIn.contactPerson = contactPerson;
    stockIn.address = address;
    stockIn.productName = productName;
    stockIn.barcode = barcode;

    // Save updated stock-in entry
    await stockIn.save();

    // Update the Product quantity based on the quantity difference
    const product = await Product.findOne({ barcode });
    if (product) {
      product.totalQuantity += quantityDifference;
      await product.save();
    } else {
      return res.status(404).json({ message: "Product not found" });
    }

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

    // Update the Product quantity when a stock-in entry is deleted
    const product = await Product.findOne({ barcode: stockIn.barcode });
    if (product) {
      product.totalQuantity -= stockIn.quantity;
      await product.save();
    } else {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Stock In entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Stock In entry", error });
  }
};
