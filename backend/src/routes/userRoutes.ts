import express from 'express';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Any authenticated user can read their own profile
router.get('/:id', authenticateJWT, getUser);

// SuperAdmin only: list all users, create, delete
router.get('/', authenticateJWT, requireRole(['superadmin']), getUsers);
router.post('/', authenticateJWT, requireRole(['superadmin']), createUser);
router.delete('/:id', authenticateJWT, requireRole(['superadmin']), deleteUser);

// Any authenticated user can update their own profile (e.g. profile photo, name)
// SuperAdmin can update any user (e.g. password reset)
router.put('/:id', authenticateJWT, updateUser);

export default router;

