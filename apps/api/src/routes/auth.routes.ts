import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import {
  register, login, refreshToken, logout, getMe,
  forgotPassword, resetPassword, socialLogin,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register',
  [
    body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  ],
  validate,
  register
);

router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  login
);

router.post('/social', socialLogin);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', [body('email').isEmail()], validate, forgotPassword);
router.post('/reset-password',
  [body('token').notEmpty(), body('password').isLength({ min: 8 })],
  validate,
  resetPassword
);

export default router;
