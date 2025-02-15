import StoreSettings from "../models/storeSettings.model.js";
import mongoose from "mongoose";

// ✅ Create Store Settings (Only if none exist)
export const createStoreSettings = async (req, res) => {
  try {
    const { storeName, address, phoneNumbers, emails, invoiceFormats, cashMemoFormats } = req.body;

    const existingSettings = await StoreSettings.findOne();
    if (existingSettings) {
      return res.status(400).json({ message: "Store settings already exist. Use update instead." });
    }

    const newSettings = new StoreSettings({ storeName, address, phoneNumbers, emails, invoiceFormats, cashMemoFormats });
    await newSettings.save();

    res.status(201).json({ message: "Store settings created successfully", newSettings });
  } catch (error) {
    res.status(500).json({ message: "Error creating store settings", error });
  }
};

// ✅ Get Store Settings (Only One Document Allowed)
export const getStoreSettings = async (req, res) => {
  try {
    const storeSettings = await StoreSettings.findOne();
    if (!storeSettings) return res.status(404).json({ message: "Store settings not found" });

    res.status(200).json(storeSettings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching store settings", error });
  }
};

// ✅ Update Store Settings (Only One Allowed)
export const updateStoreSettings = async (req, res) => {
  try {
    const { storeName, address, phoneNumbers, emails, invoiceFormats, cashMemoFormats } = req.body;

    const existingSettings = await StoreSettings.findOne();
    if (!existingSettings) {
      return res.status(404).json({ message: "Store settings not found. Create first." });
    }

    // Update the existing settings
    const updatedSettings = await StoreSettings.findByIdAndUpdate(
      existingSettings._id,
      { storeName, address, phoneNumbers, emails, invoiceFormats, cashMemoFormats },
      { new: true }
    );

    res.status(200).json({ message: "Store settings updated successfully", updatedSettings });
  } catch (error) {
    res.status(500).json({ message: "Error updating store settings", error });
  }
};

// ✅ Delete Store Settings (Only One Allowed)
export const deleteStoreSettings = async (req, res) => {
  try {
    const storeSettings = await StoreSettings.findOne();
    if (!storeSettings) return res.status(404).json({ message: "Store settings not found" });

    await StoreSettings.findByIdAndDelete(storeSettings._id);
    res.status(200).json({ message: "Store settings deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting store settings", error });
  }
};
