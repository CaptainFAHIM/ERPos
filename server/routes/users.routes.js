import express from 'express';
import { addUser, loginUser, getUsers, getUserById, updateUser, deleteUser } from '../controllers/users.controller.js';

const router = express.Router();

router.post('/add', addUser); // Add user
router.post('/login', loginUser); // Login user
router.get('/', getUsers); // Get all users
router.get('/:id', getUserById); // Get user by ID
router.put('/:id', updateUser); // Update user
router.delete('/:id', deleteUser); // Delete user by ID

export default router;
