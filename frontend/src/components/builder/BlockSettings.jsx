import { useState } from 'react';
import { SOCIAL_PLATFORMS, ANIMATIONS } from './blocks.js';
import MediaPicker from '../MediaPicker.jsx';

// ── primitives ────────────────────────────────────────────────────────────────
const inp = {
  width: '100%', border: '1px solid var(--border,#e2e8f0)', borderRadius: 5,
  padding: '0.32rem 0.55rem', fontSize: '0.8rem', outline: 'none',
  background: 'var(--surface,#fff)', color: 'var(--text,#1e293b)',
};
const lbl = {
  display: 'block', fontSize: '0.68rem', fontWeight: 700,
  color: 'var(--muted,#64748b)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em',
};

function F({ label, children, mt = 10 }) {
  return <div style={{ marginTop: mt }}><div style={lbl}>{label}</div>{children}</div>;
}

function ColorRow({ label, value, onChange }) {
  return (
    <F label={label}>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
          style={{ width: 32, height: 30, border: '1px solid var(--border,#e2e8f0)', borderRadius: 4, cursor: 'pointer', padding: 2, background: 'none' }} />
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="transparent"
          style={{ ...inp, flex: 1 }} />
        {value && <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', color: 'var(--faint,#94a3b8)', fontSize: 13, cursor: 'pointer' }}>✕</button>}
      </div>
    </F>
  );
}

function AlignRow({ value, onChange, label = 'Alignment', opts = ['left', 'center', 'right'] }) {
  const ICON = { left: '⬛⬜⬜', center: '⬜⬛⬜', right: '⬜⬜⬛', justify: '▤' };
  const LABEL = { left: 'L', center: 'C', right: 'R', justify: 'J' };
  return (
    <F label={label}>
      <div style={{ display: 'flex', gap: 4 }}>
        {opts.map(a => (
          <button key={a} type="button" onClick={() => onChange(a)}
            style={{ flex: 1, padding: '4px 2px', border: `1px solid ${value === a ? 'var(--accent,#2563eb)' : 'var(--border,#e2e8f0)'}`, borderRadius: 4, cursor: 'pointer', background: value === a ? 'var(--accent,#2563eb)' : 'var(--surface,#fff)', color: value === a ? '#fff' : 'var(--muted,#64748b)', fontSize: '0.72rem', fontWeight: 700 }}>
            {LABEL[a] || a[0].toUpperCase()}
          </button>
        ))}
      </div>
    </F>
  );
}

function Slider({ label, value, onChange, min = 0, max = 1, step = 0.01, display }) {
  const pct = display === '%' ? `${Math.round(parseFloat(value || 0) * 100)}%` : `${Math.round(parseFloat(value || 0))}px`;
  return (
    <F label={label}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="range" min={min} max={max} step={step} value={parseFloat(value) || 0}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--accent,#2563eb)', cursor: 'pointer' }} />
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted,#64748b)', minWidth: 34 }}>{pct}</span>
      </div>
    </F>
  );
}

function Row2({ children }) {
  return <div style={{ display: 'flex', gap: 6 }}>{children}</div>;
}

// ── collapsible section ───────────────────────────────────────────────────────
function Sec({ title, children, open: defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: '1px solid var(--border2,#f4f4f5)' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.875rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text,#1e293b)', fontSize: '0.78rem', fontWeight: 700 }}>
        {title}
        <span style={{ fontSize: '0.6rem', color: 'var(--faint,#94a3b8)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'inline-block', transition: 'transform 0.2s' }}>▼</span>
      </button>
      {open && <div style={{ padding: '0 0.875rem 0.875rem' }}>{children}</div>}
    </div>
  );
}

// shadow presets
const SHADOWS = [
  { l: 'None',  v: 'none' },
  { l: 'XS',   v: '0 1px 3px rgba(0,0,0,0.08)' },
  { l: 'SM',   v: '0 2px 6px rgba(0,0,0,0.1)' },
  { l: 'MD',   v: '0 4px 12px rgba(0,0,0,0.12)' },
  { l: 'LG',   v: '0 8px 24px rgba(0,0,0,0.14)' },
  { l: 'XL',   v: '0 16px 40px rgba(0,0,0,0.18)' },
];

// ── Style tab (shared across all block types) ─────────────────────────────────
function StyleTab({ block, onChange }) {
  const s = block.styles || {};
  const up = v => onChange({ styles: { ...(block.styles || {}), ...v } });

  return (
    <div>
      {/* Size */}
      <Sec title="📐 Size" open>
        <p style={{ fontSize: '0.65rem', color: 'var(--accent,#2563eb)', marginBottom: 6, marginTop: 0 }}>✦ استخدم وحدة: 200px أو 50% أو 10rem</p>
        <Row2>
          <F label="Width" mt={0}><input value={s.width || ''} onChange={e => up({ width: e.target.value })} placeholder="200px" style={inp} /></F>
          <F label="Height" mt={0}><input value={s.height || ''} onChange={e => up({ height: e.target.value })} placeholder="150px" style={inp} /></F>
        </Row2>
        <Row2>
          <F label="Max Width"><input value={s.maxWidth || ''} onChange={e => up({ maxWidth: e.target.value })} placeholder="100%" style={inp} /></F>
          <F label="Min Height"><input value={s.minHeight || ''} onChange={e => up({ minHeight: e.target.value })} placeholder="50px" style={inp} /></F>
        </Row2>
      </Sec>

      {/* Spacing */}
      <Sec title="↔ Spacing" open>
        <F label="Padding" mt={0}>
          <input value={s.padding || ''} onChange={e => up({ padding: e.target.value })} placeholder="0.5rem 1rem" style={inp} />
          <p style={{ fontSize: '0.65rem', color: 'var(--faint,#94a3b8)', marginTop: 2 }}>top right bottom left  (e.g. 1rem 2rem)</p>
        </F>
        <F label="Margin">
          <input value={s.margin || ''} onChange={e => up({ margin: e.target.value })} placeholder="0" style={inp} />
        </F>
      </Sec>

      {/* Background */}
      <Sec title="🎨 Background" open>
        <ColorRow label="Background Color" value={s.backgroundColor} onChange={v => up({ backgroundColor: v })} />
        <Slider label="Opacity" value={s.opacity ?? 1} onChange={v => up({ opacity: v })} min={0} max={1} step={0.01} display="%" />
        <F label="Gradient (CSS)">
          <input value={(s.backgroundImage || '').startsWith('linear') || (s.backgroundImage || '').startsWith('radial') ? s.backgroundImage : ''}
            onChange={e => up({ backgroundImage: e.target.value })}
            placeholder="linear-gradient(135deg, #667eea, #764ba2)" style={inp} />
        </F>
      </Sec>

      {/* Border */}
      <Sec title="▭ Border" open>
        <Row2>
          <F label="Width" mt={0}><input value={s.borderWidth || ''} onChange={e => up({ borderWidth: e.target.value })} placeholder="0" style={inp} /></F>
          <F label="Style" mt={0}>
            <select value={s.borderStyle || 'solid'} onChange={e => up({ borderStyle: e.target.value })} style={inp}>
              {['solid', 'dashed', 'dotted', 'double', 'none'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </F>
        </Row2>
        <ColorRow label="Border Color" value={s.borderColor} onChange={v => up({ borderColor: v })} />
        <F label="Border Radius">
          <input value={s.borderRadius || ''} onChange={e => up({ borderRadius: e.target.value })} placeholder="8px" style={inp} />
          <p style={{ fontSize: '0.65rem', color: 'var(--faint,#94a3b8)', marginTop: 2 }}>One value (8px) or 4 corners (TL TR BR BL)</p>
        </F>
      </Sec>

      {/* Shadow */}
      <Sec title="◱ Shadow" open>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {SHADOWS.map(p => (
            <button key={p.l} type="button" onClick={() => up({ boxShadow: p.v })}
              style={{ padding: '3px 8px', fontSize: '0.7rem', fontWeight: 600, border: `1px solid ${s.boxShadow === p.v ? 'var(--accent,#2563eb)' : 'var(--border,#e2e8f0)'}`, borderRadius: 4, background: s.boxShadow === p.v ? 'var(--accent,#2563eb)' : 'var(--surface,#fff)', color: s.boxShadow === p.v ? '#fff' : 'var(--muted,#64748b)', cursor: 'pointer' }}>
              {p.l}
            </button>
          ))}
        </div>
        <F label="Custom Shadow" mt={4}>
          <input value={s.boxShadow || ''} onChange={e => up({ boxShadow: e.target.value })} placeholder="0 4px 12px rgba(0,0,0,0.1)" style={inp} />
        </F>
      </Sec>

      {/* Effects */}
      <Sec title="✨ Effects" open={false}>
        <Slider label="Opacity" value={s.opacity ?? 1} onChange={v => up({ opacity: v })} min={0} max={1} step={0.01} display="%" />
        <F label="Transform">
          <input value={s.transform || ''} onChange={e => up({ transform: e.target.value })} placeholder="rotate(3deg) scale(1.05)" style={inp} />
        </F>
        <F label="Filter">
          <input value={s.filter || ''} onChange={e => up({ filter: e.target.value })} placeholder="blur(4px) brightness(1.2)" style={inp} />
        </F>
        <F label="Transition">
          <input value={s.transition || ''} onChange={e => up({ transition: e.target.value })} placeholder="all 0.3s ease" style={inp} />
        </F>
        <F label="Blend Mode">
          <select value={s.mixBlendMode || 'normal'} onChange={e => up({ mixBlendMode: e.target.value })} style={inp}>
            {['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'soft-light', 'difference'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </F>
        <F label="Overflow">
          <select value={s.overflow || 'visible'} onChange={e => up({ overflow: e.target.value })} style={inp}>
            {['visible', 'hidden', 'scroll', 'auto'].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </F>
        <F label="Cursor">
          <select value={s.cursor || 'default'} onChange={e => up({ cursor: e.target.value })} style={inp}>
            {['default', 'pointer', 'text', 'move', 'not-allowed', 'zoom-in'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </F>
      </Sec>

      {/* Position */}
      <Sec title="📍 Position" open={false}>
        <F label="Position" mt={0}>
          <select value={s.position || 'static'} onChange={e => up({ position: e.target.value })} style={inp}>
            {['static', 'relative', 'absolute', 'fixed', 'sticky'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </F>
        {s.position && s.position !== 'static' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
            {['top', 'right', 'bottom', 'left'].map(d => (
              <F key={d} label={d[0].toUpperCase() + d.slice(1)} mt={0}>
                <input value={s[d] || ''} onChange={e => up({ [d]: e.target.value })} placeholder="auto" style={inp} />
              </F>
            ))}
          </div>
        )}
        <F label="Z-Index">
          <input type="number" value={s.zIndex || ''} onChange={e => up({ zIndex: e.target.value })} placeholder="0" style={{ ...inp, maxWidth: 80 }} />
        </F>
      </Sec>

      {/* Reset */}
      <div style={{ padding: '0.75rem 0.875rem' }}>
        <button type="button" onClick={() => onChange({ styles: {} })}
          style={{ width: '100%', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 5, padding: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
          Reset All Styles
        </button>
      </div>
    </div>
  );
}

// ── Advanced tab ──────────────────────────────────────────────────────────────
function AdvancedTab({ block, onChange }) {
  return (
    <div style={{ padding: '0.75rem 0.875rem 1.5rem' }}>
      <F label="Animation" mt={0}>
        <select value={block.animation || 'fadeInUp'} onChange={e => onChange({ animation: e.target.value })} style={inp}>
          {ANIMATIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
      </F>
      <F label="Delay">
        <select value={block.animDelay || '0'} onChange={e => onChange({ animDelay: e.target.value })} style={inp}>
          {['0', '0.1s', '0.2s', '0.3s', '0.4s', '0.5s', '0.7s', '1s'].map(d => <option key={d} value={d}>{d === '0' ? 'No delay' : d}</option>)}
        </select>
      </F>
      <F label="Duration">
        <select value={block.animDuration || '0.6s'} onChange={e => onChange({ animDuration: e.target.value })} style={inp}>
          {['0.3s', '0.5s', '0.6s', '0.8s', '1s', '1.2s', '1.5s', '2s'].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </F>
      <F label="CSS Class">
        <input value={block.cssClass || ''} onChange={e => onChange({ cssClass: e.target.value })} placeholder="my-class another" style={inp} />
      </F>
      <F label="Element ID">
        <input value={block.elemId || ''} onChange={e => onChange({ elemId: e.target.value })} placeholder="section-hero" style={inp} />
      </F>
      <F label="Custom CSS">
        <textarea value={block.customCss || ''} onChange={e => onChange({ customCss: e.target.value })}
          rows={5} placeholder={'color: red;\nfont-size: 2rem;'}
          style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.6 }} />
      </F>
    </div>
  );
}

// ── Content components ────────────────────────────────────────────────────────

function HeadingS({ b, ch }) {
  const c = b.content || {}, s = b.styles || {};
  return <>
    <F label="Text" mt={0}><textarea value={c.text} onChange={e => ch({ content: { ...c, text: e.target.value } })} rows={2} style={{ ...inp, resize: 'vertical' }} /></F>
    <Row2>
      <F label="Level">
        <select value={c.level || 2} onChange={e => ch({ content: { ...c, level: +e.target.value } })} style={inp}>
          {[1, 2, 3, 4, 5, 6].map(l => <option key={l} value={l}>H{l}</option>)}
        </select>
      </F>
      <F label="Weight">
        <select value={s.fontWeight || '700'} onChange={e => ch({ styles: { ...(b.styles || {}), fontWeight: e.target.value } })} style={inp}>
          {['300', '400', '500', '600', '700', '800', '900'].map(w => <option key={w} value={w}>{w}</option>)}
        </select>
      </F>
    </Row2>
    <Row2>
      <F label="Font Size"><input value={s.fontSize || ''} onChange={e => ch({ styles: { ...(b.styles || {}), fontSize: e.target.value } })} placeholder="2rem" style={inp} /></F>
      <F label="Line Height"><input value={s.lineHeight || ''} onChange={e => ch({ styles: { ...(b.styles || {}), lineHeight: e.target.value } })} placeholder="1.3" style={inp} /></F>
    </Row2>
    <AlignRow value={s.textAlign} onChange={v => ch({ styles: { ...(b.styles || {}), textAlign: v } })} />
    <ColorRow label="Text Color" value={s.color} onChange={v => ch({ styles: { ...(b.styles || {}), color: v } })} />
    <ColorRow label="Background" value={s.backgroundColor} onChange={v => ch({ styles: { ...(b.styles || {}), backgroundColor: v } })} />
  </>;
}

function TextS({ b, ch }) {
  const c = b.content || {}, s = b.styles || {};
  return <>
    <F label="Text" mt={0}><textarea value={c.text} onChange={e => ch({ content: { ...c, text: e.target.value } })} rows={6} style={{ ...inp, resize: 'vertical' }} /></F>
    <Row2>
      <F label="Font Size"><input value={s.fontSize || ''} onChange={e => ch({ styles: { ...(b.styles || {}), fontSize: e.target.value } })} placeholder="1rem" style={inp} /></F>
      <F label="Line Height"><input value={s.lineHeight || ''} onChange={e => ch({ styles: { ...(b.styles || {}), lineHeight: e.target.value } })} placeholder="1.8" style={inp} /></F>
    </Row2>
    <AlignRow value={s.textAlign} onChange={v => ch({ styles: { ...(b.styles || {}), textAlign: v } })} opts={['left', 'center', 'right', 'justify']} />
    <ColorRow label="Text Color" value={s.color} onChange={v => ch({ styles: { ...(b.styles || {}), color: v } })} />
    <ColorRow label="Background" value={s.backgroundColor} onChange={v => ch({ styles: { ...(b.styles || {}), backgroundColor: v } })} />
  </>;
}

function ImageS({ b, ch }) {
  const c = b.content || {}, s = b.styles || {};
  const [show, setShow] = useState(false);
  return <>
    <F label="Image" mt={0}>
      {c.src
        ? <div><img src={c.src} alt="" style={{ width: '100%', borderRadius: 6, maxHeight: 90, objectFit: 'cover', marginBottom: 4 }} /><button type="button" onClick={() => setShow(true)} style={{ ...inp, cursor: 'pointer', textAlign: 'center', background: 'var(--bg,#f8fafc)' }}>Change</button></div>
        : <button type="button" onClick={() => setShow(true)} style={{ ...inp, cursor: 'pointer', textAlign: 'center', background: 'var(--bg,#f8fafc)', border: '2px dashed var(--border,#e2e8f0)', padding: '0.8rem' }}>+ Pick from Library</button>}
    </F>
    <F label="Alt Text"><input value={c.alt || ''} onChange={e => ch({ content: { ...c, alt: e.target.value } })} placeholder="Describe the image" style={inp} /></F>
    <F label="Link (optional)"><input value={c.link || ''} onChange={e => ch({ content: { ...c, link: e.target.value } })} placeholder="https://..." style={inp} /></F>
    <Row2>
      <F label="Width"><input value={s.width || ''} onChange={e => ch({ styles: { ...(b.styles || {}), width: e.target.value } })} placeholder="200px أو 50%" style={inp} /></F>
      <F label="Height"><input value={s.height || ''} onChange={e => ch({ styles: { ...(b.styles || {}), height: e.target.value } })} placeholder="150px أو auto" style={inp} /></F>
    </Row2>
    <p style={{ fontSize: '0.65rem', color: 'var(--accent,#2563eb)', marginTop: 3 }}>✦ اكتب الرقم مع الوحدة: 200px أو 50%</p>
    <Row2>
      <F label="Max Width"><input value={s.maxWidth || ''} onChange={e => ch({ styles: { ...(b.styles || {}), maxWidth: e.target.value } })} placeholder="none" style={inp} /></F>
      <F label="Border Radius"><input value={s.borderRadius || ''} onChange={e => ch({ styles: { ...(b.styles || {}), borderRadius: e.target.value } })} placeholder="8px" style={inp} /></F>
    </Row2>
    <F label="Object Fit">
      <select value={s.objectFit || 'cover'} onChange={e => ch({ styles: { ...(b.styles || {}), objectFit: e.target.value } })} style={inp}>
        {['cover', 'contain', 'fill', 'none', 'scale-down'].map(v => <option key={v} value={v}>{v}</option>)}
      </select>
    </F>
    <AlignRow value={s.textAlign} onChange={v => ch({ styles: { ...(b.styles || {}), textAlign: v } })} />
    {show && <MediaPicker onSelect={m => { ch({ content: { ...c, src: m.url } }); setShow(false); }} onClose={() => setShow(false)} />}
  </>;
}

function VideoS({ b, ch }) {
  const c = b.content || {};
  return <>
    <F label="Video URL" mt={0}><input value={c.url || ''} onChange={e => ch({ content: { ...c, url: e.target.value } })} placeholder="YouTube URL or .mp4 link" style={inp} /></F>
    <F label="Title"><input value={c.title || ''} onChange={e => ch({ content: { ...c, title: e.target.value } })} style={inp} /></F>
  </>;
}

function ButtonS({ b, ch }) {
  const c = b.content || {}, s = b.styles || {};
  return <>
    <F label="Button Text" mt={0}><input value={c.text || ''} onChange={e => ch({ content: { ...c, text: e.target.value } })} style={inp} /></F>
    <F label="URL"><input value={c.href || ''} onChange={e => ch({ content: { ...c, href: e.target.value } })} placeholder="https://..." style={inp} /></F>
    <F label="Open in">
      <select value={c.target || '_blank'} onChange={e => ch({ content: { ...c, target: e.target.value } })} style={inp}>
        <option value="_blank">New Tab</option><option value="_self">Same Tab</option>
      </select>
    </F>
    <ColorRow label="Background" value={s.backgroundColor} onChange={v => ch({ styles: { ...(b.styles || {}), backgroundColor: v } })} />
    <ColorRow label="Text Color" value={s.color} onChange={v => ch({ styles: { ...(b.styles || {}), color: v } })} />
    <Row2>
      <F label="Font Size"><input value={s.fontSize || ''} onChange={e => ch({ styles: { ...(b.styles || {}), fontSize: e.target.value } })} placeholder="1rem" style={inp} /></F>
      <F label="Border Radius"><input value={s.borderRadius || ''} onChange={e => ch({ styles: { ...(b.styles || {}), borderRadius: e.target.value } })} placeholder="8px" style={inp} /></F>
    </Row2>
    <F label="Border"><input value={s.border || ''} onChange={e => ch({ styles: { ...(b.styles || {}), border: e.target.value } })} placeholder="2px solid #fff" style={inp} /></F>
    <AlignRow value={s.textAlign} onChange={v => ch({ styles: { ...(b.styles || {}), textAlign: v } })} />
  </>;
}

function SocialS({ b, ch }) {
  const c = b.content || {}, s = b.styles || {};
  const links = c.links || [];
  const upd = (i, k, v) => ch({ content: { ...c, links: links.map((l, idx) => idx === i ? { ...l, [k]: v } : l) } });
  return <>
    {links.map((l, i) => (
      <div key={i} style={{ background: 'var(--bg,#f8fafc)', border: '1px solid var(--border,#e2e8f0)', borderRadius: 6, padding: '0.4rem', marginBottom: 5, marginTop: i === 0 ? 0 : 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted,#64748b)' }}>Link {i + 1}</span>
          <button type="button" onClick={() => ch({ content: { ...c, links: links.filter((_, idx) => idx !== i) } })} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 3, padding: '1px 5px', fontSize: '0.68rem', cursor: 'pointer' }}>✕</button>
        </div>
        <select value={l.platform} onChange={e => upd(i, 'platform', e.target.value)} style={{ ...inp, marginBottom: 3 }}>
          {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <input value={l.url} onChange={e => upd(i, 'url', e.target.value)} placeholder="Profile URL" style={inp} />
      </div>
    ))}
    <button type="button" onClick={() => ch({ content: { ...c, links: [...links, { platform: 'facebook', url: '' }] } })}
      style={{ width: '100%', border: '2px dashed var(--border,#e2e8f0)', borderRadius: 5, padding: '5px', background: 'var(--bg,#f8fafc)', cursor: 'pointer', color: 'var(--muted,#64748b)', fontSize: '0.78rem', marginBottom: 8 }}>
      + Add Social Link
    </button>
    <Row2>
      <F label="Icon Size"><input value={s.iconSize || '44px'} onChange={e => ch({ styles: { ...(b.styles || {}), iconSize: e.target.value } })} placeholder="44px" style={inp} /></F>
      <AlignRow value={s.textAlign} onChange={v => ch({ styles: { ...(b.styles || {}), textAlign: v } })} label="Align" />
    </Row2>
  </>;
}

function HeroS({ b, ch }) {
  const c = b.content || {}, s = b.styles || {};
  const [show, setShow] = useState(false);
  return <>
    <F label="Title" mt={0}><input value={c.title || ''} onChange={e => ch({ content: { ...c, title: e.target.value } })} style={inp} /></F>
    <F label="Subtitle"><textarea value={c.subtitle || ''} onChange={e => ch({ content: { ...c, subtitle: e.target.value } })} rows={2} style={{ ...inp, resize: 'vertical' }} /></F>
    <Row2>
      <F label="Button Text"><input value={c.buttonText || ''} onChange={e => ch({ content: { ...c, buttonText: e.target.value } })} style={inp} /></F>
      <F label="Button Link"><input value={c.buttonLink || ''} onChange={e => ch({ content: { ...c, buttonLink: e.target.value } })} placeholder="https://..." style={inp} /></F>
    </Row2>
    <F label="Background Image">
      {c.backgroundImage
        ? <div><img src={c.backgroundImage} alt="" style={{ width: '100%', height: 55, objectFit: 'cover', borderRadius: 4, marginBottom: 4 }} />
          <div style={{ display: 'flex', gap: 4 }}>
            <button type="button" onClick={() => setShow(true)} style={{ ...inp, cursor: 'pointer', flex: 1, textAlign: 'center', background: 'var(--bg,#f8fafc)', padding: '4px' }}>Change</button>
            <button type="button" onClick={() => ch({ content: { ...c, backgroundImage: '' } })} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, padding: '4px 8px', fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer' }}>✕</button>
          </div></div>
        : <button type="button" onClick={() => setShow(true)} style={{ ...inp, cursor: 'pointer', textAlign: 'center', background: 'var(--bg,#f8fafc)', border: '2px dashed var(--border,#e2e8f0)', padding: '0.6rem' }}>+ Background Image</button>}
    </F>
    {c.backgroundImage && <Slider label="Overlay Opacity" value={s.overlayOpacity ?? 0.4} onChange={v => ch({ styles: { ...(b.styles || {}), overlayOpacity: v } })} display="%" />}
    <ColorRow label="Background Color" value={s.backgroundColor} onChange={v => ch({ styles: { ...(b.styles || {}), backgroundColor: v } })} />
    <ColorRow label="Text Color" value={s.color} onChange={v => ch({ styles: { ...(b.styles || {}), color: v } })} />
    <Row2>
      <F label="Min Height"><input value={s.minHeight || ''} onChange={e => ch({ styles: { ...(b.styles || {}), minHeight: e.target.value } })} placeholder="50vh" style={inp} /></F>
      <F label="Padding"><input value={s.padding || ''} onChange={e => ch({ styles: { ...(b.styles || {}), padding: e.target.value } })} placeholder="5rem 2rem" style={inp} /></F>
    </Row2>
    <AlignRow value={s.textAlign} onChange={v => ch({ styles: { ...(b.styles || {}), textAlign: v } })} />
    {show && <MediaPicker onSelect={m => { ch({ content: { ...c, backgroundImage: m.url } }); setShow(false); }} onClose={() => setShow(false)} />}
  </>;
}

function CardS({ b, ch }) {
  const c = b.content || {}, s = b.styles || {};
  const [show, setShow] = useState(false);
  return <>
    <F label="Image" mt={0}>
      {c.image
        ? <div><img src={c.image} alt="" style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 4, marginBottom: 4 }} /><button type="button" onClick={() => setShow(true)} style={{ ...inp, cursor: 'pointer', textAlign: 'center', background: 'var(--bg,#f8fafc)' }}>Change</button></div>
        : <button type="button" onClick={() => setShow(true)} style={{ ...inp, cursor: 'pointer', textAlign: 'center', background: 'var(--bg,#f8fafc)', border: '2px dashed var(--border,#e2e8f0)', padding: '0.6rem' }}>+ Card Image</button>}
    </F>
    <F label="Title"><input value={c.title || ''} onChange={e => ch({ content: { ...c, title: e.target.value } })} style={inp} /></F>
    <F label="Text"><textarea value={c.text || ''} onChange={e => ch({ content: { ...c, text: e.target.value } })} rows={3} style={{ ...inp, resize: 'vertical' }} /></F>
    <Row2>
      <F label="Button Text"><input value={c.buttonText || ''} onChange={e => ch({ content: { ...c, buttonText: e.target.value } })} style={inp} /></F>
      <F label="Button Link"><input value={c.buttonLink || ''} onChange={e => ch({ content: { ...c, buttonLink: e.target.value } })} placeholder="https://..." style={inp} /></F>
    </Row2>
    <ColorRow label="Background" value={s.backgroundColor} onChange={v => ch({ styles: { ...(b.styles || {}), backgroundColor: v } })} />
    <ColorRow label="Text Color" value={s.color} onChange={v => ch({ styles: { ...(b.styles || {}), color: v } })} />
    <Row2>
      <F label="Border Radius"><input value={s.borderRadius || ''} onChange={e => ch({ styles: { ...(b.styles || {}), borderRadius: e.target.value } })} placeholder="12px" style={inp} /></F>
      <F label="Shadow">
        <select value={s.boxShadow || ''} onChange={e => ch({ styles: { ...(b.styles || {}), boxShadow: e.target.value } })} style={inp}>
          {SHADOWS.map(p => <option key={p.l} value={p.v}>{p.l}</option>)}
        </select>
      </F>
    </Row2>
    {show && <MediaPicker onSelect={m => { ch({ content: { ...c, image: m.url } }); setShow(false); }} onClose={() => setShow(false)} />}
  </>;
}

function QuoteS({ b, ch }) {
  const c = b.content || {}, s = b.styles || {};
  return <>
    <F label="Quote Text" mt={0}><textarea value={c.text || ''} onChange={e => ch({ content: { ...c, text: e.target.value } })} rows={3} style={{ ...inp, resize: 'vertical' }} /></F>
    <F label="Author"><input value={c.author || ''} onChange={e => ch({ content: { ...c, author: e.target.value } })} style={inp} /></F>
    <F label="Role / Company"><input value={c.role || ''} onChange={e => ch({ content: { ...c, role: e.target.value } })} placeholder="CEO, Company" style={inp} /></F>
    <ColorRow label="Background" value={s.backgroundColor} onChange={v => ch({ styles: { ...(b.styles || {}), backgroundColor: v } })} />
    <ColorRow label="Border Color" value={s.borderColor} onChange={v => ch({ styles: { ...(b.styles || {}), borderColor: v } })} />
    <ColorRow label="Text Color" value={s.color} onChange={v => ch({ styles: { ...(b.styles || {}), color: v } })} />
  </>;
}

function HtmlS({ b, ch }) {
  const c = b.content || {};
  return <>
    <F label="HTML Code" mt={0}><textarea value={c.code || ''} onChange={e => ch({ content: { ...c, code: e.target.value } })} rows={9} style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.5 }} /></F>
    <p style={{ fontSize: '0.68rem', color: 'var(--faint,#94a3b8)', marginTop: 5, lineHeight: 1.5 }}>⚠ Raw HTML renders as-is on the published page.</p>
  </>;
}

function DividerS({ b, ch }) {
  const s = b.styles || {};
  return <>
    <ColorRow label="Color" value={s.borderColor} onChange={v => ch({ styles: { ...(b.styles || {}), borderColor: v } })} />
    <Row2>
      <F label="Thickness"><input value={s.borderWidth || '2px'} onChange={e => ch({ styles: { ...(b.styles || {}), borderWidth: e.target.value } })} placeholder="2px" style={inp} /></F>
      <F label="Style">
        <select value={s.borderStyle || 'solid'} onChange={e => ch({ styles: { ...(b.styles || {}), borderStyle: e.target.value } })} style={inp}>
          {['solid', 'dashed', 'dotted'].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </F>
    </Row2>
    <F label="Width"><input value={s.width || '100%'} onChange={e => ch({ styles: { ...(b.styles || {}), width: e.target.value } })} placeholder="100%" style={inp} /></F>
  </>;
}

function SpacerS({ b, ch }) {
  const c = b.content || {};
  return <>
    <F label="Height (px)" mt={0}><input type="number" value={c.height || 40} onChange={e => ch({ content: { height: +e.target.value } })} style={{ ...inp, maxWidth: 100 }} /></F>
    <Slider label="Visual" value={c.height || 40} onChange={v => ch({ content: { height: Math.round(v) } })} min={10} max={300} step={1} display="px" />
  </>;
}

function ColumnsS({ b, ch }) {
  const s = b.styles || {};
  return <>
    <p style={{ fontSize: '0.75rem', color: 'var(--muted,#64748b)', lineHeight: 1.5, marginBottom: 8 }}>Use the 2/3/4 switcher in the canvas. Click inner blocks to edit them.</p>
    <F label="Column Gap" mt={0}><input value={s.gap || '1.5rem'} onChange={e => ch({ styles: { ...(b.styles || {}), gap: e.target.value } })} placeholder="1.5rem" style={inp} /></F>
    <ColorRow label="Row Background" value={s.backgroundColor} onChange={v => ch({ styles: { ...(b.styles || {}), backgroundColor: v } })} />
    <F label="Padding"><input value={s.padding || ''} onChange={e => ch({ styles: { ...(b.styles || {}), padding: e.target.value } })} placeholder="0" style={inp} /></F>
  </>;
}

function FeaturesS({ b, ch }) {
  const c = b.content || {}, s = b.styles || {};
  const items = c.items || [];
  const upItem = (i, k, v) => ch({ content: { ...c, items: items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) } });
  return <>
    <F label="Layout" mt={0}>
      <select value={c.layout || 'vertical'} onChange={e => ch({ content: { ...c, layout: e.target.value } })} style={inp}>
        <option value="vertical">Vertical (list)</option>
        <option value="horizontal">Horizontal (row)</option>
        <option value="grid">Grid</option>
      </select>
    </F>
    <div style={{ marginTop: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: 'var(--bg,#f8fafc)', border: '1px solid var(--border,#e2e8f0)', borderRadius: 6, padding: '0.5rem', marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted,#64748b)' }}>Item {i + 1}</span>
            <button type="button" onClick={() => ch({ content: { ...c, items: items.filter((_, idx) => idx !== i) } })} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 3, padding: '1px 5px', fontSize: '0.68rem', cursor: 'pointer' }}>✕</button>
          </div>
          <Row2>
            <F label="Icon" mt={0}><input value={item.icon || ''} onChange={e => upItem(i, 'icon', e.target.value)} placeholder="⭐" style={{ ...inp, maxWidth: 56 }} /></F>
            <F label="Title" mt={0}><input value={item.title || ''} onChange={e => upItem(i, 'title', e.target.value)} style={inp} /></F>
          </Row2>
          <F label="Description"><input value={item.text || ''} onChange={e => upItem(i, 'text', e.target.value)} placeholder="Short description" style={inp} /></F>
        </div>
      ))}
      <button type="button" onClick={() => ch({ content: { ...c, items: [...items, { icon: '✦', title: 'New Feature', text: '' }] } })}
        style={{ width: '100%', border: '2px dashed var(--border,#e2e8f0)', borderRadius: 5, padding: '5px', background: 'var(--bg,#f8fafc)', cursor: 'pointer', color: 'var(--muted,#64748b)', fontSize: '0.78rem' }}>
        + Add Item
      </button>
    </div>
    <ColorRow label="Text Color" value={s.color} onChange={v => ch({ styles: { ...(b.styles || {}), color: v } })} />
    <ColorRow label="Icon Color" value={s.iconColor} onChange={v => ch({ styles: { ...(b.styles || {}), iconColor: v } })} />
    <F label="Icon Size"><input value={s.iconSize || '2rem'} onChange={e => ch({ styles: { ...(b.styles || {}), iconSize: e.target.value } })} placeholder="2rem" style={inp} /></F>
    <ColorRow label="Background" value={s.backgroundColor} onChange={v => ch({ styles: { ...(b.styles || {}), backgroundColor: v } })} />
    <F label="Gap"><input value={s.gap || '1.5rem'} onChange={e => ch({ styles: { ...(b.styles || {}), gap: e.target.value } })} placeholder="1.5rem" style={inp} /></F>
  </>;
}

function StatsS({ b, ch }) {
  const c = b.content || {}, s = b.styles || {};
  const items = c.items || [];
  const upItem = (i, k, v) => ch({ content: { ...c, items: items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) } });
  return <>
    <div style={{ marginTop: 0 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: 'var(--bg,#f8fafc)', border: '1px solid var(--border,#e2e8f0)', borderRadius: 6, padding: '0.5rem', marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted,#64748b)' }}>Stat {i + 1}</span>
            <button type="button" onClick={() => ch({ content: { ...c, items: items.filter((_, idx) => idx !== i) } })} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 3, padding: '1px 5px', fontSize: '0.68rem', cursor: 'pointer' }}>✕</button>
          </div>
          <Row2>
            <F label="Number" mt={0}><input value={item.number || ''} onChange={e => upItem(i, 'number', e.target.value)} placeholder="150+" style={inp} /></F>
            <F label="Label" mt={0}><input value={item.label || ''} onChange={e => upItem(i, 'label', e.target.value)} placeholder="Projects" style={inp} /></F>
          </Row2>
        </div>
      ))}
      <button type="button" onClick={() => ch({ content: { ...c, items: [...items, { number: '0', label: 'Label' }] } })}
        style={{ width: '100%', border: '2px dashed var(--border,#e2e8f0)', borderRadius: 5, padding: '5px', background: 'var(--bg,#f8fafc)', cursor: 'pointer', color: 'var(--muted,#64748b)', fontSize: '0.78rem' }}>
        + Add Stat
      </button>
    </div>
    <ColorRow label="Number Color" value={s.accentColor} onChange={v => ch({ styles: { ...(b.styles || {}), accentColor: v } })} />
    <ColorRow label="Label Color" value={s.color} onChange={v => ch({ styles: { ...(b.styles || {}), color: v } })} />
    <ColorRow label="Background" value={s.backgroundColor} onChange={v => ch({ styles: { ...(b.styles || {}), backgroundColor: v } })} />
    <AlignRow value={s.textAlign} onChange={v => ch({ styles: { ...(b.styles || {}), textAlign: v } })} />
  </>;
}

function GalleryS({ b, ch }) {
  const c = b.content || {}, s = b.styles || {};
  const items = c.items || [];
  const [showIdx, setShowIdx] = useState(null);
  const upItem = (i, k, v) => ch({ content: { ...c, items: items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) } });
  return <>
    <F label="Columns" mt={0}>
      <select value={c.columns || 3} onChange={e => ch({ content: { ...c, columns: +e.target.value } })} style={inp}>
        {[2, 3, 4].map(n => <option key={n} value={n}>{n} Columns</option>)}
      </select>
    </F>
    <div style={{ marginTop: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: 'var(--bg,#f8fafc)', border: '1px solid var(--border,#e2e8f0)', borderRadius: 6, padding: '0.5rem', marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted,#64748b)' }}>Image {i + 1}</span>
            <button type="button" onClick={() => ch({ content: { ...c, items: items.filter((_, idx) => idx !== i) } })} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 3, padding: '1px 5px', fontSize: '0.68rem', cursor: 'pointer' }}>✕</button>
          </div>
          {item.src
            ? <div><img src={item.src} alt="" style={{ width: '100%', height: 50, objectFit: 'cover', borderRadius: 4, marginBottom: 4 }} /><button type="button" onClick={() => setShowIdx(i)} style={{ ...inp, cursor: 'pointer', textAlign: 'center', padding: '3px', background: 'var(--bg,#f8fafc)' }}>Change</button></div>
            : <button type="button" onClick={() => setShowIdx(i)} style={{ ...inp, cursor: 'pointer', textAlign: 'center', background: 'var(--bg,#f8fafc)', border: '2px dashed var(--border,#e2e8f0)', padding: '0.4rem' }}>+ Image</button>}
          <Row2>
            <F label="Label"><input value={item.label || ''} onChange={e => upItem(i, 'label', e.target.value)} placeholder="Title" style={inp} /></F>
            <F label="Sublabel"><input value={item.sublabel || ''} onChange={e => upItem(i, 'sublabel', e.target.value)} placeholder="Subtitle" style={inp} /></F>
          </Row2>
        </div>
      ))}
      <button type="button" onClick={() => ch({ content: { ...c, items: [...items, { src: '', label: '', sublabel: '' }] } })}
        style={{ width: '100%', border: '2px dashed var(--border,#e2e8f0)', borderRadius: 5, padding: '5px', background: 'var(--bg,#f8fafc)', cursor: 'pointer', color: 'var(--muted,#64748b)', fontSize: '0.78rem' }}>
        + Add Image
      </button>
    </div>
    <Row2>
      <F label="Image Height"><input value={s.imageHeight || '240px'} onChange={e => ch({ styles: { ...(b.styles || {}), imageHeight: e.target.value } })} placeholder="240px" style={inp} /></F>
      <F label="Gap"><input value={s.gap || '1rem'} onChange={e => ch({ styles: { ...(b.styles || {}), gap: e.target.value } })} placeholder="1rem" style={inp} /></F>
    </Row2>
    <F label="Border Radius"><input value={s.borderRadius || '12px'} onChange={e => ch({ styles: { ...(b.styles || {}), borderRadius: e.target.value } })} placeholder="12px" style={inp} /></F>
    {showIdx !== null && <MediaPicker onSelect={m => { upItem(showIdx, 'src', m.url); setShowIdx(null); }} onClose={() => setShowIdx(null)} />}
  </>;
}

