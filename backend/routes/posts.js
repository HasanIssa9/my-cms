const express = require('express');
const { run, get, all } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function slugify(text) {
  const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  // Fallback for non-Latin titles (Arabic, Chinese, etc.)
  return slug || `post-${Date.now()}`;
}

async function uniqueSlug(base, excludeId = null) {
  let slug = base, i = 1;
  while (true) {
    const row = excludeId
      ? await get('SELECT id FROM posts WHERE slug = ? AND id != ?', [slug, excludeId])
      : await get('SELECT id FROM posts WHERE slug = ?', [slug]);
    if (!row) return slug;
    slug = `${base}-${i++}`;
  }
}

router.get('/', authenticate, async (req, res) => {
  const { type = 'post', status, search } = req.query;
  let query = 'SELECT id, title, slug, type, status, featured_image, created_at, updated_at, published_at FROM posts WHERE type = ?';
  const params = [type];
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (search) { query += ' AND title LIKE ?'; params.push(`%${search}%`); }
  query += ' ORDER BY updated_at DESC';
  res.json(await all(query, params));
});

router.get('/:id', authenticate, async (req, res) => {
  const post = await get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json(post);
});

router.post('/', authenticate, async (req, res) => {
  const { title, content = '', excerpt = '', type = 'post', status = 'draft', featured_image = '' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const slug = await uniqueSlug(slugify(title));
  const published_at = status === 'published' ? new Date().toISOString() : null;
  const result = await run(
    'INSERT INTO posts (title, slug, content, excerpt, type, status, featured_image, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [title, slug, content, excerpt, type, status, featured_image, published_at]
  );
  res.status(201).json({ id: result.lastID, slug });
});

router.put('/:id', authenticate, async (req, res) => {
  const { title, content, excerpt, status, featured_image } = req.body;
  const existing = await get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const slug = existing.slug;
  const published_at = status === 'published' && existing.status !== 'published'
    ? new Date().toISOString() : existing.published_at;

  await run(`
    UPDATE posts SET
      title = COALESCE(?, title),
      slug = ?,
      content = COALESCE(?, content),
      excerpt = COALESCE(?, excerpt),
      status = COALESCE(?, status),
      featured_image = COALESCE(?, featured_image),
      published_at = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [title, slug, content, excerpt, status, featured_image, published_at, req.params.id]
  );
  res.json({ id: Number(req.params.id), slug });
});

router.delete('/:id', authenticate, async (req, res) => {
  const result = await run('DELETE FROM posts WHERE id = ?', [req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
