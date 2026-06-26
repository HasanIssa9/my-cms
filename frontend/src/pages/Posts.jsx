import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import { useLang } from '../i18n.jsx';

export default function Posts({ type }) {
  const { t, lang }           = useLang();
  const P                     = t.posts;
  const [posts, setPosts]     = useState([]);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [deleting, setDeleting] = useState(null);

  const isPost   = type === 'post';
  const label    = isPost ? P.post : P.page;
  const listTitle= isPost ? P.posts : P.pages;
  const newLabel = isPost ? P.newPost : P.newPage;
  const newPath  = `/admin/${type}s/new`;
  const locale   = lang === 'ar' ? 'ar-SA' : 'en-US';

  function load() {
    setLoading(true);
    setError(null);
    api.get(`/posts?type=${type}`)
      .then(r => { setPosts(r.data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }
  useEffect(() => { load(); }, [type]);

  async function deletePost(id, title) {
    if (!confirm(`${P.confirmDelete} "${title}"?`)) return;
    setDeleting(id);
    await api.delete(`/posts/${id}`);
    setPosts(prev => prev.filter(p => p.id !== id));
    setDeleting(null);
  }

  const filtered = posts
    .filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !filter || p.status === filter);

  return (
    <div className="anim-fadeUp page-content" style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{listTitle}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '.82rem', marginTop: '.2rem' }}>{posts.length} {P.total}</p>
        </div>
        <Link to={newPath} className="btn btn-primary">
          <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>+</span> {newLabel}
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '.625rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input className="input" placeholder={P.search} value={search}
          onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180, maxWidth: 300 }} />
        <select className="input" value={filter} onChange={e => setFilter(e.target.value)} style={{ maxWidth: 170 }}>
          <option value="">{P.allStatus}</option>
          <option value="published">{P.published}</option>
          <option value="draft">{P.draft}</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {error ? (
          <div style={{ padding: '3.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--danger)', fontSize: '.875rem', marginBottom: '.75rem' }}>
              ⚠ تعذّر الاتصال بالخادم
            </p>
            <button className="btn btn-ghost btn-sm" onClick={load}>إعادة المحاولة</button>
          </div>
        ) : loading ? (
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 52 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--faint)', fontSize: '.875rem', marginBottom: '.75rem' }}>
              {search || filter ? P.noResults : P.noContent}
            </p>
            {!search && !filter && (
              <Link to={newPath} className="btn btn-primary btn-sm">
                {P.createFirst} {label}
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="posts-table">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                    {[P.title, P.status, P.updated, ''].map((h, i) => (
                      <th key={i} style={{
                        padding: '.6rem 1.1rem', textAlign: lang === 'ar' ? 'right' : 'left',
                        fontSize: '.7rem', fontWeight: 700, color: 'var(--faint)',
                        textTransform: 'uppercase', letterSpacing: '.05em',
                        width: i === 1 ? 100 : i === 2 ? 120 : i === 3 ? 120 : 'auto',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id}
                      style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border2)', opacity: deleting === p.id ? .5 : 1, transition: 'background var(--tr),opacity var(--tr)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '.8rem 1.1rem' }}>
                        <Link to={`/admin/${type}s/${p.id}`} style={{ fontWeight: 600, fontSize: '.875rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
                          {p.title || '—'}
                        </Link>
                        {p.slug && <p style={{ color: 'var(--faint)', fontSize: '.7rem', marginTop: '.1rem', direction: 'ltr', textAlign: lang === 'ar' ? 'right' : 'left' }}>/{p.slug}</p>}
                      </td>
                      <td style={{ padding: '.8rem 1.1rem' }}>
                        <span className={p.status === 'published' ? 'badge badge-green' : 'badge badge-amber'}>
                          {t.status[p.status] || p.status}
                        </span>
                      </td>
                      <td style={{ padding: '.8rem 1.1rem', color: 'var(--muted)', fontSize: '.78rem' }}>
                        {new Date(p.updated_at).toLocaleDateString(locale)}
                      </td>
                      <td style={{ padding: '.8rem .875rem' }}>
                        <div style={{ display: 'flex', gap: '.4rem', justifyContent: 'flex-end' }}>
                          <Link to={`/admin/${type}s/${p.id}`} className="btn btn-ghost btn-sm">{P.edit}</Link>
                          <button onClick={() => deletePost(p.id, p.title)} className="btn btn-danger btn-sm" disabled={deleting === p.id}>{P.delete}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="posts-cards" style={{ display: 'none', flexDirection: 'column' }}>
              {filtered.map((p, i) => (
                <div key={p.id} style={{ padding: '1rem', borderBottom: i < filtered.length - 1 ? '1px solid var(--border2)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem', marginBottom: '.5rem' }}>
                    <Link to={`/admin/${type}s/${p.id}`} style={{ fontWeight: 600, fontSize: '.9rem', flex: 1 }}>{p.title || '—'}</Link>
                    <span className={p.status === 'published' ? 'badge badge-green' : 'badge badge-amber'}>{t.status[p.status]}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--faint)', fontSize: '.73rem' }}>{new Date(p.updated_at).toLocaleDateString(locale)}</span>
                    <div style={{ display: 'flex', gap: '.375rem' }}>
                      <Link to={`/admin/${type}s/${p.id}`} className="btn btn-ghost btn-sm">{P.edit}</Link>
                      <button onClick={() => deletePost(p.id, p.title)} className="btn btn-danger btn-sm">{P.delete}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @media(max-width:600px){
          .posts-table{display:none}
          .posts-cards{display:flex!important}
        }
      `}</style>
    </div>
  );
}

