import fs from 'node:fs';

/**
 * Mobile restructure: the live page swaps the desktop header controls for a
 * hamburger + mobile login, and collapses the quick-links and footer columns
 * into accordions. Those accordion labels already exist in the replicated
 * hidden surface — here they move into their real places so a media query can
 * show them, exactly as live does.
 */
const file = 'stardust/prototypes/index-proposed.html';
let html = fs.readFileSync(file, 'utf8');

if (!html.includes('id="menu"')) {
  html = html.replace(
    '  <div class="nab-header-bar--inner">\n',
    `  <div class="nab-header-bar--inner">
      <a id="menu" class="nab-header-bar__hamburger" href="#" aria-label="Main menu">
        <div id="top-bar" class="hamburger-layer"></div>
        <div id="middle-bar" class="hamburger-layer"></div>
        <div id="bottom-bar" class="hamburger-layer"></div>
      </a>
`,
  );
  html = html.replace(
    '        <a class="quick-login" href="https://ib.nab.com.au/login"><span class="desktop-login-label">Login</span></a>',
    `        <a class="quick-login" href="https://ib.nab.com.au/login"><span class="desktop-login-label">Login</span></a>
        <button id="login" class="login-select" type="button"><span class="mobile-login-label">Login</span></button>`,
  );
}

const accordion = (id, level, icon, label) => `        <li class="nab-accordion__item">
          <${level} class="nab-accordion__header"><button id="${id}" class="nab-accordion__button" type="button">${
  icon ? `\n            <svg class="nab-accordion__icon" aria-hidden="true" focusable="false"><use xlink:href="#${icon}"></use></svg>` : ''
}
            <span class="nab-accordion__title__header"><span class="nab-accordion__title__description">${label}</span></span>
            <svg class="nab-accordion__chevron" aria-hidden="true" focusable="false"><use xlink:href="#icon-chevron-down"></use></svg>
          </button></${level}>
        </li>`;

if (!html.includes('quicklinks__accordion')) {
  const items = [
    ['nab-button--2051472726-0', 'icon-savings', 'Everyday banking'],
    ['nab-button--2051472726-1', 'icon-credit-card', 'Credit cards'],
    ['nab-button--2051472726-2', 'icon-home', 'Home loans'],
    ['nab-button--2051472726-3', 'icon-business', 'Business banking'],
  ].map(([id, icon, label]) => accordion(id, 'h3', icon, label)).join('\n');
  html = html.replace(
    '      <div class="quicklinks__grid">',
    `      <ul class="cmp-list nab-accordion quicklinks__accordion">\n${items}\n      </ul>\n      <div class="quicklinks__grid">`,
  );
}

if (!html.includes('nab-footer__accordion')) {
  const items = [
    ['nab-button--1366208962-0', 'Quick links'],
    ['nab-button--1366208962-1', 'About us'],
    ['nab-button--1366208962-2', 'Policies and terms'],
    ['nab-button--1366208962-3', 'Connect with us'],
  ].map(([id, label]) => accordion(id, 'h2', null, label)).join('\n');
  html = html.replace(
    '      <div class="nab-footer__columns">',
    `      <ul class="cmp-list nab-accordion nab-footer__accordion">\n${items}\n      </ul>\n      <div class="nab-footer__columns">`,
  );
}

// The eight labels now live in the page proper; drop the offscreen duplicates.
html = html.replace(
  /\n {6}<h[23] class="nab-accordion__header"><button class="nab-accordion__button" type="button"><span class="nab-accordion__title__header">[\s\S]*?<\/button><\/h[23]>/g,
  '',
);

fs.writeFileSync(file, html);
console.log('hamburger', html.includes('id="menu"'),
  '| quicklinks accordion', html.includes('quicklinks__accordion'),
  '| footer accordion', html.includes('nab-footer__accordion'),
  '| accordion buttons', (html.match(/nab-accordion__title__description/g) || []).length);
