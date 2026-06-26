import { useState } from 'react';
import { createBlock, BLOCK_TYPES, uid } from './blocks.js';
import BlockPreview from './BlockPreview.jsx';

const INNER_ALLOWED = ['heading', 'text', 'image', 'video', 'button', 'social', 'divider', 'spacer', 'quote', 'html', 'card'];

export default function ColumnsBlock({ block, onChange, selectedInner, onSelectInner }) {
  const { content = {}, styles = {} } = block;
  const cols = content.cols || [[], []];
  const count = content.count || cols.length;
  const [addingToCol, setAddingToCol] = useState(null);

  function updateCol(colIdx, newBlocks) {
    const updated = cols.map((c, i) => i === colIdx ? newBlocks : c);
    onChange({ content: { ...content, cols: updated } });
  }

  function addToCol(colIdx, type) {
    const b = createBlock(type);
    const updated = cols.map((c, i) => i === colIdx ? [...c, b] : c);
    onChange({ content: { ...content, cols: updated } });
    onSelectInner({ id: block.id, colIdx, innerId: b.id });
    setAddingToCol(null);
  }

  function deleteInner(colIdx, innerId) {
    updateCol(colIdx, cols[colIdx].filter(b => b.id !== innerId));
    if (selectedInner?.innerId === innerId) onSelectInner(null);
  }

  function moveInner(colIdx, innerId, dir) {
    const col = [...cols[colIdx]];
    const idx = col.findIndex(b => b.id === innerId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= col.length) return;
    [col[idx], col[newIdx]] = [col[newIdx], col[idx]];
    updateCol(colIdx, col);
  }

  function setCount(n) {
    const newCols = Array.from({ length: n }, (_, i) => cols[i] || []);
    onChange({ content: { ...content, count: n, cols: newCols } });
  }

  const gap = styles.gap || '1rem';
  const gridCols = `repeat(${count}, 1fr)`;

  return (
    <div style={{
      backgroundColor: styles.backgroundColor || undefined,
      backgroundImage: (styles.backgroundImage?.startsWith('linear') || styles.backgroundImage?.startsWith('radial')) ? styles.backgroundImage : undefined,
      padding: styles.padding || undefined,
      borderRadius: styles.borderRadius || undefined,
      minHeight: styles.minHeight || undefined,
    }}>
      {/* Column count switcher */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[2, 3, 4].map(n => (
          <button key={n} onClick={e => { e.stopPropagation(); setCount(n); }}
            style={{ flex: 1, padding: '3px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', background: count === n ? '#2563eb' : '#f1f5f9', color: count === n ? '#fff' : '#374151' }}>
            {n} cols
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap }}>
        {cols.slice(0, count).map((col, colIdx) => (
          <div key={colIdx}
            style={{ border: '1.5px dashed #cbd5e1', borderRadius: 8, padding: '0.5rem', background: '#f8fafc', minHeight: 80, position: 'relative' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Column {colIdx + 1}</div>

            {/* Inner blocks */}
            {col.map((innerBlock, innerIdx) => {
              const isSelInner = selectedInner?.colIdx === colIdx && selectedInner?.innerId === innerBlock.id;
              return (
                <div key={innerBlock.id}
                  onClick={e => { e.stopPropagation(); onSelectInner({ id: block.id, colIdx, innerId: innerBlock.id }); }}
                  style={{ border: `1.5px solid ${isSelInner ? '#2563eb' : '#e2e8f0'}`, borderRadius: 6, padding: '0.4rem', marginBottom: 4, background: '#fff', cursor: 'pointer', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 2, right: 2, display: 'flex', gap: 2, zIndex: 2 }}>
                    <button onClick={e => { e.stopPropagation(); moveInner(colIdx, innerBlock.id, -1); }} disabled={innerIdx === 0}
                      style={miniBtn(innerIdx !== 0)}>↑</button>
                    <button onClick={e => { e.stopPropagation(); moveInner(colIdx, innerBlock.id, 1); }} disabled={innerIdx === col.length - 1}
                      style={miniBtn(innerIdx !== col.length - 1)}>↓</button>
                    <button onClick={e => { e.stopPropagation(); deleteInner(colIdx, innerBlock.id); }}
                      style={{ ...miniBtn(true), background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>✕</button>
                  </div>
                  <div style={{ paddingRight: 50 }}>
                    <BlockPreview block={innerBlock} />
                  </div>
                </div>
              );
            })}

            {/* Add block to column */}
            {addingToCol === colIdx ? (
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.4rem', marginTop: 4 }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Pick a block:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {INNER_ALLOWED.map(t => (
                    <button key={t} onClick={() => addToCol(colIdx, t)}
                      style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer', color: '#374151', fontWeight: 500 }}>
                      {t}
                    </button>
                  ))}
                </div>
                <button onClick={() => setAddingToCol(null)} style={{ marginTop: 4, background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.7rem', cursor: 'pointer' }}>Cancel</button>
              </div>
            ) : (
              <button onClick={e => { e.stopPropagation(); setAddingToCol(colIdx); }}
                style={{ width: '100%', background: 'none', border: '1px dashed #cbd5e1', borderRadius: 5, padding: '4px', fontSize: '0.72rem', color: '#94a3b8', cursor: 'pointer', marginTop: 4 }}>
                + Add Block
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function miniBtn(enabled) {
  return {
    background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: 3, padding: '1px 4px',
    fontSize: '0.65rem', cursor: enabled ? 'pointer' : 'not-allowed', color: '#64748b',
    opacity: enabled ? 1 : 0.3,
  };
}
