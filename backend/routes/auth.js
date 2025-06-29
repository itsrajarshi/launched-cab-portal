const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const supabase = require('../supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

console.log("Auth route loaded");

// Register
router.post('/register', async (req, res) => {
  const { email, password, role, name } = req.body;
  if (!email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
  // Check if user exists
  const { data: existing, error: findErr } = await supabase.from('users').select('id').eq('email', email).single();
  if (findErr && findErr.code !== 'PGRST116') return res.status(500).json({ error: findErr.message });
  if (existing) return res.status(409).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from('users').insert([{ email, password: hash, role, name }]).select('*');
  if (error) return res.status(500).json({ error: error.message });
  const user = data[0];
  const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { email: user.email, role: user.role, name: user.name } });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
  if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { email: user.email, role: user.role, name: user.name } });
});

module.exports = router;
