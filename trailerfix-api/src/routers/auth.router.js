import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import authenticate from '../middlewares/authenticate.js';
import { validateLogin, validateRegister } from '../middlewares/validateAuth.js';

const router = Router();

router.post('/register', validateRegister, asyncHandler(authController.register));
router.post('/login', validateLogin, asyncHandler(authController.login));
router.get('/me', asyncHandler(authenticate), asyncHandler(authController.me));

export default router;
