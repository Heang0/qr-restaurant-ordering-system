import express from 'express';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { requireRole, requireStoreOwnership } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Public read access for customers
router.get('/', getMenuItems);

// Protected write access for admins/superadmins
router.post('/', authenticateJWT, requireRole(['admin', 'superadmin']), requireStoreOwnership, createMenuItem);
router.put('/:id', authenticateJWT, requireRole(['admin', 'superadmin']), updateMenuItem); // Ownership verified in controller if needed
router.delete('/:id', authenticateJWT, requireRole(['admin', 'superadmin']), deleteMenuItem); // Ownership verified in controller if needed

export default router;
