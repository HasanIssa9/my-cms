const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const authRoutes    = require('./routes/auth');
const postsRoutes   = require('./routes/posts');
const settingsRoutes = require('./routes/settings');
const mediaRoutes   = require('./routes/media');
const publicRoutes  = require('./routes/public');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth',     authRoutes);
app.use('/api/posts',    postsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/media',    mediaRoutes);
app.get('/api/health',   (req, res) => res.json({ ok: true }));

// Public page renderer
app.use('/', publicRoutes);

exports.api = functions
  .runWith({ memory: '512MB', timeoutSeconds: 60 })
  .https.onRequest(app);
