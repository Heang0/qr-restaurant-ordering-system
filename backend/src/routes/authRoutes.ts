import express from 'express';
import { login } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/', login); // Fallback for plain /api/auth calls

export default router;
