// ─── Block type catalogue ────────────────────────────────────────────────────

export const BLOCK_CATEGORIES = [
  {
    label: 'Layout',
    blocks: [
      { type: 'columns', icon: '⊞', label: 'Columns',  desc: '2 or 3 side-by-side columns' },
      { type: 'hero',    icon: '◉', label: 'Hero',     desc: 'Full-width hero section' },
      { type: 'card',    icon: '▭', label: 'Card',     desc: 'Boxed content card' },
      { type: 'spacer',  icon: '↕', label: 'Spacer',   desc: 'Empty vertical space' },
      { type: 'divider', icon: '—', label: 'Divider',  desc: 'Horizontal line' },
    ],
  },
  {
    label: 'Content',
    blocks: [
      { type: 'heading',  icon: 'H',   label: 'Heading',  desc: 'Title / section header' },
      { type: 'text',     icon: '¶',   label: 'Text',     desc: 'Paragraph of text' },
      { type: 'quote',    icon: '"',   label: 'Quote',    desc: 'Blockquote with author' },
      { type: 'features', icon: '✦',   label: 'Features', desc: 'Icon + title + text list' },
      { type: 'stats',    icon: '123', label: 'Stats',    desc: 'Numbers & metrics row' },
      { type: 'html',     icon: '</>',  label: 'HTML',     desc: 'Raw HTML / embed code' },
    ],
  },
  {
    label: 'Media',
    blocks: [
      { type: 'image',   icon: '🖼', label: 'Image',   desc: 'Photo or graphic' },
      { type: 'gallery', icon: '▦',  label: 'Gallery', desc: 'Image grid with captions' },
      { type: 'video',   icon: '▶',  label: 'Video',   desc: 'YouTube or mp4 link' },
    ],
  },
  {
    label: 'Interactive',
    blocks: [
      { type: 'button', icon: '⬛', label: 'Button',       desc: 'Clickable link button' },
      { type: 'social', icon: '📱', label: 'Social Links', desc: 'Facebook, Instagram…' },
    ],
  },
];

export const BLOCK_TYPES = BLOCK_CATEGORIES.flatMap(c => c.blocks);

export const SOCIAL_PLATFORMS = [
  { id: 'facebook',  label: 'Facebook',  color: '#1877f2', icon: 'f' },
  { id: 'instagram', label: 'Instagram', color: '#e1306c', icon: '📸' },
  { id: 'twitter',   label: 'Twitter/X', color: '#000',    icon: '𝕏' },
  { id: 'youtube',   label: 'YouTube',   color: '#ff0000', icon: '▶' },
  { id: 'tiktok',    label: 'TikTok',    color: '#010101', icon: '♪' },
  { id: 'linkedin',  label: 'LinkedIn',  color: '#0077b5', icon: 'in' },
  { id: 'whatsapp',  label: 'WhatsApp',  color: '#25d366', icon: '💬' },
  { id: 'telegram',  label: 'Telegram',  color: '#2ca5e0', icon: '✈' },
  { id: 'snapchat',  label: 'Snapchat',  color: '#fffc00', icon: '👻' },
  { id: 'pinterest', label: 'Pinterest', color: '#bd081c', icon: 'P' },
];

export const ANIMATIONS = [
  { id: 'fadeInUp',   label: 'Fade In Up' },
  { id: 'fadeIn',     label: 'Fade In' },
  { id: 'slideLeft',  label: 'Slide from Left' },
  { id: 'slideRight', label: 'Slide from Right' },
  { id: 'zoomIn',     label: 'Zoom In' },
  { id: 'bounceIn',   label: 'Bounce In' },
  { id: 'none',       label: 'No Animation' },
];

let _c = 0;
export function uid() { return `block-${Date.now()}-${_c++}`; }

