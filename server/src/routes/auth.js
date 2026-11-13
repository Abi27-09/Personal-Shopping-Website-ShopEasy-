import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const safeUser = u => ({ id: u._id, name: u.name, email: u.email, role: u.role });
function tokenFor(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '2h' });
}
router.post('/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8)
      return res.status(400).json({ message: 'Enter a name, valid email, and password of at least 8 characters.' });
    if (await User.findOne({ email })) return res.status(409).json({ message: 'Email is already registered.' });
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: tokenFor(user), user: safeUser(user) });
  } catch { res.status(500).json({ message: 'Could not register account.' }); }
});
router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ message: 'Incorrect email or password.' });
  res.json({ token: tokenFor(user), user: safeUser(user) });
});
router.get('/me', requireAuth, (req, res) => res.json({ user: safeUser(req.user) }));
export default router;
