import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BlockPalette from '../components/builder/BlockPalette.jsx';
import BlockPreview from '../components/builder/BlockPreview.jsx';
import BlockSettings from '../components/builder/BlockSettings.jsx';
import ColumnsBlock from '../components/builder/ColumnsBlock.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import { createBlock } from '../components/builder/blocks.js';
import api from '../api.js';


// ─── Parse saved content ──────────────────────────────────────────────────────
function parseContent(raw) {
  if (!raw) return { blocks: [], meta: {} };
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw new Error();
    const meta = arr[0]?.type === '__meta__' ? arr[0] : {};
    const blocks = arr[0]?.type === '__meta__' ? arr.slice(1) : arr;
    return { blocks, meta };
  } catch {
    return { blocks: raw.trim() ? [{ id: 'legacy', type: 'text', content: { text: raw.replace(/<[^>]+>/g,'') }, styles: {}, animation: 'fadeIn' }] : [], meta: {} };
  }
}

// ─── Sortable block wrapper ───────────────────────────────────────────────────
function SortableBlock({ block, isSelected, onSelect, onDelete, onDuplicate, onMoveUp, onMoveDown, isFirst, isLast, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const typeLabel = { columns:'Columns', hero:'Hero', card:'Card', quote:'Quote', html:'HTML', heading:'Heading', text:'Text', image:'Image', video:'Video', button:'Button', social:'Social', divider:'Divider', spacer:'Spacer' };

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 50 : 'auto', position: 'relative' }}>
      {/* Top toolbar — visible on hover or when selected */}
      <div className={`block-bar ${isSelected ? 'bar-selected' : ''}`}
        style={{ position:'absolute', top:-1, left:-1, right:-1, zIndex:10, background: isSelected ? '#2563eb' : '#475569', borderRadius:'8px 8px 0 0', display:'flex', alignItems:'center', padding:'2px 5px', gap:3 }}>
        <span {...attributes} {...listeners} title="Drag" style={{ cursor:'grab', color:'rgba(255,255,255,0.7)', fontSize:'0.95rem', padding:'0 4px', userSelect:'none' }}>⠿</span>
        <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.06em', flex:1, textTransform:'uppercase' }}>{typeLabel[block.type]||block.type}</span>
        <button onClick={e=>{e.stopPropagation();onMoveUp();}} disabled={isFirst} style={tb(!isFirst)}>↑</button>
        <button onClick={e=>{e.stopPropagation();onMoveDown();}} disabled={isLast} style={tb(!isLast)}>↓</button>
        <button onClick={e=>{e.stopPropagation();onDuplicate();}} style={tb(true)}>⧉</button>
        <button onClick={e=>{e.stopPropagation();onDelete();}} style={{...tb(true), background:'rgba(239,68,68,0.8)'}}>✕</button>
      </div>

      <div onClick={()=>onSelect(block.id)}
        style={{ border: isSelected ? '2px solid #2563eb' : '1px solid transparent', borderRadius:8, transition:'border-color 0.12s', background:'transparent', cursor:'default', paddingTop: 18 }}
        onMouseEnter={e=>{e.currentTarget.querySelector('.block-bar')?.classList.add('bar-hover');}}
        onMouseLeave={e=>{e.currentTarget.querySelector('.block-bar')?.classList.remove('bar-hover');}}>
        <div style={{ padding: '0.5rem 0.75rem 0.75rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function tb(en) {
  return { background: en ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)', border:'none', color:'#fff', borderRadius:3, padding:'2px 6px', fontSize:'0.7rem', cursor: en ? 'pointer' : 'not-allowed', opacity: en ? 1 : 0.3 };
}

// ─── Main editor ──────────────────────────────────────────────────────────────
export default function EditPost({ type }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const label = type === 'post' ? 'Post' : 'Page';

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState('draft');
  const [featuredImage, setFeaturedImage] = useState('');
  const [pageColor, setPageColor] = useState('#ffffff');
  const [pagePadding, setPagePadding] = useState('2rem');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [coverImage, setCoverImage] = useState('');

  // selectedPath: null | { id } | { id, colIdx, innerId }
  const [selectedPath, setSelectedPath] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!isNew) {
      api.get(`/posts/${id}`).then(r => {
        const p = r.data;
        setTitle(p.title);
        setSlug(p.slug || '');
        setExcerpt(p.excerpt || '');
        setStatus(p.status);
        setFeaturedImage(p.featured_image || '');
        const { blocks: b, meta } = parseContent(p.content);
        setBlocks(b);
        if (meta.pageColor) setPageColor(meta.pageColor);
        if (meta.pagePadding) setPagePadding(meta.pagePadding);
        if (meta.content?.coverImage) setCoverImage(meta.content.coverImage);
      }).catch(err => {
        if (err?.response?.status === 404) {
          navigate(`/admin/${type}s`);
        }
      });
    }
  }, [id]);

  // ── Selected block resolution ─────────────────────────────────────────────
  const selectedBlock = useCallback(() => {
    if (!selectedPath) return null;
    const top = blocks.find(b => b.id === selectedPath.id);
    if (!top) return null;
    if (selectedPath.innerId != null && top.type === 'columns') {
      const col = top.content?.cols?.[selectedPath.colIdx] || [];
      return col.find(b => b.id === selectedPath.innerId) || null;
    }
    return top;
  }, [blocks, selectedPath])();

  // ── Update block (top or nested) ──────────────────────────────────────────
  function updateBlock(changes) {
    if (!selectedPath) return;
    setBlocks(prev => prev.map(b => {
      if (b.id !== selectedPath.id) return b;
      if (selectedPath.innerId != null && b.type === 'columns') {
        const cols = (b.content?.cols || []).map((col, ci) => {
          if (ci !== selectedPath.colIdx) return col;
          return col.map(inner => inner.id === selectedPath.innerId ? { ...inner, ...changes } : inner);
        });
        return { ...b, content: { ...b.content, cols } };
      }
      return { ...b, ...changes };
    }));
  }

  // ── Update columns block content (from ColumnsBlock component) ────────────
  function updateColumnsBlock(id, changes) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...changes } : b));
  }

  function handleDragEnd({ active, over }) {
    if (over && active.id !== over.id) {
      setBlocks(prev => {
        const oi = prev.findIndex(b => b.id === active.id);
        const ni = prev.findIndex(b => b.id === over.id);
        return arrayMove(prev, oi, ni);
      });
    }
  }

  function addBlock(type) {
    const block = createBlock(type);
    setBlocks(prev => [...prev, block]);
    setSelectedPath({ id: block.id });
  }

  function deleteBlock(id) {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedPath?.id === id) setSelectedPath(null);
  }

  function duplicateBlock(id) {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      const copy = JSON.parse(JSON.stringify({ ...prev[idx], id: `block-${Date.now()}` }));
      const next = [...prev]; next.splice(idx + 1, 0, copy); return next;
    });
  }

  function moveBlock(id, dir) {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      const ni = idx + dir;
      if (ni < 0 || ni >= prev.length) return prev;
      return arrayMove(prev, idx, ni);
    });
  }

  function updateMeta(changes) {
    if ('coverImage' in changes) setCoverImage(changes.coverImage);
  }

  async function save(newStatus) {
    if (!title.trim()) { alert('Please add a title'); return; }
    setSaving(true);
    const s = newStatus || status;
    const meta = { type: '__meta__', pageColor, pagePadding, content: { coverImage } };
    const content = JSON.stringify([meta, ...blocks]);
    const body = { title, content, excerpt, type, status: s, featured_image: featuredImage };
    try {
      if (isNew) {
        const r = await api.post('/posts', body);
        navigate(`/admin/${type}s/${r.data.id}`, { replace: true });
      } else {
        await api.put(`/posts/${id}`, body);
      }
      setStatus(s);
      setSavedMsg(s === 'published' ? '✓ Published!' : '✓ Saved!');
      setTimeout(() => setSavedMsg(''), 2500);
    } finally {
      setSaving(false);
    }
  }


  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - var(--topbar-h))', overflow:'hidden', background:'#e8edf3', direction:'ltr' }}>
      <style>{`
        .block-bar { opacity: 0; transition: opacity 0.12s; }
        .block-bar.bar-selected, .block-bar.bar-hover { opacity: 1; }
        div:hover > div > .block-bar:not(.bar-selected) { opacity: 1; }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'0.5rem 0.875rem', display:'flex', alignItems:'center', gap:'0.6rem', flexShrink:0, flexWrap:'nowrap', minHeight:50 }}>
        <Link to={`/admin/${type}s`} style={{ color:'#64748b', fontSize:'0.82rem', display:'flex', alignItems:'center', gap:3, flexShrink:0 }}>← {label}s</Link>
        <div style={{ width:1, height:18, background:'#e2e8f0', flexShrink:0 }}/>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder={`${label} title…`}
          style={{ flex:1, border:'none', outline:'none', fontSize:'1rem', fontWeight:700, color:'#1e293b', background:'transparent', minWidth:0 }}/>

        {/* Page background color */}
        <label style={{ display:'flex', alignItems:'center', gap:3, fontSize:'0.72rem', color:'#64748b', flexShrink:0, cursor:'pointer' }}>
          BG
          <input type="color" value={pageColor} onChange={e=>setPageColor(e.target.value)} style={{ width:26, height:24, border:'1px solid #d1d5db', borderRadius:3, padding:1, cursor:'pointer' }}/>
        </label>

        {/* Page padding */}
        <select value={pagePadding} onChange={e=>setPagePadding(e.target.value)} style={{ border:'1px solid #d1d5db', borderRadius:5, padding:'3px 5px', fontSize:'0.72rem', background:'#fff', color:'#374151', flexShrink:0 }}>
          <option value="1rem">Compact</option>
          <option value="2rem">Normal</option>
          <option value="3rem 4rem">Wide</option>
          <option value="4rem 6rem">Extra Wide</option>
        </select>

        {savedMsg && <span style={{ color:'#16a34a', fontWeight:700, fontSize:'0.82rem', flexShrink:0 }}>{savedMsg}</span>}

        <select value={status} onChange={e=>setStatus(e.target.value)} style={{ border:'1px solid #d1d5db', borderRadius:5, padding:'4px 6px', fontSize:'0.8rem', background:'#fff', flexShrink:0 }}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button onClick={()=>save('draft')} disabled={saving} style={{ background:'#f1f5f9', border:'1px solid #d1d5db', borderRadius:6, padding:'0.38rem 0.875rem', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', flexShrink:0 }}>Save</button>
        <button onClick={()=>save('published')} disabled={saving} style={{ background:'#2563eb', color:'#fff', border:'none', borderRadius:6, padding:'0.38rem 0.875rem', fontSize:'0.82rem', fontWeight:700, cursor:'pointer', flexShrink:0 }}>
          {status==='published'?'Update':'Publish'}
        </button>
        {!isNew && (
          <a href={`http://localhost:3001/${type}/${slug}`} target="_blank" rel="noreferrer" style={{ background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:6, padding:'0.38rem 0.65rem', fontSize:'0.78rem', fontWeight:600, flexShrink:0, pointerEvents: slug ? 'auto' : 'none', opacity: slug ? 1 : 0.4 }}>🌐 View</a>
        )}
      </div>

      {/* ── 3-panel body ── */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <BlockPalette onAdd={addBlock}/>

        {/* Canvas */}
        <main style={{ flex:1, overflowY:'auto', background:'#e2e8f0', padding:'1.25rem 1rem', display:'flex', flexDirection:'column', alignItems:'center' }}
          onClick={e=>{ if(e.target===e.currentTarget) setSelectedPath(null); }}>

          {/* MediaPicker for cover image */}
          {showCoverPicker && (
            <MediaPicker onSelect={m => { updateMeta({ coverImage: m.url }); setShowCoverPicker(false); }} onClose={() => setShowCoverPicker(false)} />
          )}

          {/* Canvas */}
          <div style={{ width:'100%', maxWidth:'100%', background: pageColor, borderRadius:12, minHeight:500, padding: pagePadding, boxShadow:'0 4px 32px rgba(0,0,0,0.15)', marginBottom:'1rem' }}>

            {/* Cover Image section */}
            <div style={{ position: 'relative', marginBottom: 16, borderRadius: 12, overflow: 'hidden', background: '#1e293b', minHeight: coverImage ? 220 : 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {coverImage && <img src={coverImage} alt="Cover" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 8 }}>
                <button onClick={() => setShowCoverPicker(true)} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: '0.82rem' }}>
                  {coverImage ? '🖼 Change Cover' : '+ Add Cover Image'}
                </button>
                {coverImage && <button onClick={() => updateMeta({ coverImage: '' })} style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: '0.82rem' }}>Remove</button>}
              </div>
            </div>

            {blocks.length === 0 && (
              <div style={{ border:'2px dashed #cbd5e1', borderRadius:10, padding:'4rem 2rem', textAlign:'center', color:'#94a3b8' }}
                onClick={e=>e.stopPropagation()}>
                <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>✦</div>
                <p style={{ fontSize:'1rem', fontWeight:600 }}>Canvas is empty</p>
                <p style={{ fontSize:'0.82rem', marginTop:'0.3rem' }}>Click any block in the left panel to add it here</p>
              </div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map(b=>b.id)} strategy={verticalListSortingStrategy}>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  {blocks.map((block, idx) => (
                    <SortableBlock key={block.id} block={block}
                      isSelected={selectedPath?.id === block.id && !selectedPath?.innerId}
                      isFirst={idx===0} isLast={idx===blocks.length-1}
                      onSelect={id=>setSelectedPath({id})}
                      onDelete={()=>deleteBlock(block.id)}
                      onDuplicate={()=>duplicateBlock(block.id)}
                      onMoveUp={()=>moveBlock(block.id,-1)}
                      onMoveDown={()=>moveBlock(block.id,1)}>
                      {block.type === 'columns'
                        ? <ColumnsBlock
                            block={block}
                            onChange={changes=>updateColumnsBlock(block.id,changes)}
                            selectedInner={selectedPath?.id===block.id ? selectedPath : null}
                            onSelectInner={path=>setSelectedPath(path)}/>
                        : <BlockPreview block={block}/>
                      }
                    </SortableBlock>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Excerpt */}
          <div style={{ width:'100%', maxWidth:'100%', background:'#fff', borderRadius:10, padding:'0.75rem 1rem', border:'1px solid #e2e8f0' }}>
            <label style={{ display:'block', fontSize:'0.65rem', fontWeight:800, color:'#64748b', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.08em' }}>Excerpt</label>
            <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} rows={2} placeholder="Short summary for post listings…"
              style={{ width:'100%', border:'none', outline:'none', fontSize:'0.85rem', color:'#374151', resize:'none', lineHeight:1.6, background:'transparent' }}/>
          </div>
        </main>

        {/* Settings panel */}
        <BlockSettings block={selectedBlock} onChange={updateBlock}/>
      </div>
    </div>
  );
}
