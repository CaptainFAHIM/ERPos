import express from "express";
import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
} from "../controllers/supplier.controllers.js";

const router = express.Router();

router.post("/", createSupplier); // Create supplier
router.get("/", getAllSuppliers); // Get all suppliers
router.get("/:id", getSupplierById); // Get single supplier
router.put("/:id", updateSupplier); // Update supplier
router.delete("/:id", deleteSupplier); // Delete supplier

export default router;
