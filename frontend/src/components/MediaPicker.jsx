import { useState, useEffect } from 'react';
import api from '../api.js';

export default function MediaPicker({ onSelect, onClose }) {
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { api.get('/media').then(r => setMedia(r.data)); }, []);

  async function handleUpload(e) {
    const files = e.target.files;
    if (!files.length) return;
    setUploading(true);
    const fd = new FormData();
    for (const f of files) fd.append('files', f);
    const r = await api.post('/media/upload', fd);
    setMedia(prev => [...r.data.reverse(), ...prev]);
    setUploading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this file?')) return;
    await api.delete(`/media/${id}`);
    setMedia(prev => prev.filter(m => m.id !== id));
  }

  const filtered = media.filter(m => m.original_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '85vw', maxWidth: 900, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Media Library</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem' }}>
          <input
            placeholder="Search files…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: 6, padding: '0.45rem 0.75rem', fontSize: '0.9rem' }}
          />
          <label style={{
            background: '#2563eb', color: '#fff', padding: '0.45rem 1rem',
            borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
            opacity: uploading ? 0.6 : 1,
          }}>
            {uploading ? 'Uploading…' : '+ Upload'}
            <input type="file" multiple accept="image/*,video/*,.pdf" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
              No media found. Upload some files!
            </div>
          )}
          {filtered.map(m => (
            <div key={m.id} style={{ border: '2px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s', position: 'relative' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
              {m.mimetype?.startsWith('image/') ? (
                <img src={m.url} alt={m.original_name} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} onClick={() => onSelect(m)} />
              ) : (
                <div style={{ width: '100%', height: 100, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }} onClick={() => onSelect(m)}>
                  📄
                </div>
              )}
              <div style={{ padding: '0.4rem 0.5rem' }}>
                <p style={{ fontSize: '0.72rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.original_name}</p>
              </div>
              <button onClick={() => handleDelete(m.id)}
                style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: 4, padding: '1px 5px', fontSize: '0.72rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
