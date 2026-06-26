import { getYoutubeId, SOCIAL_PLATFORMS } from './blocks.js';

export function renderInlineStyle(s = {}) {
  return Object.fromEntries(
    Object.entries(s).filter(([, v]) => v != null && v !== '')
  );
}

function SocialIcon({ platform, size = 40 }) {
  const p = SOCIAL_PLATFORMS.find(x => x.id === platform) || SOCIAL_PLATFORMS[0];
  return (
    <div style={{ width: size, height: size, background: p.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: Math.floor(size * 0.38), fontWeight: 700, flexShrink: 0, userSelect: 'none' }}>
      {p.icon}
    </div>
  );
}

function MiniBlockList({ blocks = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minHeight: 40 }}>
      {blocks.map(b => (
        <div key={b.id} style={{ fontSize: '0.78rem', color: '#64748b', background: '#f8fafc', borderRadius: 4, padding: '0.3rem 0.5rem', border: '1px solid #e2e8f0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {b.type === 'heading' ? <strong>{b.content?.text || 'Heading'}</strong>
          : b.type === 'text'    ? b.content?.text || 'Text'
          : b.type === 'image'   ? '🖼 Image'
          : b.type === 'button'  ? `⬛ ${b.content?.text || 'Button'}`
          : b.type === 'social'  ? '📱 Social Links'
          : b.type === 'divider' ? '— Divider'
          : b.type === 'spacer'  ? `↕ ${b.content?.height || 40}px`
          : b.type === 'video'   ? '▶ Video'
          : b.type === 'quote'    ? `"${b.content?.text?.slice(0, 30) || 'Quote'}"`
          : b.type === 'features' ? `✦ Features (${b.content?.items?.length || 0})`
          : b.type === 'stats'    ? `123 Stats (${b.content?.items?.length || 0})`
          : b.type === 'gallery'  ? `▦ Gallery (${b.content?.items?.length || 0})`
          : b.type}
        </div>
      ))}
      {blocks.length === 0 && <div style={{ color: '#cbd5e1', fontSize: '0.75rem', textAlign: 'center', padding: '0.5rem' }}>Empty column</div>}
    </div>
  );
}

// If value is a plain number (e.g. "200"), append "px" so CSS is valid
function px(v) {
  if (!v && v !== 0) return v;
  return /^\d+(\.\d+)?$/.test(String(v).trim()) ? `${v}px` : v;
}

// Build the wrapper/container styles from the styles object
// All "box model" properties go here so height/backgroundColor/padding all work together
function buildWrapperStyle(s = {}) {
  const st = {};
  const v = (k) => s[k] != null && s[k] !== '';

  // Size — auto-append px if bare number
  if (v('width'))      st.width      = px(s.width);
  if (v('maxWidth'))   st.maxWidth   = px(s.maxWidth);
  if (v('height'))     st.height     = px(s.height);
  if (v('minHeight'))  st.minHeight  = px(s.minHeight);

  // Spacing
  if (v('margin'))     st.margin     = s.margin;
  if (v('padding'))    st.padding    = s.padding;

  // Background
  if (v('backgroundColor')) st.backgroundColor = s.backgroundColor;
  if (v('backgroundImage') && (s.backgroundImage?.startsWith('linear') || s.backgroundImage?.startsWith('radial'))) {
    st.backgroundImage = s.backgroundImage;
    st.backgroundSize  = 'cover';
  }

  // Border
  if (v('borderWidth')) {
    st.border = `${s.borderWidth} ${s.borderStyle || 'solid'} ${s.borderColor || 'transparent'}`;
  }
  if (v('borderRadius')) st.borderRadius = s.borderRadius;

  // Shadow & effects
  if (v('boxShadow'))                                      st.boxShadow   = s.boxShadow;
  if (v('opacity') && parseFloat(s.opacity) !== 1)        st.opacity     = s.opacity;
  if (v('transform'))                                      st.transform   = s.transform;
  if (v('filter'))                                         st.filter      = s.filter;
  if (v('transition'))                                     st.transition  = s.transition;
  if (v('mixBlendMode') && s.mixBlendMode !== 'normal')   st.mixBlendMode = s.mixBlendMode;
  if (v('cursor') && s.cursor !== 'default')              st.cursor      = s.cursor;

  // Position
  if (v('overflow'))   st.overflow  = s.overflow;
  if (v('zIndex'))     st.zIndex    = s.zIndex;
  if (v('position') && s.position !== 'static') {
    st.position = s.position;
    if (v('top'))    st.top    = s.top;
    if (v('right'))  st.right  = s.right;
    if (v('bottom')) st.bottom = s.bottom;
    if (v('left'))   st.left   = s.left;
  }
  return st;
}

