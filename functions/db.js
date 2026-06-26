const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

let initialized = false;

function initAdmin() {
  if (!initialized) {
    admin.initializeApp();
    initialized = true;
  }
}

function db() {
  initAdmin();
  return admin.firestore();
}

function storage() {
  initAdmin();
  return admin.storage().bucket();
}

// ── Helpers to convert Firestore docs to plain objects ──────────────────────
function docToObj(doc) {
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

function snapToArr(snap) {
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Seed default data on first run ──────────────────────────────────────────
async function seedDefaults() {
  const fs = db();

  // Admin user
  const usersSnap = await fs.collection('users').limit(1).get();
  if (usersSnap.empty) {
    const hash = bcrypt.hashSync('admin123', 10);
    await fs.collection('users').doc('admin').set({
      username: 'admin',
      password: hash,
      created_at: new Date().toISOString(),
    });
  }

  // Default settings
  const settingsDoc = await fs.collection('settings').doc('config').get();
  if (!settingsDoc.exists) {
    await fs.collection('settings').doc('config').set({
      site_title: 'My CMS Site',
      site_tagline: '',
      site_theme: 'default',
      posts_per_page: '10',
      admin_email: '',
    });
  }
}

module.exports = { db, storage, docToObj, snapToArr, seedDefaults, initAdmin };
