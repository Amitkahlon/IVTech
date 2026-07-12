import { Router } from 'express';
import { User } from '../models';
import { hashPassword } from '../utils/hash';
import { generateToken } from '../services/authService';
import { requireAuth } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'username and password are required' });
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

authRouter.get('/userinfo', requireAuth, async (req, res) => {
  const user = await User.findById(req.user!.sub).select('-passwordHash');
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user });
});
