import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, required: true },
    address: { type: String, required: true },
    phoneNumbers: { type: [String], required: true }, // Multiple phone numbers allowed
    emails: { type: [String], required: true }, // Multiple emails allowed
    invoiceFormats: { type: [String], default: [] }, // Multiple invoice formats allowed
    cashMemoFormats: { type: [String], default: [] } // Multiple cash memo formats allowed
  },
  { timestamps: true }
);

// Ensure only one store settings document exists
const StoreSettings = mongoose.models.StoreSettings || mongoose.model("StoreSettings", storeSettingsSchema);

export default StoreSettings;