// ── map & labels ──────────────────────────────────────────────────────────────
const MAP = { heading: HeadingS, text: TextS, image: ImageS, video: VideoS, button: ButtonS, social: SocialS, hero: HeroS, card: CardS, quote: QuoteS, html: HtmlS, divider: DividerS, spacer: SpacerS, columns: ColumnsS, features: FeaturesS, stats: StatsS, gallery: GalleryS };
const LABELS = { heading: 'Heading', text: 'Text', image: 'Image', video: 'Video', button: 'Button', social: 'Social Links', hero: 'Hero', card: 'Card', quote: 'Quote', html: 'HTML', divider: 'Divider', spacer: 'Spacer', columns: 'Columns', features: 'Features', stats: 'Stats', gallery: 'Gallery' };
const ICONS  = { heading: 'H', text: '¶', image: '🖼', video: '▶', button: '⬛', social: '📱', hero: '◉', card: '▭', quote: '"', html: '<>', divider: '—', spacer: '↕', columns: '⊞', features: '✦', stats: '123', gallery: '▦' };

// ── main export ───────────────────────────────────────────────────────────────
export default function BlockSettings({ block, onChange }) {
  const [tab, setTab] = useState('content');

  if (!block) return (
    <aside style={{ width: 268, background: 'var(--bg,#f8fafc)', borderLeft: '1px solid var(--border,#e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem', color: 'var(--faint,#94a3b8)', padding: '2rem 1rem', textAlign: 'center', flexShrink: 0 }}>
      <div style={{ fontSize: '2.5rem', opacity: 0.35 }}>◧</div>
      <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>Click a block to edit</p>
    </aside>
  );

  const Comp = MAP[block.type];
  const tabs = [
    { id: 'content', label: 'Content' },
    ...(block.type !== 'html' ? [{ id: 'style', label: 'Style' }] : []),
    { id: 'advanced', label: 'Advanced' },
  ];

  // reset tab if current tab no longer valid
  const validTabs = tabs.map(t => t.id);
  const activeTab = validTabs.includes(tab) ? tab : 'content';

  return (
    <aside style={{ width: 268, background: 'var(--bg,#f8fafc)', borderLeft: '1px solid var(--border,#e2e8f0)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '0.6rem 0.875rem 0.5rem', borderBottom: '1px solid var(--border,#e2e8f0)', background: 'var(--surface,#fff)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
          <div style={{ width: 22, height: 22, borderRadius: 4, background: 'var(--accent,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0 }}>
            {ICONS[block.type] || '⬛'}
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--faint,#94a3b8)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Block</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text,#1e293b)', lineHeight: 1.1 }}>{LABELS[block.type] || block.type}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {tabs.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: '4px 5px', border: `1px solid ${activeTab === t.id ? 'var(--accent,#2563eb)' : 'var(--border,#e2e8f0)'}`, borderRadius: 5, background: activeTab === t.id ? 'var(--accent,#2563eb)' : 'transparent', color: activeTab === t.id ? '#fff' : 'var(--muted,#64748b)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab body */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem' }}>
        {activeTab === 'content' && (
          <div style={{ padding: '0.75rem 0.875rem' }}>
            {Comp && <Comp b={block} ch={onChange} />}
          </div>
        )}
        {activeTab === 'style' && block.type !== 'html' && (
          <StyleTab block={block} onChange={onChange} />
        )}
        {activeTab === 'advanced' && (
          <AdvancedTab block={block} onChange={onChange} />
        )}
      </div>
    </aside>
  );
}