function innerBlock(type, content, s = {}) {
  switch (type) {
    case 'columns': {
      const cols = content.cols || [[], []];
      const count = content.count || cols.length || 2;
      return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count},1fr)`, gap: s.gap || '1rem' }}>
          {cols.map((col, i) => (
            <div key={i} style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 6, padding: '0.5rem', minHeight: 60 }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>Col {i+1}</div>
              <MiniBlockList blocks={col} />
            </div>
          ))}
        </div>
      );
    }

    case 'hero': {
      const bgStyle = content.backgroundImage
        ? { backgroundImage: `url(${content.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: s.backgroundColor || '#1e3a5f' };
      const align = s.textAlign || 'center';
      const itemAlign = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
      return (
        <div style={{ ...bgStyle, borderRadius: 8, padding: s.padding || '3rem 2rem', textAlign: align, minHeight: s.minHeight || 120, display: 'flex', flexDirection: 'column', alignItems: itemAlign, justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {content.backgroundImage && (
            <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${s.overlayOpacity || 0.4})` }} />
          )}
          <div style={{ position: 'relative', zIndex: 1, fontFamily: s.fontFamily || undefined }}>
            <h1 style={{ color: s.color || '#fff', fontSize: s.fontSize || 'clamp(1.4rem,3vw,2.2rem)', fontWeight: s.fontWeight || 800, margin: '0 0 0.5rem', lineHeight: 1.2, textTransform: s.textTransform || undefined, letterSpacing: s.letterSpacing || undefined }}>{content.title || 'Hero Title'}</h1>
            {content.subtitle && <p style={{ color: s.color ? s.color + 'cc' : 'rgba(255,255,255,0.85)', fontSize: '1rem', margin: '0 0 1rem', maxWidth: 500 }}>{content.subtitle}</p>}
            {content.buttonText && (
              <span style={{ display: 'inline-block', background: '#fff', color: s.backgroundColor || '#1e3a5f', padding: '0.5rem 1.5rem', borderRadius: 6, fontWeight: 700, fontSize: '0.9rem' }}>{content.buttonText}</span>
            )}
          </div>
        </div>
      );
    }

    case 'card':
      return (
        <div style={{ background: s.backgroundColor || '#fff', borderRadius: s.borderRadius || 12, boxShadow: s.boxShadow || '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {content.image && <img src={content.image} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />}
          {!content.image && <div style={{ width: '100%', height: 80, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>🖼 No Image</div>}
          <div style={{ padding: s.padding || '1.25rem' }}>
            <h3 style={{ color: s.color || '#1e293b', margin: '0 0 0.5rem', fontSize: s.fontSize || '1.1rem', fontWeight: s.fontWeight || 700, fontFamily: s.fontFamily || undefined }}>{content.title || 'Card Title'}</h3>
            {content.text && <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>{content.text}</p>}
            {content.buttonText && <span style={{ display: 'inline-block', marginTop: '0.75rem', background: '#2563eb', color: '#fff', padding: '0.4rem 1rem', borderRadius: 6, fontSize: '0.82rem', fontWeight: 600 }}>{content.buttonText}</span>}
          </div>
        </div>
      );

    case 'quote':
      return (
        <blockquote style={{ borderLeft: `4px solid ${s.borderColor || '#2563eb'}`, background: s.backgroundColor || '#eff6ff', padding: s.padding || '1.25rem 1.25rem 1.25rem 2rem', borderRadius: '0 8px 8px 0', margin: 0 }}>
          <p style={{ color: s.color || '#1e293b', fontSize: s.fontSize || '1.05rem', lineHeight: s.lineHeight || 1.7, fontStyle: 'italic', margin: '0 0 0.75rem', fontFamily: s.fontFamily || undefined }}>"{content.text || 'Quote text'}"</p>
          {content.author && <footer style={{ color: '#64748b', fontSize: '0.82rem' }}>— <strong>{content.author}</strong>{content.role ? `, ${content.role}` : ''}</footer>}
        </blockquote>
      );

    case 'html':
      return (
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.78rem', color: '#94a3b8', maxHeight: 120, overflow: 'hidden' }}>
          <div style={{ color: '#60a5fa', marginBottom: 4, fontSize: '0.7rem', fontWeight: 700 }}>&lt;/&gt; HTML Block</div>
          <pre style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{content.code || '<!-- HTML code -->'}</pre>
        </div>
      );

    case 'heading': {
      const Tag = `h${content.level || 2}`;
      const sz = { 1: '2rem', 2: '1.6rem', 3: '1.25rem', 4: '1.05rem', 5: '0.95rem', 6: '0.85rem' };
      return (
        <Tag style={{
          margin: 0,
          color: s.color || '#1e293b',
          fontSize: s.fontSize || sz[content.level || 2],
          fontWeight: s.fontWeight || '700',
          textAlign: s.textAlign || 'left',
          lineHeight: s.lineHeight || 1.3,
          letterSpacing: s.letterSpacing || undefined,
          textTransform: s.textTransform || undefined,
          textDecoration: s.textDecoration || undefined,
          fontFamily: s.fontFamily || undefined,
        }}>
          {content.text || 'Heading'}
        </Tag>
      );
    }

    case 'text':
      return (
        <p style={{
          margin: 0,
          color: s.color || '#374151',
          fontSize: s.fontSize || '1rem',
          fontWeight: s.fontWeight || undefined,
          textAlign: s.textAlign || 'left',
          lineHeight: s.lineHeight || '1.8',
          letterSpacing: s.letterSpacing || undefined,
          textTransform: s.textTransform || undefined,
          textDecoration: s.textDecoration || undefined,
          fontFamily: s.fontFamily || undefined,
          whiteSpace: 'pre-wrap',
        }}>
          {content.text || 'Text block'}
        </p>
      );


    case 'image': {
      if (!content.src) {
        return <div style={{ background: '#f1f5f9', border: '2px dashed #cbd5e1', borderRadius: 8, padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>🖼 No image — click settings to pick one</div>;
      }
      const imgW  = px(s.width)  || '100%';
      const imgH  = px(s.height) || 'auto';
      const hasExplicitW = !!(s.width && s.width !== '');
      // '100%' is the old default — ignore it when user set explicit width
      const hasExplicitMaxW = s.maxWidth && s.maxWidth !== '100%';
      const imgMaxW = hasExplicitMaxW ? px(s.maxWidth) : (hasExplicitW ? 'none' : '100%');
      const imgAlign = s.textAlign || 'center';
      const imgMargin = imgAlign === 'center' ? '0 auto' : imgAlign === 'right' ? '0 0 0 auto' : '0';
      return (
        <div style={{ textAlign: imgAlign }}>
          <img
            src={content.src} alt={content.alt || content.title || ''}
            style={{
              display: 'block',
              width: imgW,
              height: imgH,
              maxWidth: imgMaxW,
              objectFit: s.objectFit || 'cover',
              borderRadius: px(s.borderRadius) || undefined,
              filter: s.filter || undefined,
              margin: imgMargin,
            }}
          />
        </div>
      );
    }

    case 'video': {
      const ytId = content.url ? getYoutubeId(content.url) : null;
      if (ytId) return (
        <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 8, overflow: 'hidden', background: '#000' }}>
          <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(0,0,0,0.65)', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem' }}>▶</div>
          </div>
        </div>
      );
      return <div style={{ background: '#0f172a', borderRadius: 8, padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>▶ No video URL — click settings to add one</div>;
    }

    case 'button':
      return (
        <div style={{ textAlign: s.textAlign || 'center', padding: '0.25rem 0' }}>
          <span style={{
            display: 'inline-block',
            background: s.backgroundColor || '#2563eb',
            color: s.color || '#fff',
            borderRadius: s.borderRadius || 8,
            padding: s.padding || '0.6rem 1.5rem',
            fontWeight: s.fontWeight || 600,
            fontSize: s.fontSize || '1rem',
            fontFamily: s.fontFamily || undefined,
            letterSpacing: s.letterSpacing || undefined,
            textTransform: s.textTransform || undefined,
            border: s.borderWidth ? `${s.borderWidth} ${s.borderStyle || 'solid'} ${s.borderColor || 'transparent'}` : (s.border || 'none'),
            boxShadow: s.boxShadow || undefined,
            width: s.width || undefined,
          }}>
            {content.text || 'Button'}
          </span>
        </div>
      );

    case 'social': {
      const links = content.links || [];
      const sz = parseInt(s.iconSize) || 44;
      const justify = s.textAlign === 'right' ? 'flex-end' : s.textAlign === 'center' ? 'center' : 'flex-start';
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: s.gap || '10px', justifyContent: justify, padding: s.padding || '0.25rem 0' }}>
          {links.map((l, i) => <SocialIcon key={i} platform={l.platform} size={sz} />)}
          {links.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>No social links yet</span>}
        </div>
      );
    }

    case 'features': {
      const items = content.items || [];
      const layout = content.layout || 'vertical';
      const isHoriz = layout === 'horizontal';
      const isGrid = layout === 'grid';
      const accentCol = s.iconColor || '#c9a84c';
      const textCol = s.color || '#fff';
      return (
        <div style={{
          background: s.backgroundColor || undefined,
          padding: s.padding || '0.5rem 0',
          display: isGrid ? 'grid' : 'flex',
          flexDirection: isHoriz ? 'row' : 'column',
          flexWrap: isHoriz ? 'wrap' : undefined,
          gridTemplateColumns: isGrid ? 'repeat(auto-fill,minmax(160px,1fr))' : undefined,
          gap: s.gap || (isHoriz ? '1.5rem' : '1rem'),
        }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{ fontSize: s.iconSize || '1.6rem', color: accentCol, flexShrink: 0, lineHeight: 1 }}>{item.icon || '✦'}</span>
              <div>
                <div style={{ color: textCol, fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>{item.title || 'Feature'}</div>
                {item.text && <div style={{ color: textCol + '99', fontSize: '0.82rem', marginTop: 2, lineHeight: 1.5 }}>{item.text}</div>}
              </div>
            </div>
          ))}
          {items.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>No features yet</span>}
        </div>
      );
    }

    case 'stats': {
      const items = content.items || [];
      const accentCol = s.accentColor || '#c9a84c';
      const textCol = s.color || '#fff';
      return (
        <div style={{ background: s.backgroundColor || undefined, padding: s.padding || '1rem 0', display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length || 4, 4)},1fr)`, gap: '1rem', textAlign: s.textAlign || 'center' }}>
          {items.map((item, i) => (
            <div key={i} style={{ padding: '0.75rem 0.5rem', borderRight: i < items.length - 1 ? `1px solid ${accentCol}33` : undefined }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: accentCol, lineHeight: 1 }}>{item.number || '0'}</div>
              <div style={{ color: textCol + 'cc', fontSize: '0.8rem', marginTop: 4, fontWeight: 600 }}>{item.label || 'Label'}</div>
            </div>
          ))}
          {items.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>No stats yet</span>}
        </div>
      );
    }

    case 'gallery': {
      const items = content.items || [];
      const cols = content.columns || 3;
      const imgH = s.imageHeight || '180px';
      const radius = s.borderRadius || '10px';
      const gap = s.gap || '0.75rem';
      return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap }}>
          {items.map((item, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: radius, overflow: 'hidden', background: '#1e293b' }}>
              {item.src
                ? <img src={item.src} alt={item.label || ''} style={{ width: '100%', height: imgH, objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: imgH, background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem' }}>🖼</div>
              }
              {(item.label || item.sublabel) && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: s.overlayColor || 'rgba(0,0,0,0.55)', padding: '0.5rem 0.75rem' }}>
                  {item.label && <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{item.label}</div>}
                  {item.sublabel && <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem' }}>{item.sublabel}</div>}
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && <div style={{ gridColumn: '1/-1', color: '#94a3b8', textAlign: 'center', fontSize: '0.82rem', padding: '1rem' }}>No gallery items yet</div>}
        </div>
      );
    }

    case 'divider':
      return (
        <div style={{ padding: s.margin || '0.5rem 0' }}>
          <hr style={{ border: 'none', borderTop: `${s.borderWidth || '1px'} ${s.borderStyle || 'solid'} ${s.borderColor || '#e2e8f0'}`, margin: 0, width: s.width || '100%' }} />
        </div>
      );

    case 'spacer':
      return (
        <div style={{ height: content.height || 40, background: 'repeating-linear-gradient(45deg,#f8fafc,#f8fafc 4px,#e2e8f0 4px,#e2e8f0 8px)', borderRadius: 4, position: 'relative' }}>
          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, background: '#fff', padding: '0 4px' }}>{content.height || 40}px</span>
        </div>
      );

    default:
      return <div style={{ color: '#94a3b8', padding: '0.5rem', fontSize: '0.82rem' }}>Unknown block: {type}</div>;
  }
}

export default function BlockPreview({ block }) {
  const { type, content = {}, styles = {} } = block;
  const inner = innerBlock(type, content, styles);
  const wrapSt = buildWrapperStyle(styles);

  // Self-managed blocks handle their own layout; only wrap if there are explicit box-model overrides
  const selfManaged = ['hero', 'card', 'quote', 'columns', 'html', 'image', 'video', 'divider', 'spacer', 'features', 'stats', 'gallery'].includes(type);
  if (selfManaged && Object.keys(wrapSt).length === 0) return inner;

  // For non-self-managed blocks, always use a wrapper div so backgroundColor/padding/height take effect
  const finalSt = { ...wrapSt };

  // If no explicit padding was set by the user, apply a minimal default for non-self-managed blocks
  if (!wrapSt.padding && !selfManaged) {
    finalSt.padding = styles.padding || '0.15rem 0';
  }

  // If height or minHeight is set but no padding, use flex centering so content stays visible
  if (!wrapSt.padding && !selfManaged && (wrapSt.height || wrapSt.minHeight)) {
    finalSt.display = 'flex';
    finalSt.alignItems = 'center';
  }

  return <div style={finalSt}>{inner}</div>;
}
