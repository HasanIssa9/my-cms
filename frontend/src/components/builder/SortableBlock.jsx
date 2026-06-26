import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BlockPreview from './BlockPreview.jsx';

export default function SortableBlock({ block, isSelected, onSelect, onDelete, onDuplicate, onMoveUp, onMoveDown, isFirst, isLast }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const typeLabels = { heading: 'Heading', text: 'Text', image: 'Image', video: 'Video', button: 'Button', social: 'Social Links', divider: 'Divider', spacer: 'Spacer' };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        onClick={() => onSelect(block.id)}
        style={{
          position: 'relative',
          border: isSelected ? '2px solid #2563eb' : '1px solid transparent',
          borderRadius: 10,
          transition: 'border-color 0.15s',
          background: '#fff',
          cursor: 'default',
        }}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#bfdbfe'; }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'transparent'; }}
      >
        {/* Top bar (shown on hover/select) */}
        <div style={{
          position: 'absolute', top: -1, left: -1, right: -1,
          background: isSelected ? '#2563eb' : '#64748b',
          borderRadius: '9px 9px 0 0',
          display: 'flex', alignItems: 'center', padding: '2px 6px', gap: '4px',
          opacity: isSelected ? 1 : 0,
          transition: 'opacity 0.15s',
          zIndex: 5,
        }}
          className="block-toolbar"
        >
          {/* Drag handle */}
          <span
            {...attributes} {...listeners}
            title="Drag to reorder"
            style={{ cursor: 'grab', color: '#fff', fontSize: '1rem', padding: '2px 4px', userSelect: 'none', opacity: 0.8 }}
          >
            ⠿
          </span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em', flex: 1 }}>
            {typeLabels[block.type] || block.type}
          </span>
          <button onClick={e => { e.stopPropagation(); onMoveUp(); }} disabled={isFirst} title="Move up"
            style={toolBtn(!isFirst)}>↑</button>
          <button onClick={e => { e.stopPropagation(); onMoveDown(); }} disabled={isLast} title="Move down"
            style={toolBtn(!isLast)}>↓</button>
          <button onClick={e => { e.stopPropagation(); onDuplicate(); }} title="Duplicate"
            style={toolBtn(true)}>⧉</button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} title="Delete"
            style={{ ...toolBtn(true), background: 'rgba(239,68,68,0.8)' }}>✕</button>
        </div>

        {/* Block content */}
        <div style={{ padding: '0.875rem 1rem' }}>
          <BlockPreview block={block} />
        </div>
      </div>

      <style>{`.block-toolbar { opacity: 0; } div:hover > .block-toolbar { opacity: 1 !important; }`}</style>
    </div>
  );
}

function toolBtn(enabled) {
  return {
    background: enabled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
    border: 'none', color: '#fff', borderRadius: 4, padding: '2px 6px',
    fontSize: '0.75rem', cursor: enabled ? 'pointer' : 'not-allowed', opacity: enabled ? 1 : 0.3,
  };
}
