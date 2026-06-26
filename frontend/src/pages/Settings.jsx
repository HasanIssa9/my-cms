import { useState, useEffect } from 'react';
import api from '../api.js';
import { useLang } from '../i18n.jsx';

function Section({ title, desc, children }) {
  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: '.875rem' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border2)' }}>
        <p style={{ fontWeight: 600, fontSize: '.9rem' }}>{title}</p>
        {desc && <p style={{ fontSize: '.76rem', color: 'var(--muted)', marginTop: '.15rem' }}>{desc}</p>}
      </div>
      <div style={{ padding: '1.25rem' }}>{children}</div>
    </div>
  );
}

function Field({ label, hint, children, half }) {
  return (
    <div style={{ marginBottom: '1rem', maxWidth: half ? 300 : '100%' }}>
      <label className="label">{label}</label>
      {hint && <p style={{ fontSize: '.72rem', color: 'var(--faint)', marginBottom: '.3rem' }}>{hint}</p>}
      {children}
    </div>
  );
}

function Toast({ show, text, error }) {
  if (!show) return null;
  return <div className="toast" style={{ background: error ? 'var(--danger)' : '#18181b' }}>{text}</div>;
}

export default function Settings() {
  const { t, lang }           = useLang();
  const S                     = t.settings;
  const [cfg, setCfg]         = useState({});
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState({ show: false, text: '', error: false });
  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => { api.get('/settings').then(r => setCfg(r.data)).catch(() => {}); }, []);

  function set(k, v) { setCfg(p => ({ ...p, [k]: v })); }

  function showToast(text, error = false) {
    setToast({ show: true, text, error });
    setTimeout(() => setToast(x => ({ ...x, show: false })), 2200);
  }

  async function saveSettings(e) {
    e.preventDefault(); setSaving(true);
    try { await api.put('/settings', cfg); showToast(S.saved); }
    catch { showToast(S.errorSave, true); }
    finally { setSaving(false); }
  }

  async function changePassword(e) {
    e.preventDefault(); setPwError('');
    if (pwForm.newPassword !== pwForm.confirm) { setPwError(S.pwMismatch); return; }
    if (pwForm.newPassword.length < 6) { setPwError(S.pwTooShort); return; }
    setPwSaving(true);
    try {
      await api.put('/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      showToast(S.pwSaved);
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch { setPwError(S.pwWrong); }
    finally { setPwSaving(false); }
  }

  const THEMES = [
    { value: 'default', label: S.themePreview[0], bg: '#2563eb' },
    { value: 'dark',    label: S.themePreview[1], bg: '#0f172a' },
    { value: 'minimal', label: S.themePreview[2], bg: '#fff', border: '1.5px solid #18181b' },
  ];

  return (
    <div className="anim-fadeUp page-content" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{S.title}</h1>
        <p style={{ color: 'var(--muted)', fontSize: '.82rem', marginTop: '.2rem' }}>{S.sub}</p>
      </div>

      <form onSubmit={saveSettings}>
        <Section title={S.identity} desc={S.identitySub}>
          <Field label={S.siteTitle}>
            <input className="input" value={cfg.site_title || ''} onChange={e => set('site_title', e.target.value)} placeholder="My Site" />
          </Field>
          <Field label={S.tagline}>
            <input className="input" value={cfg.site_tagline || ''} onChange={e => set('site_tagline', e.target.value)} placeholder="Just another CMS" />
          </Field>
          <Field label={S.email}>
            <input className="input" type="email" value={cfg.admin_email || ''} onChange={e => set('admin_email', e.target.value)} placeholder="admin@example.com" />
          </Field>
        </Section>

        <Section title={S.appearance} desc={S.appearanceSub}>
          <Field label={S.theme} half>
            <select className="input" value={cfg.site_theme || 'default'} onChange={e => set('site_theme', e.target.value)}>
              <option value="default">{S.themeDefault}</option>
              <option value="dark">{S.themeDark}</option>
              <option value="minimal">{S.themeMinimal}</option>
            </select>
          </Field>
          <div style={{ display: 'flex', gap: '.625rem' }}>
            {THEMES.map(th => (
              <button type="button" key={th.value} onClick={() => set('site_theme', th.value)}
                style={{
                  flex: 1, border: `2px solid ${cfg.site_theme === th.value ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 9, overflow: 'hidden', cursor: 'pointer', background: 'none',
                  transition: 'border-color var(--tr)', boxShadow: cfg.site_theme === th.value ? '0 0 0 3px rgba(37,99,235,.1)' : 'none',
                }}>
                <div style={{ height: 40, background: th.bg, border: th.border }} />
                <div style={{ padding: '.35rem .5rem', background: 'var(--bg)' }}>
                  <p style={{ fontSize: '.72rem', fontWeight: 600, textAlign: 'center' }}>{th.label}</p>
                </div>
              </button>
            ))}
          </div>
        </Section>

        <Section title={S.reading}>
          <Field label={S.postsPerPage} half>
            <input className="input" type="number" min={1} max={100}
              value={cfg.posts_per_page || '10'}
              onChange={e => set('posts_per_page', e.target.value)}
              style={{ maxWidth: 120 }} />
          </Field>
        </Section>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '.55rem 1.5rem' }}>
          {saving ? S.saving : S.save}
        </button>
      </form>

      {/* Password section */}
      <div style={{ marginTop: '1.25rem' }}>
        <Section title={S.password}>
          <form onSubmit={changePassword}>
            <Field label={S.currentPw} half>
              <input className="input" type="password" value={pwForm.currentPassword}
                onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required />
            </Field>
            <Field label={S.newPw} half>
              <input className="input" type="password" value={pwForm.newPassword}
                onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required />
            </Field>
            <Field label={S.confirmPw} half>
              <input className="input" type="password" value={pwForm.confirm}
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required />
            </Field>
            {pwError && (
              <div className="anim-slideDown" style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
                padding: '.5rem .75rem', color: 'var(--danger)', fontSize: '.82rem', marginBottom: '.875rem',
              }}>{pwError}</div>
            )}
            <button type="submit" className="btn btn-ghost" disabled={pwSaving}>
              {pwSaving ? S.updatingPw : S.updatePw}
            </button>
          </form>
        </Section>
      </div>

      <Toast show={toast.show} text={toast.text} error={toast.error} />
    </div>
  );
}

