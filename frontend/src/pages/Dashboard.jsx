import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import { useLang } from '../i18n.jsx';

function StatCard({ label, value, sub, to, dot }) {
  const inner = (
    <div className="card" style={{
      padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.3rem',
      transition: 'box-shadow var(--tr),transform var(--tr)', cursor: to ? 'pointer' : 'default',
    }}
      onMouseEnter={e => { if (to) { e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.transform='translateY(-1px)'; }}}
      onMouseLeave={e => { e.currentTarget.style.boxShadow=''; e.currentTarget.style.transform=''; }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, display: 'inline-block', marginBottom: '.2rem' }} />
      <p style={{ fontSize: '1.85rem', fontWeight: 700, lineHeight: 1, color: 'var(--text)', letterSpacing: '-.02em' }}>{value}</p>
      <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--muted)' }}>{label}</p>
      {sub && <p style={{ fontSize: '.72rem', color: 'var(--faint)' }}>{sub}</p>}
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
}

export default function Dashboard() {
  const { t, lang } = useLang();
  const D = t.dashboard;
  const [stats, setStats]       = useState({ pages: 0, media: 0, published: 0 });
  const [recent, setRecent]     = useState([]);
  const [siteTitle, setSiteTitle] = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/posts?type=page').catch(() => ({ data: [] })),
      api.get('/media').catch(() => ({ data: [] })),
      api.get('/settings').catch(() => ({ data: {} })),
    ]).then(([pages, media, settings]) => {
      const pg = Array.isArray(pages.data) ? pages.data : [];
      const md = Array.isArray(media.data) ? media.data : [];
      setStats({ pages: pg.length, media: md.length, published: pg.filter(p => p.status === 'published').length });
      setRecent(pg.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 6));
      setSiteTitle(settings.data?.site_title || 'CMS');
    }).finally(() => setLoading(false));
  }, []);

  const locale = lang === 'ar' ? 'ar-SA' : 'en-US';

  const ACTIONS = [
    { label: D.newPage,      to: '/admin/pages/new',  icon: '◻' },
    { label: D.uploadMedia,  to: '/admin/media',      icon: '◫' },
    { label: D.goSettings,   to: '/admin/settings',   icon: '◬' },
  ];

  return (
    <div className="anim-fadeUp page-content" style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{loading ? '—' : siteTitle}</h1>
        <p style={{ color: 'var(--muted)', fontSize: '.82rem', marginTop: '.2rem' }}>{D.sub}</p>
      </div>

      {/* Stats */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '.875rem', marginBottom: '1.75rem' }}>
        {loading
          ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 108 }} />)
          : <>
              <StatCard label={D.pages}     value={stats.pages}     to="/admin/pages" dot="#7c3aed" />
              <StatCard label={D.published} value={stats.published} sub={`${D.of} ${stats.pages}`} to="/admin/pages" dot="#16a34a" />
              <StatCard label={D.media}     value={stats.media}     to="/admin/media" dot="#d97706" />
            </>
        }
      </div>

      {/* Grid: recent + actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 240px', gap: '1rem', alignItems: 'start' }}>

        {/* Recent */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '.875rem 1.25rem', borderBottom: '1px solid var(--border2)' }}>
            <p style={{ fontWeight: 600, fontSize: '.875rem' }}>{D.recent}</p>
          </div>
          {loading ? (
            <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
            </div>
          ) : recent.length === 0 ? (
            <p style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--faint)', fontSize: '.85rem' }}>{D.empty}</p>
          ) : (
            recent.map((p, i) => {
              const isPublished = p.status === 'published';
              return (
                <Link key={p.id} to={`/admin/pages/${p.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '.8rem 1.25rem',
                    borderBottom: i < recent.length - 1 ? '1px solid var(--border2)' : 'none',
                    transition: 'background var(--tr)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: '.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.title || '—'}
                    </p>
                    <p style={{ color: 'var(--faint)', fontSize: '.72rem', marginTop: '.1rem' }}>
                      {D.page} · {new Date(p.updated_at).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <span className={isPublished ? 'badge badge-green' : 'badge badge-amber'}>
                    {t.status[p.status] || p.status}
                  </span>
                </Link>
              );
            })
          )}
        </div>

        {/* Quick actions */}
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ fontWeight: 600, fontSize: '.875rem', marginBottom: '.75rem', padding: '0 .25rem' }}>{D.actions}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
            {ACTIONS.map(a => (
              <Link key={a.to} to={a.to} className="btn btn-ghost"
                style={{ justifyContent: 'flex-start', gap: '.6rem', padding: '.5rem .7rem' }}>
                <span style={{ color: 'var(--muted)', fontSize: '.95rem' }}>{a.icon}</span>
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`@media(max-width:640px){.dash-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

