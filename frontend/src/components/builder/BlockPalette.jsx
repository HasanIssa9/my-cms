import { BLOCK_CATEGORIES } from './blocks.js';

export default function BlockPalette({ onAdd }) {
  return (
    <aside style={{
      width: 220, minWidth: 180, background: '#1e293b', color: '#f1f5f9',
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
      borderRight: '1px solid #0f172a', flexShrink: 0,
    }}>
      <div style={{ padding: '0.75rem 1rem 0.5rem', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em', color: '#64748b', textTransform: 'uppercase' }}>
        Add Blocks
      </div>

      {BLOCK_CATEGORIES.map(cat => (
        <div key={cat.label} style={{ marginBottom: '0.25rem' }}>
          <div style={{ padding: '0.5rem 1rem 0.35rem', fontSize: '0.6rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(0,0,0,0.15)' }}>
            {cat.label}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', padding: '6px 8px' }}>
            {cat.blocks.map(({ type, icon, label, desc }) => (
              <button
                key={type}
                onClick={() => onAdd(type)}
                title={desc}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '0.3rem', padding: '0.6rem 0.4rem',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  color: '#cbd5e1', cursor: 'pointer', textAlign: 'center',
                  borderRadius: 8, transition: 'all 0.14s', minHeight: 64,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#334155';
                  e.currentTarget.style.color = '#f1f5f9';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = '#cbd5e1';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <span style={{ fontSize: '1.35rem', lineHeight: 1, display: 'block' }}>{icon}</span>
                <span style={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.2, letterSpacing: '0.01em' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div style={{ flex: 1 }} />
      <div style={{ padding: '0.65rem 1rem', borderTop: '1px solid #334155', fontSize: '0.65rem', color: '#475569', lineHeight: 1.5, textAlign: 'center' }}>
        Click to add · Drag ⠿ to reorder
      </div>
    </aside>
  );
}
