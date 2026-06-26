const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, snapToArr } = require('../db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const snap = await db().collection('users').where('username', '==', username).limit(1).get();
  if (snap.empty) return res.status(401).json({ error: 'Invalid credentials' });

  const user = { id: snap.docs[0].id, ...snap.docs[0].data() };
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: user.username });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ username: req.user.username });
});

router.put('/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const doc = await db().collection('users').doc(req.user.id).get();
  if (!doc.exists || !bcrypt.compareSync(currentPassword, doc.data().password)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  await db().collection('users').doc(req.user.id).update({ password: bcrypt.hashSync(newPassword, 10) });
  res.json({ message: 'Password updated' });
});

module.exports = router;
