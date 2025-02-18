import express from 'express';
import { getSummaryReport } from '../controllers/summary.controller.js';

const router = express.Router();

// Route to get the Summary Report
router.get('/', getSummaryReport);

export default router;
