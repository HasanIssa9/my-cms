import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useLang } from '../i18n.jsx';

export default function Login() {
  const { t, lang, setLang, dark, toggleDark } = useLang();
  const L = t.login;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await api.post('/auth/login', { username, password });
      localStorage.setItem('cms_token', r.data.token);
      navigate('/admin');
    } catch {
      setError(L.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '1.5rem', flexDirection: 'column', gap: '1.5rem',
    }}>

      {/* Top controls */}
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', display: 'flex', gap: '.5rem' }}>
        {[
          { label: t.langSwitch, action: () => setLang(lang === 'ar' ? 'en' : 'ar') },
          { label: dark ? '☀' : '◑', action: toggleDark },
        ].map(({ label, action }) => (
          <button key={label} onClick={action}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '.35rem .7rem', fontSize: '.78rem',
              fontWeight: 600, cursor: 'pointer', color: 'var(--muted)',
              boxShadow: 'var(--shadow)', transition: 'all var(--tr)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--border2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = ''; e.currentTarget.style.background = ''; }}
          >{label}</button>
        ))}
      </div>

      {/* Card */}
      <div className="anim-scaleIn" style={{ width: '100%', maxWidth: 360 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 46, height: 46, background: '#18181b', borderRadius: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '1.3rem', fontWeight: 700,
            margin: '0 auto .875rem', boxShadow: '0 4px 16px rgba(0,0,0,.14)',
          }}>✦</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>{L.welcome}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '.83rem', marginTop: '.25rem' }}>{L.sub}</p>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">{L.username}</label>
              <input className="input" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="admin" required autoFocus autoComplete="username" />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="label">{L.password}</label>
              <input className="input" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete="current-password" />
            </div>

            {error && (
              <div className="anim-slideDown" style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
                padding: '.5rem .75rem', color: 'var(--danger)', fontSize: '.82rem', marginBottom: '.875rem',
              }}>{error}</div>
            )}

            <button type="submit" className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '.6rem', fontSize: '.9rem', justifyContent: 'center' }}>
              {loading
                ? <><span className="spinner" />{L.loading}</>
                : L.submit}
            </button>
          </form>
        </div>

        {import.meta.env.DEV && (
          <p style={{ textAlign: 'center', color: 'var(--faint)', fontSize: '.73rem', marginTop: '1rem' }}>{L.hint}</p>
        )}
      </div>
    </div>
  );
}

