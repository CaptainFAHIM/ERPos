import express from "express";
import { getRevenue, getNetProfit } from "../controllers/finance.controller.js";

const router = express.Router();

// Route to get revenue
router.get("/revenue", getRevenue);

// Route to get net profit
router.get("/net-profit", getNetProfit);

export default router;
