import express from "express";
import {
  createStoreSettings,
  getStoreSettings,
  updateStoreSettings,
  deleteStoreSettings
} from "../controllers/storeSettings.controller.js";

const router = express.Router();

router.post("/", createStoreSettings); // ✅ Create Store Settings
router.get("/", getStoreSettings); // ✅ Get Store Settings
router.put("/", updateStoreSettings); // ✅ Update Store Settings
router.delete("/", deleteStoreSettings); // ✅ Delete Store Settings

export default router;
