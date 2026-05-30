import express from 'express';
import { login, completeRegistration } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/', login); // Fallback for plain /api/auth calls

// SaaS Registration endpoints
router.post('/complete-registration', completeRegistration);

export default router;
