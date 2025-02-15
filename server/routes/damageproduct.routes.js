import express from "express";
import {
  createDamageProduct,
  getAllDamageProducts,
  getDamageProductById,
  updateDamageProduct,
  deleteDamageProduct
} from "../controllers/damageproduct.controller.js";

const router = express.Router();

router.post("/", createDamageProduct); // Create a damaged product entry
router.get("/", getAllDamageProducts); // Get all damaged products
router.get("/:id", getDamageProductById); // Get single damaged product entry
router.put("/:id", updateDamageProduct); // Update damaged product entry
router.delete("/:id", deleteDamageProduct); // Delete damaged product entry

export default router;
