const express = require('express');
const { run, all } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const rows = await all('SELECT key, value FROM settings');
  res.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
});

router.put('/', authenticate, async (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    await run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);
  }
  res.json({ message: 'Settings saved' });
});

module.exports = router;
