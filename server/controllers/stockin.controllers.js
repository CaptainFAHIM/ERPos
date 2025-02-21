import StockIn from "../models/stockin.model.js";
import Product from "../models/productlist.model.js";
import mongoose from "mongoose"; 

// Get all stock-in entries
export const getAllStockIn = async (req, res) => {
  try {
    const stockInEntries = await StockIn.find().sort({ createdAt: -1 }); 
    res.status(200).json(stockInEntries);
  } catch (error) {
    console.error("Error fetching Stock In entries:", error);
    res.status(500).json({ message: "Error fetching Stock In entries", error });
  }
};

// Create a new stock-in entry and update product quantity
export const createStockIn = async (req, res) => {
  try {
    const { referenceNo, supplier, stockInBy, stockInDate, contactPerson, address, productName, barcode, quantity } = req.body;

    const product = await Product.findOne({ barcode });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const stockIn = new StockIn({ referenceNo, supplier, stockInBy, stockInDate, contactPerson, address, productName, barcode, quantity });
    await stockIn.save();

    product.totalQuantity += quantity;
    await product.save();

    res.status(201).json({ message: "Stock In entry added successfully", stockIn });
  } catch (error) {
    res.status(500).json({ message: "Error adding Stock In entry", error });
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

// Update stock-in entry and adjust product quantity
export const updateStockIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { referenceNo, supplier, stockInBy, stockInDate, contactPerson, address, productName, barcode, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Stock In ID format" });
    }

    const stockIn = await StockIn.findById(id);
    if (!stockIn) return res.status(404).json({ message: "Stock In entry not found" });

    const product = await Product.findOne({ barcode });
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Calculate quantity difference
    const quantityDifference = quantity - stockIn.quantity;

    stockIn.referenceNo = referenceNo;
    stockIn.supplier = supplier;
    stockIn.stockInBy = stockInBy;
    stockIn.stockInDate = stockInDate;
    stockIn.contactPerson = contactPerson;
    stockIn.address = address;
    stockIn.productName = productName;
    stockIn.barcode = barcode;
    stockIn.quantity = quantity;
    await stockIn.save();

    // Adjust product quantity
    product.totalQuantity += quantityDifference;
    await product.save();

    res.status(200).json({ message: "Stock In entry updated successfully", stockIn });
  } catch (error) {
    res.status(500).json({ message: "Error updating Stock In entry", error });
  }
};

// Delete stock-in entry and subtract product quantity
export const deleteStockIn = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Stock In ID format" });
    }

    const stockIn = await StockIn.findById(id);
    if (!stockIn) return res.status(404).json({ message: "Stock In entry not found" });

    const product = await Product.findOne({ barcode: stockIn.barcode });
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.totalQuantity -= stockIn.quantity;
    if (product.totalQuantity < 0) product.totalQuantity = 0;
    await product.save();

    await stockIn.deleteOne();

    res.status(200).json({ message: "Stock In entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Stock In entry", error });
  }
};
