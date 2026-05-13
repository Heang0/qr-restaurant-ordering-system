import express from 'express';
import { getOrders, createOrder, updateOrder, deleteOrder, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getOrders);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;
