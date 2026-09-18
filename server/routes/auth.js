import express from 'express';
import bcrypt from 'bcryptjs';
import { db, publicUser } from '../db.js';
import { signToken, authRequired } from '../auth.js';

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password || !role) {
    return res.status(422).json({ message: 'Name, email, password and role are required' });
  }
  if (!['doctor', 'patient'].includes(role)) {
    return res.status(422).json({ message: 'Role must be doctor or patient' });
  }
  if (String(password).length < 8) {
    return res.status(422).json({ message: 'Password must be at least 8 characters' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(422).json({ message: 'Email already taken' });

  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare(
      'INSERT INTO users (name, email, password, role, avatar, details) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(
      name, email, hash, role, '/placeholder.svg',
      role === 'doctor' ? 'New Doctor' : 'New Patient'
    );
  const user = publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid));
  const token = signToken(user);
  res.status(201).json({ token, user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(422).json({ message: 'Email and password are required' });
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row || !bcrypt.compareSync(password, row.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const user = publicUser(row);
  const token = signToken(user);
  res.json({ token, user });
});

router.get('/user', authRequired, (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.auth.id);
  if (!row) return res.status(401).json({ message: 'User not found' });
  res.json(publicUser(row));
});

router.post('/logout', authRequired, (_req, res) => {
  // JWT is stateless — client just discards the token
  res.json({ message: 'Logged out' });
});

export default router;
