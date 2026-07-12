import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { User } from '../models';
import { hashPassword } from '../utils/hash';
import { generateToken } from '../services/authService';
import { requireAuth } from '../middleware/auth';
import { USERNAME_MAX_LENGTH, PASSWORD_MAX_LENGTH } from '../utils/validation';

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

authRouter.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'username and password are required' });
    return;
  }

  if (username.length === 0 || username.length > USERNAME_MAX_LENGTH) {
    res.status(400).json({ error: `username must be 1-${USERNAME_MAX_LENGTH} characters` });
    return;
  }

  if (password.length === 0 || password.length > PASSWORD_MAX_LENGTH) {
    res.status(400).json({ error: `password must be 1-${PASSWORD_MAX_LENGTH} characters` });
    return;
  }

  const user = await User.findOne({ username });
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const token = generateToken(user);
  res.json({ token, expiresIn: '1h' });
});

authRouter.get('/userInfo', requireAuth, async (req, res) => {
  const user = await User.findById(req.user!.sub).select('-passwordHash');
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user });
});
