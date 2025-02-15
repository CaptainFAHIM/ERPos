import DamageProduct from "../models/damageproduct.model.js";
import mongoose from "mongoose";

// ✅ Create a new damaged product entry
export const createDamageProduct = async (req, res) => {
  try {
    const { barcode, product, category, brand, price, quantity, reason } = req.body;

    const damageProduct = new DamageProduct({ barcode, product, category, brand, price, quantity, reason });
    await damageProduct.save();

    res.status(201).json({ message: "Damage Product entry added successfully", damageProduct });
  } catch (error) {
    res.status(500).json({ message: "Error adding Damage Product entry", error });
  }
};

// ✅ Get all damaged products
export const getAllDamageProducts = async (req, res) => {
  try {
    const damageProducts = await DamageProduct.find();
    res.status(200).json(damageProducts);
  } catch (error) {
    console.error("Error fetching Damage Products:", error);
    res.status(500).json({ message: "Error fetching Damage Products", error });
  }
};

// ✅ Get a damaged product by ID
export const getDamageProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Damage Product ID format" });
    }

    const damageProduct = await DamageProduct.findById(id);
    if (!damageProduct) return res.status(404).json({ message: "Damage Product not found" });

    res.status(200).json(damageProduct);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Damage Product", error });
  }
};

// ✅ Update a damaged product entry
export const updateDamageProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { barcode, product, category, brand, price, quantity, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Damage Product ID format" });
    }

    const damageProduct = await DamageProduct.findByIdAndUpdate(
      id,
      { barcode, product, category, brand, price, quantity, reason },
      { new: true }
    );

    if (!damageProduct) return res.status(404).json({ message: "Damage Product not found" });

    res.status(200).json({ message: "Damage Product entry updated successfully", damageProduct });
  } catch (error) {
    res.status(500).json({ message: "Error updating Damage Product entry", error });
  }
};

// ✅ Delete a damaged product entry
export const deleteDamageProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Damage Product ID format" });
    }

    const damageProduct = await DamageProduct.findByIdAndDelete(id);
    if (!damageProduct) return res.status(404).json({ message: "Damage Product not found" });

    res.status(200).json({ message: "Damage Product entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Damage Product entry", error });
  }
};
