const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { db, storage } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, /jpeg|jpg|png|gif|webp|svg|pdf|mp4|mov/.test(file.mimetype));
  },
});

router.get('/', authenticate, async (req, res) => {
  const snap = await db().collection('media').orderBy('created_at', 'desc').get();
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});

router.post('/upload', authenticate, upload.array('files', 20), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });

  const uploaded = [];
  const bucket = storage();

  for (const file of req.files) {
    const ext = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const blob = bucket.file(`uploads/${filename}`);

    await blob.save(file.buffer, {
      metadata: { contentType: file.mimetype },
      public: true,
    });

    const url = `https://storage.googleapis.com/${bucket.name}/uploads/${filename}`;
    const now = new Date().toISOString();
    const data = { filename, original_name: file.originalname, mimetype: file.mimetype, size: file.size, url, created_at: now };
    const ref = await db().collection('media').add(data);
    uploaded.push({ id: ref.id, ...data });
  }

  res.json(uploaded);
});

router.delete('/:id', authenticate, async (req, res) => {
  const doc = await db().collection('media').doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'Not found' });

  const { filename } = doc.data();
  try { await storage().file(`uploads/${filename}`).delete(); } catch {}
  await db().collection('media').doc(req.params.id).delete();
  res.json({ message: 'Deleted' });
});

module.exports = router;
