const express = require('express');
const { db, docToObj } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function slugify(text) {
  const s = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s || `post-${Date.now()}`;
}

async function uniqueSlug(base, excludeId = null) {
  let slug = base, i = 1;
  while (true) {
    const snap = await db().collection('posts').where('slug', '==', slug).limit(1).get();
    const conflict = snap.docs.find(d => d.id !== excludeId);
    if (!conflict) return slug;
    slug = `${base}-${i++}`;
  }
}

// List posts
router.get('/', authenticate, async (req, res) => {
  const { type = 'post', status, search } = req.query;
  let q = db().collection('posts').where('type', '==', type);
  if (status) q = q.where('status', '==', status);
  const snap = await q.orderBy('updated_at', 'desc').get();
  let rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (search) rows = rows.filter(r => r.title?.toLowerCase().includes(search.toLowerCase()));
  res.json(rows);
});

// Get single post
router.get('/:id', authenticate, async (req, res) => {
  const doc = await db().collection('posts').doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'Not found' });
  res.json({ id: doc.id, ...doc.data() });
});

// Create post
router.post('/', authenticate, async (req, res) => {
  const { title, content = '', excerpt = '', type = 'post', status = 'draft', featured_image = '' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const slug = await uniqueSlug(slugify(title));
  const now = new Date().toISOString();
  const data = {
    title, slug, content, excerpt, type, status, featured_image,
    created_at: now, updated_at: now,
    published_at: status === 'published' ? now : null,
  };
  const ref = await db().collection('posts').add(data);
  res.status(201).json({ id: ref.id, slug });
});

// Update post
router.put('/:id', authenticate, async (req, res) => {
  const { title, content, excerpt, status, featured_image } = req.body;
  const doc = await db().collection('posts').doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'Not found' });

  const existing = doc.data();
  const now = new Date().toISOString();
  const update = {
    updated_at: now,
    ...(title !== undefined && { title }),
    ...(content !== undefined && { content }),
    ...(excerpt !== undefined && { excerpt }),
    ...(status !== undefined && { status }),
    ...(featured_image !== undefined && { featured_image }),
    slug: existing.slug,
    published_at: status === 'published' && existing.status !== 'published' ? now : (existing.published_at || null),
  };

  await db().collection('posts').doc(req.params.id).update(update);
  res.json({ id: req.params.id, slug: existing.slug });
});

// Delete post
router.delete('/:id', authenticate, async (req, res) => {
  const doc = await db().collection('posts').doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'Not found' });
  await db().collection('posts').doc(req.params.id).delete();
  res.json({ message: 'Deleted' });
});

module.exports = router;
