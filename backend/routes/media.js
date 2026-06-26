const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { run, get, all } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, /jpeg|jpg|png|gif|webp|svg|pdf|mp4|mov/.test(file.mimetype));
  },
});

router.get('/', authenticate, async (req, res) => {
  res.json(await all('SELECT * FROM media ORDER BY created_at DESC'));
});

router.post('/upload', authenticate, upload.array('files', 20), async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

  const uploaded = [];
  for (const file of req.files) {
    const url = `/uploads/${file.filename}`;
    await run(
      'INSERT INTO media (filename, original_name, mimetype, size, url) VALUES (?, ?, ?, ?, ?)',
      [file.filename, file.originalname, file.mimetype, file.size, url]
    );
    uploaded.push({ filename: file.filename, original_name: file.originalname, url, mimetype: file.mimetype, size: file.size });
  }
  res.json(uploaded);
});

router.delete('/:id', authenticate, async (req, res) => {
  const file = await get('SELECT * FROM media WHERE id = ?', [req.params.id]);
  if (!file) return res.status(404).json({ error: 'Not found' });

  const filePath = path.join(__dirname, '..', 'uploads', file.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await run('DELETE FROM media WHERE id = ?', [req.params.id]);
  res.json({ message: 'Deleted' });
});

module.exports = router;
