const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDB } = require('./db/database');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const mediaRoutes = require('./routes/media');
const settingsRoutes = require('./routes/settings');
const publicRoutes = require('./routes/public');

const app = express();
const PORT = process.env.PORT || 3001;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

initDB();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Public site (must be last)
app.use('/', publicRoutes);

app.listen(PORT, () => {
  console.log(`\n CMS Server running:`);
  console.log(`   Public site: http://localhost:${PORT}`);
  console.log(`   Admin panel: http://localhost:5173\n`);
  console.log(`   Default login: admin / admin123\n`);
});
