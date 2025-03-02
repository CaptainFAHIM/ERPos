// routes/reportRoutes.js
import express from "express";
import {  getSalesData, getExpensesData, getDamagesData, getProfitData, getSummary } from "../controllers/report.controller.js";

const router = express.Router();

router.get("/sales/:type", getSalesData);
router.get("/expenses/:type", getExpensesData);
router.get("/damages/:type", getDamagesData);
router.get("/profit/:type", getProfitData);
router.get("/summary/:type", getSummary);

export default router;