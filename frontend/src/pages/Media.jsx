import { useState, useEffect, useRef } from 'react';
import api from '../api.js';
import { useLang } from '../i18n.jsx';

function formatBytes(b) {
  if (!b) return '—';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

const mime2icon = m => m?.includes('pdf') ? '📄' : m?.includes('video') ? '🎬' : '📁';

export default function Media() {
  const { t, lang } = useLang();
  const M = t.media;
  const [media, setMedia]           = useState([]);
  const [uploading, setUploading]   = useState(false);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(null);
  const [copied, setCopied]         = useState(false);
  const [loading, setLoading]       = useState(true);
  const fileRef = useRef();
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US';

  function load() {
    api.get('/media').then(r => { setMedia(r.data); setLoading(false); }).catch(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleUpload(e) {
    const files = e.target.files;
    if (!files.length) return;
    setUploading(true);
    const fd = new FormData();
    for (const f of files) fd.append('files', f);
    const r = await api.post('/media/upload', fd);
    setMedia(prev => [...r.data.reverse(), ...prev]);
    setUploading(false);
    fileRef.current.value = '';
  }

  async function handleDelete(m) {
    if (!confirm(`${M.confirmDelete} "${m.original_name}"?`)) return;
    await api.delete(`/media/${m.id}`);
    setMedia(prev => prev.filter(x => x.id !== m.id));
    if (selected?.id === m.id) setSelected(null);
  }

  function copyUrl(url) {
    navigator.clipboard.writeText(`http://localhost:3001${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const filtered = media.filter(m => m.original_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="anim-fadeUp page-content" style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{M.title}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '.82rem', marginTop: '.2rem' }}>{media.length} {lang === 'ar' ? 'ملف' : 'files'}</p>
        </div>
        <label className="btn btn-primary" style={{ cursor: 'pointer', opacity: uploading ? .7 : 1 }}>
          {uploading ? M.uploading : M.upload}
          <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf"
            onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 256px', gap: '1.1rem', alignItems: 'start' }}>
        {/* Grid */}
        <div>
          <input className="input" placeholder={M.search} value={search}
            onChange={e => setSearch(e.target.value)} style={{ marginBottom: '1rem', maxWidth: 280 }} />

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '.625rem' }}>
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 140 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--faint)', fontSize: '.875rem' }}>
              {search ? M.noResults : M.noFiles}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '.625rem' }}>
              {filtered.map(m => {
                const isSel = selected?.id === m.id;
                return (
                  <div key={m.id} onClick={() => setSelected(m)}
                    style={{
                      border: `2px solid ${isSel ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                      background: 'var(--surface)',
                      transition: 'border-color var(--tr),box-shadow var(--tr)',
                      boxShadow: isSel ? '0 0 0 3px rgba(37,99,235,.1)' : 'var(--shadow)',
                    }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.borderColor = 'var(--faint)'; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    {m.mimetype?.startsWith('image/') ? (
                      <img src={m.url} alt={m.original_name} style={{ width: '100%', height: 96, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: 96, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.25rem' }}>
                        <span style={{ fontSize: '1.6rem' }}>{mime2icon(m.mimetype)}</span>
                        <span style={{ fontSize: '.6rem', color: 'var(--faint)', textTransform: 'uppercase' }}>{m.mimetype?.split('/')[1]}</span>
                      </div>
                    )}
                    <div style={{ padding: '.375rem .5rem' }}>
                      <p style={{ fontSize: '.68rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.original_name}</p>
                      <p style={{ fontSize: '.63rem', color: 'var(--faint)' }}>{formatBytes(m.size)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="card" style={{ padding: '1.1rem', position: 'sticky', top: 'calc(var(--topbar-h) + 1rem)', overflow: 'hidden' }}>
          {selected ? (
            <div className="anim-fadeIn">
              <p style={{ fontWeight: 600, fontSize: '.875rem', marginBottom: '.875rem' }}>{M.details}</p>
              {selected.mimetype?.startsWith('image/') && (
                <img src={selected.url} alt="" style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 150, marginBottom: '.875rem' }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem', marginBottom: '1rem', fontSize: '.78rem' }}>
                {[
                  [M.name,     selected.original_name],
                  [M.type,     selected.mimetype],
                  [M.size,     formatBytes(selected.size)],
                  [M.uploaded, new Date(selected.created_at).toLocaleDateString(locale)],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: '.5rem' }}>
                    <span style={{ color: 'var(--faint)', fontWeight: 600, flexShrink: 0, minWidth: 54 }}>{k}</span>
                    <span style={{ color: 'var(--muted)', wordBreak: 'break-all' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                <button onClick={() => copyUrl(selected.url)} className="btn btn-ghost btn-sm" style={{ justifyContent: 'center' }}>
                  {copied ? M.copied : M.copyUrl}
                </button>
                <a href={selected.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ justifyContent: 'center' }}>
                  {M.openFile}
                </a>
                <button onClick={() => handleDelete(selected)} className="btn btn-danger btn-sm" style={{ justifyContent: 'center' }}>
                  {M.deleteFile}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '1.75rem 0', textAlign: 'center', color: 'var(--faint)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '.5rem' }}>◫</div>
              <p style={{ fontSize: '.8rem' }}>{M.selectFile}</p>
            </div>
          )}
        </div>
      </div>

      {/* Responsive: hide detail panel on mobile */}
      <style>{`@media(max-width:640px){.media-detail{display:none!important}}`}</style>
    </div>
  );
}

