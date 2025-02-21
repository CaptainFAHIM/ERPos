import express from "express";
import {
  createStockIn,
  getAllStockIn,
  getStockInById,
  updateStockIn,
  deleteStockIn,
} from "../controllers/stockin.controllers.js";

const router = express.Router();

// Get all stock-in entries
router.get("/", getAllStockIn);

// Get stock-in entry by ID
router.get("/:id", getStockInById);

// Create a new stock-in entry
router.post("/", createStockIn);

// Update stock-in entry
router.put("/:id", updateStockIn);

// Delete stock-in entry
router.delete("/:id", deleteStockIn);

export default router;
