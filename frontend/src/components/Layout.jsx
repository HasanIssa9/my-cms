import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLang } from '../i18n.jsx';
import api from '../api.js';

function useBreakpoint() {
  const [bp, setBp] = useState(() => {
    const w = window.innerWidth;
    return w <= 640 ? 'mobile' : w <= 1024 ? 'tablet' : 'desktop';
  });
  useEffect(() => {
    const fn = () => {
      const w = window.innerWidth;
      setBp(w <= 640 ? 'mobile' : w <= 1024 ? 'tablet' : 'desktop');
    };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return bp;
}

function iconBtn(label, onClick) {
  return (
    <button onClick={onClick} title={label}
      style={{
        background: 'none', border: '1px solid var(--border)', borderRadius: 7,
        padding: '.28rem .55rem', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer',
        color: 'var(--muted)', transition: 'all var(--tr)', whiteSpace: 'nowrap', lineHeight: 1.4,
        display: 'inline-flex', alignItems: 'center',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}
    >{label}</button>
  );
}

function LangToggle() {
  const { lang, setLang, t } = useLang();
  return iconBtn(t.langSwitch, () => setLang(lang === 'ar' ? 'en' : 'ar'));
}

function DarkToggle() {
  const { dark, toggleDark } = useLang();
  return iconBtn(dark ? '☀' : '◑', toggleDark);
}

export default function Layout() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const bp = useBreakpoint();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteTitle, setSiteTitle] = useState('CMS');

  const isDesktop = bp === 'desktop';
  const isTablet  = bp === 'tablet';
  const isMobile  = bp === 'mobile';
  const showLabel = isDesktop;

  const sideW = isMobile ? 0 : isTablet ? 56 : 220;

  useEffect(() => {
    api.get('/settings').then(r => setSiteTitle(r.data.site_title || 'CMS')).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  function logout() {
    localStorage.removeItem('cms_token');
    navigate('/admin/login');
  }

  const NAV = [
    { to: '/admin',          icon: '◈', label: t.nav.dashboard, end: true },
    { to: '/admin/pages',    icon: '◻', label: t.nav.pages },
    { to: '/admin/media',    icon: '◫', label: t.nav.media },
    { to: '/admin/settings', icon: '◬', label: t.nav.settings },
  ];

  const navLinkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '.55rem',
    padding: showLabel ? '.5rem .7rem' : '.55rem',
    justifyContent: showLabel ? 'flex-start' : 'center',
    borderRadius: 8,
    fontSize: '.84rem', fontWeight: isActive ? 600 : 400,
    color: isActive ? 'var(--text)' : 'var(--muted)',
    background: isActive ? 'var(--bg)' : 'transparent',
    transition: 'all var(--tr)',
    marginBottom: 2, textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden',
  });

  // Sidebar component (shared for desktop/tablet and mobile overlay)
  const SidebarContent = ({ overlay = false }) => (
    <div style={{
      width: overlay ? 240 : sideW,
      height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface)',
      borderLeft: lang === 'rtl' || lang === 'ar' ? '1px solid var(--border2)' : 'none',
      borderRight: lang === 'ar' ? 'none' : '1px solid var(--border2)',
    }}>
      {/* Logo */}
      <div style={{
        height: 'var(--topbar-h)', display: 'flex', alignItems: 'center',
        padding: '0 .875rem', gap: '.6rem',
        borderBottom: '1px solid var(--border2)', flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28, background: '#18181b', borderRadius: 7, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '.9rem', fontWeight: 700,
        }}>✦</div>
        {(showLabel || overlay) && (
          <span style={{ fontWeight: 700, fontSize: '.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {siteTitle}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '.5rem', overflow: 'hidden' }}>
        {NAV.map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            onClick={() => overlay && setMobileMenuOpen(false)}
            style={({ isActive }) => navLinkStyle(isActive)}
            onMouseEnter={e => { if (e.currentTarget.style.background !== 'var(--bg)') e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { if (!e.currentTarget.dataset.active) { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; } }}
          >
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
            {(showLabel || overlay) && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '.5rem', borderTop: '1px solid var(--border2)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {(showLabel || overlay) && (
          <div style={{ display: 'flex', gap: '.375rem', padding: '.1rem 0' }}>
            <div style={{ flex: 1 }}><LangToggle /></div>
            <DarkToggle />
          </div>
        )}
        <a href="http://localhost:3001" target="_blank" rel="noreferrer"
          style={navLinkStyle(false)}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}
        >
          <span style={{ fontSize: '1rem' }}>↗</span>
          {(showLabel || overlay) && <span>{t.nav.viewSite}</span>}
        </a>
        <button onClick={logout} style={{ ...navLinkStyle(false), border: 'none', width: '100%', cursor: 'pointer', justifyContent: showLabel || overlay ? 'flex-start' : 'center' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = 'var(--danger)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}
        >
          <span style={{ fontSize: '1rem' }}>⎋</span>
          {(showLabel || overlay) && <span>{t.nav.logout}</span>}
        </button>
      </div>
    </div>
  );

  const isRTL = lang === 'ar';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: isRTL ? 'row-reverse' : 'row', position: 'relative' }}>

      {/* Desktop / Tablet sidebar */}
      {!isMobile && (
        <aside style={{
          width: sideW, minHeight: '100vh',
          position: 'fixed', top: 0, [isRTL ? 'right' : 'left']: 0, bottom: 0,
          zIndex: 100, transition: 'width 200ms cubic-bezier(.4,0,.2,1)', overflow: 'hidden',
        }}>
          <SidebarContent />
        </aside>
      )}

      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <>
          <div onClick={() => setMobileMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', zIndex: 199, animation: 'fadeIn .18s ease both' }} />
          <div style={{
            position: 'fixed', top: 0, [isRTL ? 'right' : 'left']: 0, bottom: 0, zIndex: 200,
            animation: 'scaleIn .2s cubic-bezier(.22,.68,0,1.2) both',
          }}>
            <SidebarContent overlay />
          </div>
        </>
      )}

      {/* Main */}
      <div style={{
        flex: 1,
        [isRTL ? 'marginRight' : 'marginLeft']: isMobile ? 0 : sideW,
        transition: 'margin 200ms cubic-bezier(.4,0,.2,1)',
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
      }}>

        {/* Topbar */}
        <header style={{
          height: 'var(--topbar-h)', background: 'var(--surface)',
          borderBottom: '1px solid var(--border2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.25rem', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            {isMobile && (
              <button onClick={() => setMobileMenuOpen(o => !o)} className="btn-icon" style={{ fontSize: '1.1rem' }}>
                ☰
              </button>
            )}
            {isMobile && (
              <div style={{ width: 24, height: 24, background: '#18181b', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.8rem', fontWeight: 700 }}>✦</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            {(isTablet || isMobile) && <LangToggle />}
            <DarkToggle />
            <span style={{ fontSize: '.73rem', color: 'var(--faint)', marginLeft: '.25rem' }}>
              {new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto' }}>
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        {isMobile && (
          <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
            background: 'var(--surface)', borderTop: '1px solid var(--border2)',
            display: 'flex', padding: '0 .5rem',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}>
            {NAV.map(({ to, icon, label, end }) => (
              <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '.55rem 0', gap: '.2rem',
                fontSize: '.6rem', fontWeight: 600, color: isActive ? 'var(--accent)' : 'var(--faint)',
                transition: 'color var(--tr)',
              })}>
                <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

