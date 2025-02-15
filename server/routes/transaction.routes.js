import express from 'express';
import { createTransaction } from '../controllers/transaction.controller.js';

const router = express.Router();

router.post('/', createTransaction); // Process transaction

export default router;