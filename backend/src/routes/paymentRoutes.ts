import { Router } from 'express';
import { generateKHQR, verifyKHQR, generatePlanKhqr, verifyPlanKhqr } from '../controllers/paymentController.js';

const router = Router();

router.post('/generate-khqr', generateKHQR);
router.post('/verify-khqr', verifyKHQR);
router.post('/generate-plan-khqr', generatePlanKhqr);
router.post('/verify-plan-khqr', verifyPlanKhqr);

export default router;
