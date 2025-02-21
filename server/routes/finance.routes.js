import express from "express";
import { getRevenue, getNetProfit, getGrossProfit, getProfit } from "../controllers/finance.controller.js";

const router = express.Router();

router.get("/revenue", getRevenue);
router.get("/gross-profit", getGrossProfit);
router.get("/net-profit", getNetProfit);
router.get("/profit", getProfit); 

export default router;