export function createBlock(type) {
  const base = { id: uid(), type, animation: 'fadeInUp' };
  switch (type) {
    case 'columns': return {
      ...base, animation: 'fadeIn',
      content: {
        count: 2,
        cols: [
          [createBlock('heading')],
          [createBlock('text')],
        ],
      },
      styles: { gap: '1.5rem', padding: '0' },
    };
    case 'hero': return {
      ...base, animation: 'fadeIn',
      content: { title: 'Your Big Headline', subtitle: 'A short description that explains your product or service.', buttonText: 'Get Started', buttonLink: '#', backgroundImage: '' },
      styles: { backgroundColor: '#1e3a5f', color: '#ffffff', textAlign: 'center', padding: '5rem 2rem', minHeight: '50vh', overlayOpacity: '0.5' },
    };
    case 'card': return {
      ...base,
      content: { image: '', title: 'Card Title', text: 'Card description text goes here.', buttonText: '', buttonLink: '' },
      styles: { backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '1.5rem', color: '#1e293b' },
    };
    case 'quote': return {
      ...base,
      content: { text: 'This is an amazing quote that inspires people.', author: 'Author Name', role: 'CEO, Company' },
      styles: { backgroundColor: '#eff6ff', borderColor: '#2563eb', color: '#1e293b', padding: '1.5rem 1.5rem 1.5rem 2rem' },
    };
    case 'features': return {
      ...base, animation: 'fadeInUp',
      content: {
        items: [
          { icon: '⭐', title: 'Modern Aesthetic', text: 'Clean and contemporary design' },
          { icon: '♻', title: 'Quality Materials', text: 'Only the finest materials used' },
          { icon: '🏠', title: 'Functional Design', text: 'Beautiful and practical spaces' },
        ],
        layout: 'vertical', // vertical | horizontal | grid
      },
      styles: { color: '#ffffff', iconColor: '#c9a84c', iconSize: '2rem', gap: '1.5rem', backgroundColor: '' },
    };
    case 'stats': return {
      ...base, animation: 'fadeInUp',
      content: {
        items: [
          { number: '150+', label: 'Projects Done' },
          { number: '98%',  label: 'Happy Clients' },
          { number: '12',   label: 'Years Experience' },
          { number: '40+',  label: 'Awards Won' },
        ],
      },
      styles: { color: '#ffffff', accentColor: '#c9a84c', backgroundColor: '', textAlign: 'center' },
    };
    case 'gallery': return {
      ...base, animation: 'zoomIn',
      content: {
        columns: 3,
        items: [
          { src: '', label: 'Living Room',  sublabel: 'Elegance & Comfort' },
          { src: '', label: 'Kitchen',      sublabel: 'Modern & Practical' },
          { src: '', label: 'Bedroom',      sublabel: 'Cozy & Relaxing' },
        ],
      },
      styles: { borderRadius: '12px', gap: '1rem', imageHeight: '240px', overlayColor: 'rgba(0,0,0,0.45)' },
    };
    case 'html': return {
      ...base, animation: 'none',
      content: { code: '<!-- Paste your HTML or embed code here -->' },
      styles: {},
    };
    case 'heading': return {
      ...base,
      content: { text: 'New Heading', level: 2 },
      styles: { color: '#1e293b', textAlign: 'left', fontSize: '2rem', fontWeight: '700', padding: '0.5rem 0' },
    };
    case 'text': return {
      ...base,
      content: { text: 'Write your text here. Click to edit.' },
      styles: { color: '#374151', fontSize: '1rem', textAlign: 'left', lineHeight: '1.8', padding: '0.5rem 0' },
    };
    case 'image': return {
      ...base,
      content: { src: '', alt: '', link: '' },
      styles: { textAlign: 'center', borderRadius: '8px', padding: '0.5rem 0' },
    };
    case 'video': return {
      ...base,
      content: { url: '', title: 'Video' },
      styles: { padding: '0.5rem 0' },
    };
    case 'button': return {
      ...base,
      content: { text: 'Click Here', href: '#', target: '_blank' },
      styles: { backgroundColor: '#c9a84c', color: '#111111', fontSize: '1rem', borderRadius: '6px', padding: '0.85rem 2.4rem', textAlign: 'center' },
    };
    case 'social': return {
      ...base,
      content: { links: [{ platform: 'facebook', url: '' }] },
      styles: { textAlign: 'center', gap: '12px', iconSize: '44px', padding: '1rem 0' },
    };
    case 'divider': return {
      ...base, animation: 'none',
      content: {},
      styles: { borderColor: '#e2e8f0', borderWidth: '2px', borderStyle: 'solid', margin: '1rem 0' },
    };
    case 'spacer': return {
      ...base, animation: 'none',
      content: { height: 40 },
      styles: {},
    };
    default: return base;
  }
}

export function getYoutubeId(url) {
  const m = String(url).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return m ? m[1] : null;
}
