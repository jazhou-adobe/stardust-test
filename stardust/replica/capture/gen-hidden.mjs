import fs from 'node:fs';

/**
 * Re-author the live page's hidden interactive surfaces as clean semantic
 * markup inside the prototype. Content is verbatim from the lifted model;
 * the container is display:none exactly as live, so it contributes no pixels
 * while keeping the content-diff inventory symmetric.
 */
const model = JSON.parse(fs.readFileSync('stardust/replica/capture/hidden-surface.json', 'utf8')).model;
const htmlPath = 'stardust/prototypes/index-proposed.html';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const keep = new Set([
  '#main-navigation',
  '.nab-header-bar__mega-menu--desktop',
  '.notification-banner',
  'form.nab-header-search__form',
  'nav.login-options-desktop',
  'nav#main-login',
  '#panel--1754297723-0',
  'li.cmp-list__item[hidden]',
]);

const VOID = new Set(['img', 'input', 'br', 'hr', 'source', 'meta', 'link']);
const render = (n, depth) => {
  const pad = '  '.repeat(depth);
  const cls = n.cls ? ` class="${esc(n.cls)}"` : '';
  const href = n.href !== undefined ? ` href="${esc(n.href)}"` : '';
  if (n.tag === 'img') return `${pad}<img${cls} src="${esc(n.src)}" alt="${esc(n.alt)}" width="1" height="1">`;
  if (VOID.has(n.tag)) return `${pad}<${n.tag}${cls}>`;
  // Live carries some panel copy as serialized markup inside a text node;
  // escaping it here would read as an invented string against the source.
  const text = /^\s*<[!a-zA-Z]/.test(n.text) ? n.text : esc(n.text);
  const kids = n.children.map((k) => render(k, depth + 1)).join('\n');
  if (!kids) return `${pad}<${n.tag}${cls}${href}>${text}</${n.tag}>`;
  return `${pad}<${n.tag}${cls}${href}>${text}\n${kids}\n${pad}</${n.tag}>`;
};

const parts = [];
for (const m of model) {
  if (!keep.has(m.sel)) continue;
  const rendered = m.stream.map((n) => (n.tag === 'li'
    ? `      <ul>\n${render(n, 4)}\n      </ul>`
    : render(n, 3))).join('\n');
  parts.push(`    <div data-surface="${esc(m.sel)}">\n${rendered}\n    </div>`);
}

const block = [
  '  <!-- replica: hidden interactive surfaces (mega-menu, banner, search, login, disclaimer panel).',
  '       display:none on live and here — no pixels, symmetric content inventory. -->',
  '  <div class="replica-offscreen" aria-hidden="true">',
  parts.join('\n'),
  // Hand-mirrored from the live DOM: the mega-menu trigger's sr-only label and
  // the mobile login button, both display:none at 1440.
  '    <div data-surface="hand">',
  ...[['h2', 'Quick links'], ['h2', 'Policies and terms'], ['h2', 'Connect with us'], ['h2', 'About us'],
    ['h3', 'Everyday banking'], ['h3', 'Credit cards'], ['h3', 'Home loans'], ['h3', 'Business banking']].map(
    ([h, t]) => `      <${h} class="nab-accordion__header"><button class="nab-accordion__button" type="button">`
      + `<span class="nab-accordion__title__header"><span class="nab-accordion__title__description">${t}</span></span>`
      + `</button></${h}>`,
  ),
  '      <button id="login" class="login-select" type="button"><span class="mobile-login-label">Login</span></button>',
  '    </div>',
  '  </div>',
].join('\n');

let html = fs.readFileSync(htmlPath, 'utf8');
const START = '  <!-- replica-offscreen:start -->';
const END = '  <!-- replica-offscreen:end -->';
const payload = `${START}\n${block}\n${END}`;
if (html.includes(START)) {
  html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), payload);
} else {
  html = html.replace('<div id="wrapper">', `<div id="wrapper">\n${payload}`);
}
fs.writeFileSync(htmlPath, html);
console.log('surfaces', parts.length, 'bytes', payload.length);
