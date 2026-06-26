const express = require('express');
const { db } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const doc = await db().collection('settings').doc('config').get();
  res.json(doc.exists ? doc.data() : {});
});

router.put('/', authenticate, async (req, res) => {
  await db().collection('settings').doc('config').set(req.body, { merge: true });
  res.json({ message: 'Settings saved' });
});

module.exports = router;
