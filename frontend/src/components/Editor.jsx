import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

const btn = (active) => ({
  background: active ? '#2563eb' : '#f1f5f9',
  color: active ? '#fff' : '#374151',
  border: '1px solid ' + (active ? '#2563eb' : '#d1d5db'),
  borderRadius: 4,
  padding: '3px 8px',
  fontSize: '0.82rem',
  fontWeight: 600,
  cursor: 'pointer',
  lineHeight: 1.4,
});

function Toolbar({ editor }) {
  if (!editor) return null;
  const e = editor;

  function addImage() {
    const url = prompt('Image URL:');
    if (url) e.chain().focus().setImage({ src: url }).run();
  }

  function addLink() {
    const url = prompt('URL:');
    if (url) e.chain().focus().setLink({ href: url }).run();
  }

  const groups = [
    [
      { label: 'B', title: 'Bold', cmd: () => e.chain().focus().toggleBold().run(), active: e.isActive('bold') },
      { label: 'I', title: 'Italic', cmd: () => e.chain().focus().toggleItalic().run(), active: e.isActive('italic') },
      { label: 'U', title: 'Underline', cmd: () => e.chain().focus().toggleUnderline().run(), active: e.isActive('underline') },
      { label: 'S', title: 'Strike', cmd: () => e.chain().focus().toggleStrike().run(), active: e.isActive('strike') },
    ],
    [
      { label: 'H1', title: 'Heading 1', cmd: () => e.chain().focus().toggleHeading({ level: 1 }).run(), active: e.isActive('heading', { level: 1 }) },
      { label: 'H2', title: 'Heading 2', cmd: () => e.chain().focus().toggleHeading({ level: 2 }).run(), active: e.isActive('heading', { level: 2 }) },
      { label: 'H3', title: 'Heading 3', cmd: () => e.chain().focus().toggleHeading({ level: 3 }).run(), active: e.isActive('heading', { level: 3 }) },
    ],
    [
      { label: '≡', title: 'Left', cmd: () => e.chain().focus().setTextAlign('left').run(), active: e.isActive({ textAlign: 'left' }) },
      { label: '≡̄', title: 'Center', cmd: () => e.chain().focus().setTextAlign('center').run(), active: e.isActive({ textAlign: 'center' }) },
      { label: '≡̤', title: 'Right', cmd: () => e.chain().focus().setTextAlign('right').run(), active: e.isActive({ textAlign: 'right' }) },
    ],
    [
      { label: '• List', title: 'Bullet list', cmd: () => e.chain().focus().toggleBulletList().run(), active: e.isActive('bulletList') },
      { label: '1. List', title: 'Ordered list', cmd: () => e.chain().focus().toggleOrderedList().run(), active: e.isActive('orderedList') },
      { label: '" "', title: 'Blockquote', cmd: () => e.chain().focus().toggleBlockquote().run(), active: e.isActive('blockquote') },
      { label: '</>', title: 'Code block', cmd: () => e.chain().focus().toggleCodeBlock().run(), active: e.isActive('codeBlock') },
    ],
    [
      { label: '🖼 Image', title: 'Insert image', cmd: addImage, active: false },
      { label: '🔗 Link', title: 'Insert link', cmd: addLink, active: e.isActive('link') },
      { label: '↩ Break', title: 'Horizontal rule', cmd: () => e.chain().focus().setHorizontalRule().run(), active: false },
    ],
    [
      { label: '↩', title: 'Undo', cmd: () => e.chain().focus().undo().run(), active: false },
      { label: '↪', title: 'Redo', cmd: () => e.chain().focus().redo().run(), active: false },
    ],
  ];

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '6px',
      padding: '8px 10px', background: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
    }}>
      {groups.map((group, gi) => (
        <div key={gi} style={{ display: 'flex', gap: '2px' }}>
          {group.map(({ label, title, cmd, active }) => (
            <button key={label} title={title} onClick={cmd} style={btn(active)}>{label}</button>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Editor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing your content here…' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        style: 'min-height:350px;padding:1.25rem;outline:none;font-size:1rem;line-height:1.75;',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value]);

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder); color: #94a3b8; pointer-events: none; float: left; height: 0;
        }
        .ProseMirror h1 { font-size: 2rem; margin: 1rem 0 0.5rem; }
        .ProseMirror h2 { font-size: 1.5rem; margin: 1rem 0 0.5rem; }
        .ProseMirror h3 { font-size: 1.25rem; margin: 1rem 0 0.5rem; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror blockquote { border-left: 4px solid #2563eb; padding: 0.5rem 1rem; background: #eff6ff; margin: 0.75rem 0; }
        .ProseMirror pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 6px; overflow-x: auto; }
        .ProseMirror code { background: #e2e8f0; padding: 0.1em 0.3em; border-radius: 3px; font-size: 0.9em; }
        .ProseMirror img { max-width: 100%; border-radius: 6px; margin: 0.5rem 0; }
        .ProseMirror a { color: #2563eb; text-decoration: underline; }
        .ProseMirror hr { border: none; border-top: 2px solid #e2e8f0; margin: 1rem 0; }
      `}</style>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
