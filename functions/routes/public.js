const express = require('express');
const { db } = require('../db');
const router = express.Router();

function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function ea(s)  { return String(s||'').replace(/"/g,'&quot;'); }

async function getSettings() {
  const doc = await db().collection('settings').doc('config').get();
  return doc.exists ? doc.data() : {};
}

const SOCIAL = {
  facebook:  { color:'#1877f2', svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/></svg>' },
  instagram: { color:'#e1306c', svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>' },
  twitter:   { color:'#000',    svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
  youtube:   { color:'#ff0000', svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>' },
  tiktok:    { color:'#010101', svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.24 8.24 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/></svg>' },
  linkedin:  { color:'#0077b5', svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 0 22.222 0h.003z"/></svg>' },
  whatsapp:  { color:'#25d366', svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' },
  telegram:  { color:'#2ca5e0', svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>' },
  snapchat:  { color:'#fffc00', svg:'<svg viewBox="0 0 24 24" fill="#000"><path d="M12.166.006c.13 0 2.309-.01 3.799 1.605.908.997 1.22 2.336 1.22 3.414v.422a11.97 11.97 0 00.031.691c.117.013.242.02.37.02.487 0 .963-.11 1.413-.33.18-.088.38-.136.585-.136.44 0 .8.164.972.374a.69.69 0 01.154.457c-.005.596-.618.9-1.06 1.118a3.474 3.474 0 01-.16.073c-.476.196-.616.337-.594.55.119 1.09.724 2.13 1.558 3.077.327.37.764.73 1.287 1.07.213.138.352.292.408.46.145.434-.166.884-.812 1.14-.342.137-.72.208-1.115.21h-.077c-.276 0-.562-.035-.85-.104-.16-.038-.3-.056-.43-.056-.32 0-.487.093-.586.16-.24.163-.342.463-.42.876l-.023.13c-.054.287-.182.7-.614.7a1.52 1.52 0 01-.323-.04 5.168 5.168 0 00-1.158-.134c-.293 0-.58.026-.857.077-.554.103-1.083.39-1.495.802a3.89 3.89 0 00-.178.196c-.103.123-.22.26-.387.26a.426.426 0 01-.152-.028l-.035-.014c-.133-.052-.356-.14-.613-.14-.257 0-.48.088-.613.14l-.035.014a.426.426 0 01-.152.028c-.167 0-.284-.137-.387-.26a3.89 3.89 0 00-.178-.196c-.412-.413-.94-.699-1.495-.802a6.04 6.04 0 00-.857-.077c-.415 0-.815.046-1.158.134a1.52 1.52 0 01-.323.04c-.432 0-.56-.413-.614-.7l-.023-.13c-.078-.413-.18-.713-.42-.876-.099-.067-.266-.16-.586-.16-.13 0-.27.018-.43.056-.288.07-.574.104-.85.104h-.077c-.395-.002-.773-.073-1.115-.21-.646-.256-.957-.706-.812-1.14.056-.168.195-.322.408-.46.523-.34.96-.7 1.287-1.07.834-.947 1.44-1.987 1.558-3.077.022-.213-.118-.354-.594-.55a3.474 3.474 0 01-.16-.073C1.39 7.166.777 6.862.772 6.266a.69.69 0 01.154-.457c.172-.21.532-.374.972-.374.205 0 .405.048.585.136.45.22.926.33 1.413.33.128 0 .253-.007.37-.02a11.97 11.97 0 00.031-.691v-.422c0-1.078.312-2.417 1.22-3.414C7.007-.004 9.186.006 9.834.006l.332-.006z"/></svg>' },
  pinterest: { color:'#bd081c', svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>' },
};

function wrapperStyle(styles = {}) {
  const props = [];
  if (styles.opacity != null && styles.opacity !== 1 && styles.opacity !== '') props.push(`opacity:${styles.opacity}`);
  if (styles.transform)    props.push(`transform:${styles.transform}`);
  if (styles.filter)       props.push(`filter:${styles.filter}`);
  if (styles.boxShadow)    props.push(`box-shadow:${styles.boxShadow}`);
  if (styles.transition)   props.push(`transition:${styles.transition}`);
  if (styles.cursor && styles.cursor !== 'default') props.push(`cursor:${styles.cursor}`);
  if (styles.zIndex)       props.push(`z-index:${styles.zIndex}`);
  if (styles.position && styles.position !== 'static') {
    props.push(`position:${styles.position}`);
    if (styles.top)    props.push(`top:${styles.top}`);
    if (styles.right)  props.push(`right:${styles.right}`);
    if (styles.bottom) props.push(`bottom:${styles.bottom}`);
    if (styles.left)   props.push(`left:${styles.left}`);
  }
  if (styles.width)     props.push(`width:${styles.width}`);
  if (styles.maxWidth)  props.push(`max-width:${styles.maxWidth}`);
  if (styles.height)    props.push(`height:${styles.height}`);
  if (styles.minHeight) props.push(`min-height:${styles.minHeight}`);
  if (styles.overflow)  props.push(`overflow:${styles.overflow}`);
  if (styles.margin)    props.push(`margin:${styles.margin}`);
  if (styles.mixBlendMode && styles.mixBlendMode !== 'normal') props.push(`mix-blend-mode:${styles.mixBlendMode}`);
  return props.join(';');
}

function renderBlock(block, idx) {
  if (!block || block.type === '__meta__') return '';
  const { type, content = {}, styles = {}, animation = 'fadeInUp', animDelay, animDuration, cssClass = '', elemId, customCss = '' } = block;

  const wst = wrapperStyle(styles);
  const idAttr  = elemId ? ` id="${ea(elemId)}"` : '';
  const clsAttr = cssClass ? ` ${cssClass}` : '';
  const durAttr = animDuration ? ` data-dur="${animDuration}"` : '';
  const delAttr = animDelay && animDelay !== '0' ? ` data-delay="${animDelay}"` : '';
  const customSt = customCss ? ` ${customCss.replace(/\n/g,' ')}` : '';

  const wrap = (inner, cls='', extraSt='') =>
    `<div${idAttr} class="cb ${cls}${clsAttr}" data-a="${animation}" data-i="${idx}"${delAttr}${durAttr} style="${extraSt}${wst ? ';'+wst : ''}${customSt}">${inner}</div>`;

  switch (type) {
    case 'heading': {
      const lvl = content.level || 2;
      const size = {1:'clamp(2.4rem,6vw,4rem)',2:'clamp(1.8rem,4vw,2.6rem)',3:'clamp(1.3rem,3vw,1.8rem)',4:'1.2rem',5:'1rem',6:'0.9rem'}[lvl] || '1.6rem';
      const weight = styles.fontWeight || (lvl <= 2 ? '800' : '700');
      const color  = styles.color || 'inherit';
      const lh     = styles.lineHeight || (lvl === 1 ? '1.1' : '1.25');
      const ls     = styles.letterSpacing || (lvl <= 2 ? '-0.02em' : 'normal');
      const css = [
        `color:${color}`,
        `font-size:${styles.fontSize||size}`,
        `font-weight:${weight}`,
        `text-align:${styles.textAlign||'left'}`,
        `line-height:${lh}`,
        `letter-spacing:${ls}`,
        `padding:${styles.padding||'0.4rem 0'}`,
        `margin:0`,
        styles.textTransform ? `text-transform:${styles.textTransform}` : '',
        styles.backgroundColor ? `background:${styles.backgroundColor};border-radius:6px;padding:0.5rem 1rem` : '',
        styles.borderRadius && !styles.backgroundColor ? `border-radius:${styles.borderRadius}` : '',
      ].filter(Boolean).join(';');
      return wrap(`<h${lvl} style="${css}">${esc(content.text||'')}</h${lvl}>`);
    }

    case 'text': {
      const color = styles.color || 'inherit';
      const css = [
        `color:${color}`,
        `font-size:${styles.fontSize||'1rem'}`,
        `text-align:${styles.textAlign||'left'}`,
        `line-height:${styles.lineHeight||'1.8'}`,
        `padding:${styles.padding||'0.4rem 0'}`,
        `margin:0`,
        styles.fontWeight ? `font-weight:${styles.fontWeight}` : '',
        styles.letterSpacing ? `letter-spacing:${styles.letterSpacing}` : '',
        styles.backgroundColor ? `background:${styles.backgroundColor};border-radius:8px;padding:1rem` : '',
      ].filter(Boolean).join(';');
      return wrap(`<p style="${css}">${esc(content.text||'').replace(/\n/g,'<br>')}</p>`);
    }

    case 'image': {
      if (!content.src) return '';
      const imgW = styles.width || '100%';
      const imgH = styles.height || 'auto';
      const imgMaxW = styles.maxWidth || (styles.width ? 'none' : '100%');
      const imgObjFit = styles.objectFit || 'cover';
      const imgRadius = styles.borderRadius || '0';
      const imgAlign = styles.textAlign || 'center';
      const imgMargin = imgAlign === 'center' ? '0 auto' : imgAlign === 'right' ? '0 0 0 auto' : '0';
      const altText = ea(content.alt || content.title || '');
      const img = `<img src="${ea(content.src)}" alt="${altText}" style="display:block;width:${imgW};height:${imgH};max-width:${imgMaxW};object-fit:${imgObjFit};border-radius:${imgRadius};margin:${imgMargin}">`;
      const inner = content.link ? `<a href="${ea(content.link)}" target="_blank" rel="noopener">${img}</a>` : img;
      return wrap(`<div style="text-align:${imgAlign};padding:${styles.padding||'0.5rem 0'}">${inner}</div>`);
    }

    case 'video': {
      if (!content.url) return '';
      const yt = content.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
      const vid = yt
        ? `<div style="position:relative;padding-top:56.25%;border-radius:10px;overflow:hidden;background:#000"><iframe style="position:absolute;inset:0;width:100%;height:100%;border:none" src="https://www.youtube.com/embed/${yt[1]}" title="${ea(content.title||'Video')}" allow="autoplay;encrypted-media" allowfullscreen></iframe></div>`
        : `<video controls playsinline style="width:100%;border-radius:10px"><source src="${ea(content.url)}"></video>`;
      return wrap(`<div style="padding:${styles.padding||'0.5rem 0'}">${vid}</div>`);
    }

    case 'button': {
      const btnBg = styles.backgroundColor || '#c9a84c';
      const btnCol = styles.color || '#111';
      const btnHover = btnBg === '#c9a84c' ? '#b8922e' : btnBg;
      const css = `display:inline-block;background:${btnBg};color:${btnCol};padding:${styles.padding||'0.85rem 2.4rem'};border-radius:${styles.borderRadius||'6px'};font-size:${styles.fontSize||'1rem'};font-weight:700;text-decoration:none;border:${styles.border||'none'};letter-spacing:0.04em;${styles.width?`width:${styles.width};text-align:center;`:''}transition:all 0.2s`;
      return wrap(`<div class="b-btn-wrap" style="text-align:${styles.textAlign||'center'};padding:0.5rem 0"><a href="${ea(content.href||'#')}" target="${ea(content.target||'_blank')}" rel="noopener" style="${css}" onmouseover="this.style.background='${btnHover}';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='${btnBg}';this.style.transform=''">${esc(content.text||'Button')}</a></div>`);
    }

    case 'social': {
      const links = content.links || [];
      if (!links.length) return '';
      const sz = parseInt(styles.iconSize) || 44;
      const half = Math.round(sz * 0.48);
      const justify = styles.textAlign==='right'?'flex-end':styles.textAlign==='center'?'center':'flex-start';
      const icons = links.map(l => {
        const p = SOCIAL[l.platform] || SOCIAL.facebook;
        const svgResized = p.svg.replace('<svg ', `<svg width="${half}" height="${half}" `);
        return l.url
          ? `<a href="${ea(l.url)}" target="_blank" rel="noopener noreferrer" class="b-social-icon" title="${esc(p.label||l.platform)}" style="width:${sz}px;height:${sz}px;background:${p.color}">${svgResized}</a>`
          : `<span style="display:inline-flex;align-items:center;justify-content:center;width:${sz}px;height:${sz}px;background:${p.color};border-radius:50%;color:#fff">${svgResized}</span>`;
      }).join('\n');
      return wrap(`<div class="b-social" style="gap:${styles.gap||'12px'};justify-content:${justify};padding:${styles.padding||'1rem 0'}">${icons}</div>`);
    }

    case 'hero': {
      const bg = content.backgroundImage
        ? `background-image:linear-gradient(rgba(0,0,0,${styles.overlayOpacity||0.45}),rgba(0,0,0,${styles.overlayOpacity||0.45})),url('${ea(content.backgroundImage)}');background-size:cover;background-position:center;`
        : `background:${styles.backgroundColor||'#0d0d0d'};`;
      const align = styles.textAlign || 'center';
      const minH = styles.minHeight || '90vh';
      const col = styles.color || '#fff';
      const btn = content.buttonText
        ? `<a href="${ea(content.buttonLink||'#')}" style="display:inline-block;background:#c9a84c;color:#111;padding:0.9rem 2.5rem;border-radius:6px;font-weight:800;font-size:1rem;letter-spacing:0.04em;transition:all 0.2s" onmouseover="this.style.background='#b8922e'" onmouseout="this.style.background='#c9a84c'">${esc(content.buttonText)}</a>`
        : '';
      return `<div${idAttr} class="cb${clsAttr}" data-a="${animation}" data-i="${idx}"${delAttr}${durAttr} style="${wst}">
<div class="b-hero" style="${bg}min-height:${minH}">
  <div class="b-hero-inner" style="text-align:${align}">
    <h1 style="color:${col}">${esc(content.title||'')}</h1>
    ${content.subtitle?`<p style="color:${col}">${esc(content.subtitle)}</p>`:''}
    ${btn}
  </div>
</div></div>`;
    }

    case 'card': {
      const hasBg = styles.backgroundColor && styles.backgroundColor !== '#ffffff';
      const cardBg = hasBg ? styles.backgroundColor : 'var(--surface)';
      const cardBorder = hasBg ? 'transparent' : 'var(--border)';
      const btn = content.buttonText
        ? `<a href="${ea(content.buttonLink||'#')}" style="display:inline-block;margin-top:1rem;background:#c9a84c;color:#111;padding:0.55rem 1.3rem;border-radius:6px;font-size:0.88rem;font-weight:700;letter-spacing:0.03em;transition:background 0.18s" onmouseover="this.style.background='#b8922e'" onmouseout="this.style.background='#c9a84c'">${esc(content.buttonText)}</a>`
        : '';
      return wrap(`<div class="b-card" style="background:${cardBg};border-color:${cardBorder};color:${styles.color||'inherit'};border-radius:${styles.borderRadius||'12px'}">
  ${content.image?`<img src="${ea(content.image)}" alt="" loading="lazy" style="width:100%;height:220px;object-fit:cover;display:block">`:''}
  <div class="b-card-body">
    <h3>${esc(content.title||'')}</h3>
    ${content.text?`<p>${esc(content.text)}</p>`:''}
    ${btn}
  </div>
</div>`);
    }

    case 'quote': {
      const borderCol = styles.borderColor || '#c9a84c';
      const bgCol = styles.backgroundColor || 'rgba(201,168,76,0.06)';
      const textCol = styles.color || 'inherit';
      return wrap(`<blockquote class="b-quote" style="border-right:3px solid ${borderCol};background:${bgCol};color:${textCol};padding:${styles.padding||'1.75rem 2rem 1.75rem 1.5rem'};border-radius:0 12px 12px 0">
  <p style="font-size:${styles.fontSize||'1.15rem'};font-style:italic;line-height:1.8;margin:0 0 0.75rem">"${esc(content.text||'')}"</p>
  ${content.author?`<footer style="font-size:0.85rem;opacity:0.65;font-style:normal;font-weight:700">— <strong>${esc(content.author)}</strong>${content.role?`، ${esc(content.role)}`:''}</footer>`:''}
</blockquote>`);
    }

    case 'html':
      return `<div class="cb" data-a="none" data-i="${idx}">${content.code||''}</div>`;

    case 'columns': {
      const cols = content.cols || [[], []];
      const count = content.count || cols.length || 2;
      const gap = styles.gap || '1.75rem';
      const colItems = cols.slice(0, count).map((col) =>
        `<div class="b-col">${(col||[]).map((b,bi)=>renderBlock({...b},bi)).join('\n')}</div>`
      ).join('\n');
      const hasBg = !!(styles.backgroundColor || styles.backgroundImage);
      const bgStyle = styles.backgroundColor ? `background:${styles.backgroundColor};` : '';
      const padStyle = styles.padding ? `padding:${styles.padding};` : 'padding:3.5rem 0;';
      const grid = `<div class="b-cols c${count}" style="--cols-gap:${gap}">${colItems}</div>`;
      if (hasBg) {
        return `<div${idAttr} class="cb${clsAttr}" data-a="${animation}" data-i="${idx}"${delAttr}${durAttr}>
<div style="width:100vw;position:relative;left:50%;transform:translateX(-50%);${bgStyle}${padStyle}">
  <div style="max-width:1100px;margin:0 auto;padding:0 2rem">${grid}</div>
</div></div>`;
      }
      return wrap(grid);
    }

    case 'features': {
      const items = content.items || [];
      const layout = content.layout || 'vertical';
      const isHoriz = layout === 'horizontal';
      const isGrid  = layout === 'grid';
      const accentCol = styles.iconColor || '#c9a84c';
      const textCol   = styles.color || 'inherit';
      const gap = styles.gap || (isHoriz ? '2rem' : '1.25rem');
      const pad = styles.padding || '0.5rem 0';
      const bg  = styles.backgroundColor ? `background:${styles.backgroundColor};` : '';
      const cls = isHoriz ? 'b-feat-horiz' : '';
      const gridStyle = isGrid
        ? `display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:${gap};`
        : `display:flex;flex-direction:${isHoriz?'row':'column'};flex-wrap:wrap;align-items:${isHoriz?'flex-start':'stretch'};gap:${gap};`;
      const itemsHtml = items.map(item => `
<div style="display:flex;align-items:flex-start;gap:1rem;min-width:0">
  <span style="font-size:${styles.iconSize||'2rem'};color:${accentCol};flex-shrink:0;line-height:1;margin-top:2px">${esc(item.icon||'✦')}</span>
  <div style="min-width:0">
    <div style="color:${textCol};font-weight:700;font-size:0.97rem;line-height:1.3;letter-spacing:0.02em;text-transform:uppercase">${esc(item.title||'')}</div>
    ${item.text?`<div style="color:${textCol};opacity:0.6;font-size:0.85rem;margin-top:4px;line-height:1.55">${esc(item.text)}</div>`:''}
  </div>
</div>`).join('');
      return wrap(`<div class="${cls}" style="${bg}${gridStyle}padding:${pad}">${itemsHtml}</div>`);
    }

    case 'stats': {
      const items  = content.items || [];
      const accent = styles.accentColor || '#c9a84c';
      const textCol = styles.color || 'inherit';
      const bg = styles.backgroundColor ? `background:${styles.backgroundColor};` : '';
      const align = styles.textAlign || 'center';
      const count = items.length || 4;
      const pad = styles.padding || '2.5rem 0';
      const itemsHtml = items.map((item, i) => `
<div style="text-align:${align};padding:1.25rem 1rem;${i < count-1 ? `border-left:1px solid ${accent}33;` : ''}">
  <div style="font-size:clamp(2rem,4vw,3rem);font-weight:900;color:${accent};line-height:1;margin-bottom:0.4rem">${esc(item.number||'0')}</div>
  <div style="color:${textCol};opacity:0.65;font-size:0.82rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase">${esc(item.label||'')}</div>
</div>`).join('');
      return wrap(`<div class="b-stats b-stats-${count}" style="${bg}display:grid;grid-template-columns:repeat(${count},1fr);padding:${pad}">${itemsHtml}</div>`);
    }

    case 'gallery': {
      const items   = content.items || [];
      const cols    = content.columns || 3;
      const imgH    = styles.imageHeight || '240px';
      const radius  = styles.borderRadius || '10px';
      const gap     = styles.gap || '1rem';
      const overlay = styles.overlayColor || 'rgba(0,0,0,0.55)';
      const itemsHtml = items.map(item => {
        const lbl = (item.label || item.sublabel) ? `
<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,${overlay},transparent 140%);padding:1rem 0.875rem 0.75rem">
  ${item.label    ? `<div style="color:#fff;font-weight:700;font-size:0.92rem;letter-spacing:0.04em;text-transform:uppercase">${esc(item.label)}</div>` : ''}
  ${item.sublabel ? `<div style="color:rgba(255,255,255,0.7);font-size:0.78rem;margin-top:2px">${esc(item.sublabel)}</div>` : ''}
</div>` : '';
        const img = item.src
          ? `<img src="${ea(item.src)}" alt="${ea(item.label||'')}" loading="lazy" style="width:100%;height:${imgH};object-fit:cover;display:block;transition:transform 0.4s ease">`
          : `<div style="width:100%;height:${imgH};background:#1a1a2e;display:flex;align-items:center;justify-content:center;color:#334155;font-size:2rem">🖼</div>`;
        return `<div style="position:relative;border-radius:${radius};overflow:hidden;background:#111">${img}${lbl}</div>`;
      }).join('');
      return wrap(`<div class="b-gal-${cols}" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${gap}">${itemsHtml}</div>`);
    }

    case 'divider': {
      const col = styles.borderColor || 'rgba(255,255,255,0.12)';
      const css = `border:none;border-top:${styles.borderWidth||'1px'} ${styles.borderStyle||'solid'} ${col};${styles.width?`width:${styles.width};margin:0 auto;`:''}`;
      return `<div class="cb" data-a="${animation}" data-i="${idx}" style="padding:${styles.margin||'0.5rem 0'}"><hr style="${css}"></div>`;
    }

    case 'spacer':
      return `<div class="cb" data-a="none" data-i="${idx}" style="height:${content.height||40}px"></div>`;

    default: return '';
  }
}

function parseContent(raw) {
  if (!raw) return { blocks: [], meta: {} };
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw 0;
    const meta = arr[0]?.type === '__meta__' ? arr[0] : {};
    const blocks = arr[0]?.type === '__meta__' ? arr.slice(1) : arr;
    return { blocks, meta };
  } catch {
    return { blocks: [{ type: 'text', content: { text: raw }, styles: {}, animation: 'fadeIn' }], meta: {} };
  }
}

function shell({ title, siteTitle, siteTagline, excerpt, pageColor, pagePadding, body, siteTheme, coverImage }) {
  const themeClass = `theme-${siteTheme || 'default'}`;
  const seoDesc = ea(excerpt || siteTagline || '');
  const seoTitle = esc(title);
  const safesite = esc(siteTitle || 'CMS');

  const coverHtml = coverImage ? `
<div id="page-cover" style="position:relative;width:100%;height:65vh;min-height:300px;overflow:hidden;background:#0f172a;margin-bottom:0">
  <img id="cover-img" src="${ea(coverImage)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:center;will-change:transform,opacity">
  <div id="cover-overlay" style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.5) 100%)"></div>
  <canvas id="color-canvas" style="display:none" width="1" height="1"></canvas>
</div>
<div id="content-body" style="position:relative;z-index:1;transition:background-color 0.8s ease">` : '<div id="content-body">';

  const coverClose = '</div>';

  const coverJs = coverImage ? `
<script>
(function(){
  var cover=document.getElementById('page-cover');
  var img=document.getElementById('cover-img');
  var body=document.getElementById('content-body');
  function extractColor(imgEl){
    try{
      var c=document.getElementById('color-canvas');
      var ctx=c.getContext('2d');
      ctx.drawImage(imgEl,0,0,1,1);
      var d=ctx.getImageData(0,0,1,1).data;
      var r=Math.floor(d[0]*0.85),g=Math.floor(d[1]*0.85),b=Math.floor(d[2]*0.85);
      if(body)body.style.backgroundColor='rgb('+r+','+g+','+b+')';
      document.body.style.backgroundColor='rgb('+r+','+g+','+b+')';
    }catch(e){}
  }
  if(img){img.crossOrigin='anonymous';if(img.complete)extractColor(img);else img.addEventListener('load',function(){extractColor(img);});}
  window.addEventListener('scroll',function(){
    if(!cover)return;
    var progress=Math.min(window.pageYOffset/cover.offsetHeight,1);
    cover.style.opacity=1-progress;
    if(img)img.style.transform='translateY('+(window.pageYOffset*0.4)+'px)';
  },{passive:true});
})();
</script>` : '';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${seoTitle}${safesite ? ' — ' + safesite : ''}</title>
<meta name="description" content="${seoDesc}">
<meta property="og:title" content="${seoTitle}">
<meta property="og:description" content="${seoDesc}">
<meta property="og:type" content="article">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:'Cairo',system-ui,sans-serif;background:${pageColor||'#0d0d0d'};color:#e8e0d0;line-height:1.8;min-height:100vh;font-size:16px;-webkit-font-smoothing:antialiased}
img,video{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
:root{--accent:#c9a84c;--accent-hover:#b8922e;--surface:rgba(255,255,255,0.04);--border:rgba(255,255,255,0.08);--text-muted:rgba(232,224,208,0.6)}
body.theme-minimal{background:#f5f5f5;color:#111;--surface:rgba(0,0,0,0.03);--border:rgba(0,0,0,0.08);--text-muted:#555}
body.theme-dark{background:#080808;color:#ddd}
#page-cover{transition:opacity 0.08s linear}
@media(max-width:640px){#page-cover{height:55vw!important;min-height:200px}}
.page-wrap{max-width:1100px;margin:0 auto;padding:4rem 2rem}
.cb{margin-bottom:2.5rem;opacity:0}
.cb:last-child{margin-bottom:0}
@keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideLeft{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
@keyframes zoomIn{from{opacity:0;transform:scale(0.87)}to{opacity:1;transform:scale(1)}}
@keyframes bounceIn{0%{opacity:0;transform:scale(0.4)}60%{opacity:1;transform:scale(1.05)}80%{transform:scale(0.97)}100%{transform:scale(1)}}
.cb.vis[data-a="fadeInUp"]{animation:fadeInUp 0.65s cubic-bezier(.22,.68,0,1.1) both}
.cb.vis[data-a="fadeIn"]{animation:fadeIn 0.65s ease both}
.cb.vis[data-a="slideLeft"]{animation:slideLeft 0.65s cubic-bezier(.22,.68,0,1.1) both}
.cb.vis[data-a="slideRight"]{animation:slideRight 0.65s cubic-bezier(.22,.68,0,1.1) both}
.cb.vis[data-a="zoomIn"]{animation:zoomIn 0.65s cubic-bezier(.22,.68,0,1.1) both}
.cb.vis[data-a="bounceIn"]{animation:bounceIn 0.7s ease both}
.cb[data-a="none"]{opacity:1!important;animation:none!important}
.b-hero{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:90vh;background-size:cover;background-position:center;position:relative;overflow:hidden;width:100vw;margin-inline-start:calc(50% - 50vw)}
.b-hero-inner{position:relative;z-index:2;max-width:860px;margin:0 auto;padding:5rem 2.5rem;width:100%;text-align:center}
.b-hero h1{font-size:clamp(2.2rem,6vw,4rem);font-weight:900;line-height:1.1;margin-bottom:1rem;text-shadow:0 2px 20px rgba(0,0,0,0.4);text-align:center}
.b-hero p{font-size:clamp(1rem,2.5vw,1.25rem);opacity:0.9;margin:0 auto 2.25rem;line-height:1.7;max-width:600px;text-align:center}
.b-hero a{display:inline-block;padding:0.9rem 2.5rem;border-radius:6px;font-weight:700;font-size:1rem;letter-spacing:0.03em;transition:all 0.22s;background:var(--accent);color:#111}
.b-hero a:hover{background:var(--accent-hover);transform:translateY(-2px);box-shadow:0 8px 28px rgba(201,168,76,0.4)}
.b-cols{display:grid;gap:var(--cols-gap,1.75rem)}
.b-cols.c2{grid-template-columns:repeat(2,1fr)}
.b-cols.c3{grid-template-columns:repeat(3,1fr)}
.b-cols.c4{grid-template-columns:repeat(4,1fr)}
.b-col{min-width:0}
.b-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;height:100%;display:flex;flex-direction:column;transition:transform 0.25s,box-shadow 0.25s,border-color 0.25s}
.b-card:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(0,0,0,0.35);border-color:var(--accent)}
.b-card img{width:100%;height:220px;object-fit:cover}
.b-card-body{padding:1.5rem;flex:1;display:flex;flex-direction:column;gap:0.5rem}
.b-card-body h3{font-size:1.15rem;font-weight:700;line-height:1.4}
.b-card-body p{color:var(--text-muted);font-size:0.93rem;line-height:1.7;flex:1}
.b-quote{border-right:3px solid var(--accent);padding:1.75rem 2rem 1.75rem 1.5rem;background:var(--surface);border-radius:0 10px 10px 0}
.b-quote p{font-size:1.15rem;font-style:italic;line-height:1.9;margin-bottom:0.75rem}
.b-quote footer{font-size:0.85rem;color:var(--text-muted);font-style:normal;font-weight:700;letter-spacing:0.04em}
.b-btn-wrap a{letter-spacing:0.04em;text-transform:uppercase;font-size:0.9rem}
.b-social{display:flex;flex-wrap:wrap;align-items:center;gap:12px}
.b-social a{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;text-decoration:none;transition:transform 0.2s,box-shadow 0.2s,filter 0.2s;color:#fff;flex-shrink:0}
.b-social a:hover{transform:scale(1.14);box-shadow:0 4px 20px rgba(0,0,0,0.4);filter:brightness(1.15)}
@media(max-width:1024px){.b-cols.c4{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){
  .page-wrap{padding:2.5rem 1.25rem}
  .b-cols.c2,.b-cols.c3,.b-cols.c4{grid-template-columns:1fr}
  .b-hero{min-height:75vw}.b-hero-inner{padding:3rem 1.25rem}
  .b-hero h1{font-size:clamp(1.8rem,7vw,2.8rem)}
  .b-social{justify-content:center}.cb{margin-bottom:2rem}
  .b-gal-3,.b-gal-4{grid-template-columns:repeat(2,1fr)!important}
  .b-stats{grid-template-columns:repeat(2,1fr)!important}
  .b-feat-horiz{flex-direction:column!important}
}
@media(max-width:480px){
  .page-wrap{padding:1.75rem 1rem}
  .b-hero h1{font-size:clamp(1.6rem,8vw,2.2rem)}
  .b-gal-2,.b-gal-3,.b-gal-4{grid-template-columns:1fr!important}
}
</style>
</head>
<body class="${themeClass}">
${coverHtml}
<div class="page-wrap">
${body}
</div>
${coverClose}
<script>
(function(){
  var delays=[0,.07,.13,.19,.24,.29,.34,.39,.43,.47];
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        var el=en.target;
        var d=el.dataset.delay||(delays[Math.min(+el.dataset.i||0,delays.length-1)]+'s');
        var dur=el.dataset.dur;
        el.style.animationDelay=d;
        if(dur)el.style.animationDuration=dur;
        el.classList.add('vis');
        obs.unobserve(el);
      }
    });
  },{threshold:.08,rootMargin:'0px 0px -20px 0px'});
  document.querySelectorAll('.cb').forEach(function(el){obs.observe(el);});
})();
</script>
${coverJs}
</body>
</html>`;
}

function notFound(msg) {
  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#0d0d0d;color:#e8e0d0;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:1rem;text-align:center;padding:2rem}h1{font-size:5rem;font-weight:900;color:#c9a84c;line-height:1}p{color:rgba(232,224,208,0.6);font-size:1.1rem}</style></head><body><h1>404</h1><p>${esc(msg||'الصفحة غير موجودة')}</p></body></html>`;
}

router.get('/', async (req, res) => {
  const snap = await db().collection('posts')
    .where('status', '==', 'published')
    .orderBy('published_at', 'desc')
    .limit(1)
    .get();
  if (!snap.empty) return res.redirect(302, `/p/${snap.docs[0].data().slug}`);
  res.status(404).setHeader('Content-Type','text/html; charset=utf-8').send(notFound('لا توجد صفحات منشورة بعد'));
});

router.get('/p/:slug', async (req, res) => {
  const snap = await db().collection('posts')
    .where('slug', '==', req.params.slug)
    .where('status', '==', 'published')
    .limit(1)
    .get();
  if (snap.empty) return res.status(404).setHeader('Content-Type','text/html; charset=utf-8').send(notFound('الصفحة غير موجودة'));

  const post = { id: snap.docs[0].id, ...snap.docs[0].data() };
  const s = await getSettings();
  const { blocks, meta } = parseContent(post.content);
  const coverImage = meta.content?.coverImage || '';
  const body = blocks.map((b,i) => renderBlock(b,i)).join('\n');

  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.send(shell({
    title: post.title,
    siteTitle: s.site_title,
    siteTagline: s.site_tagline,
    excerpt: post.excerpt,
    pageColor: meta.content?.pageColor || meta.pageColor || '#0d0d0d',
    pagePadding: meta.content?.pagePadding || meta.pagePadding || '3rem 2rem',
    body,
    siteTheme: s.site_theme,
    coverImage,
  }));
});

router.get('/post/:slug', (req, res) => res.redirect(301, `/p/${req.params.slug}`));
router.get('/page/:slug', (req, res) => res.redirect(301, `/p/${req.params.slug}`));

module.exports = router;
