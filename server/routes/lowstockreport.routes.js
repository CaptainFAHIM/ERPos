import express from 'express';
import { getLowStockProducts } from "../controllers/lowstockreport.controller.js";

const router = express.Router();

// Route to get products with low stock
router.get('/low-stock', getLowStockProducts);

export default router;
