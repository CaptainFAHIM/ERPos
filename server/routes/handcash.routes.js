import express from 'express';
import { updateHandCash, getHandCashByDate, getAllHandCash } from '../controllers/handcash.controller.js';

const router = express.Router();


router.post('/update', updateHandCash); // Update or insert hand cash
router.get('/:date', getHandCashByDate); // Get hand cash for a specific date
router.get('/', getAllHandCash); // Get all hand cash records

export default router;
