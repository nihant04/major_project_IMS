import express from 'express';
import { getAllUsers, getUserById, createUser, deleteUser, getStudents, getTeachers, updateUserProfile, updateUserPassword } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getAllUsers);
router.get('/students', protect, getStudents);
router.get('/teachers', protect, getTeachers);
router.get('/:id', protect, getUserById);
router.post('/', protect, admin, createUser);
router.delete('/:id', protect, admin, deleteUser);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);
router.put('/change-password', protect, updateUserPassword);

export default router;
