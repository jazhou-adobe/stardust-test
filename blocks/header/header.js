import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { icon } from '../../scripts/icons.js';

/*
 * NAB replica header.
 *
 * Decodes the authored /nav document:
 *   section with an <img>   -> brand (logo link + logo image)
 *   section with a <ul>     -> one mega-menu entry (anchor + its level-2 panel)
 *   section with a <code>   -> login row (service label + login link)
 *
 * Behaviour carried over from stardust/dynamic-features-plan.md:
 *   D1 - the login selector toggles "show-main-login" on the page wrapper.
 *   D2 - a mega-menu anchor opens its panel; Escape closes; focus is trapped
 *        inside an open panel. Panels stay in the DOM, hidden, when closed.
 */

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function tag(name, className, attrs = {}) {
  const node = document.createElement(name);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

/*
 * wrapTextNodes may fold a whole cell into a single <p>; always look through a
 * wrapper paragraph rather than trusting the authored child order.
 */
function contentOf(section) {
  const wrapper = section.querySelector(':scope > div') || section;
  const out = [];
  [...wrapper.children].forEach((child) => {
    if (child.tagName === 'P' && child.querySelector('h1,h2,h3,h4,h5,h6,ul,ol,img,picture,p')) {
      out.push(...child.children);
    } else {
      out.push(child);
    }
  });
  return out;
}

function buildHamburger() {
  const hamburger = tag('a', 'nab-header-bar__hamburger', { id: 'menu', href: '#', 'aria-label': 'Main menu' });
  ['top-bar', 'middle-bar', 'bottom-bar'].forEach((id) => {
    hamburger.append(tag('div', 'hamburger-layer', { id }));
  });
  const srOnly = tag('p', 'sr-only nab-header-bar__mega-menu');
  srOnly.textContent = 'Main menu';
  hamburger.append(srOnly);
  return hamburger;
}

function buildBrand(section) {
  const link = section.querySelector('a');
  const img = section.querySelector('img');
  if (!link) return null;
  link.className = 'nab-header-bar__logo';
  link.setAttribute('aria-label', link.textContent.trim() || 'NAB home');
  link.textContent = '';
  if (img) {
    img.setAttribute('width', '88');
    img.setAttribute('height', '50');
    img.setAttribute('alt', '');
    link.append(img);
  }
  return link;
}

/* One authored panel section -> { anchor, panel }. The anchor is the authored
   node, moved; only the chrome around it is generated. */
function buildMenuEntry(section, index) {
  const parts = contentOf(section);
  const paragraph = parts.find((node) => node.tagName === 'P');
  const anchor = (paragraph && paragraph.querySelector('a')) || section.querySelector('a');
  const list = parts.find((node) => node.tagName === 'UL') || section.querySelector('ul');
  if (!anchor) return null;

  const panelId = `mega-menu-panel-${index}`;
  anchor.className = 'mega-menu-anchor';
  anchor.setAttribute('aria-expanded', 'false');
  anchor.setAttribute('aria-controls', panelId);
  anchor.setAttribute('data-menuitem', `${index}`);

  const panel = tag('div', 'mega-menu__panel', { id: panelId, hidden: '' });
  if (list) {
    list.className = 'cmp-list mega-menu__list';
    [...list.children].forEach((item) => {
      item.classList.add('cmp-list__item');
      const link = item.querySelector('a');
      if (!link) return;
      link.classList.add('cmp-list__item-link');
      const title = tag('span', 'cmp-list__item-title');
      while (link.firstChild) title.append(link.firstChild);
      link.append(title, icon('icon-chevron-right', 'cmp-list__item-icon'));
    });
    panel.append(list);
  }
  return { anchor, panel };
}

function buildLogin(section) {
  const parts = contentOf(section);
  const service = section.querySelector('code');
  const loginLink = section.querySelector('a');

  const container = tag('div', 'login-container');
  const select = tag('button', 'login-select-desktop', { type: 'button' });
  const current = tag('span', 'current-dropdown-item');
  if (service) {
    while (service.firstChild) current.append(service.firstChild);
    service.remove();
  }
  select.append(current, icon('icon-chevron-down'));

  const mobileText = loginLink ? loginLink.textContent.trim() : 'Login';
  if (loginLink) {
    loginLink.className = 'quick-login';
    const label = tag('span', 'desktop-login-label');
    while (loginLink.firstChild) label.append(loginLink.firstChild);
    loginLink.append(label);
  }

  const mobile = tag('button', 'login-select', { id: 'login', type: 'button', 'aria-expanded': 'false' });
  const mobileLabel = tag('span', 'mobile-login-label');
  mobileLabel.textContent = mobileText;
  mobile.append(mobileLabel);

  container.append(select);
  if (loginLink) container.append(loginLink);
  container.append(mobile);
  parts.forEach((node) => node.remove());
  return container;
}

function buildSkipLinks() {
  const fragment = document.createDocumentFragment();
  [
    ['#login', 'Skip to login', 'skip-links__link skip-links__login'],
    ['#main-content', 'Skip to main content', 'skip-links__link'],
  ].forEach(([href, text, className]) => {
    const link = tag('a', className, { href });
    link.textContent = text;
    fragment.append(link);
  });
  return fragment;
}

/* ---------- D2: mega menu ---------- */

function wireMegaMenu(block, entries) {
  const closeAll = (focusAnchor) => {
    entries.forEach(({ anchor, panel }) => {
      anchor.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
    });
    block.classList.remove('mega-menu-open');
    if (focusAnchor) focusAnchor.focus();
  };

  entries.forEach(({ anchor, panel }) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const wasOpen = anchor.getAttribute('aria-expanded') === 'true';
      closeAll();
      if (wasOpen) return;
      anchor.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      block.classList.add('mega-menu-open');
      const target = panel.querySelector(FOCUSABLE);
      if (target) target.focus();
    });
  });

  block.addEventListener('keydown', (e) => {
    const open = entries.find(({ anchor }) => anchor.getAttribute('aria-expanded') === 'true');
    if (!open) return;
    if (e.code === 'Escape') {
      e.preventDefault();
      closeAll(open.anchor);
      return;
    }
    if (e.code !== 'Tab') return;
    const stops = [open.anchor, ...open.panel.querySelectorAll(FOCUSABLE)];
    const first = stops[0];
    const last = stops[stops.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) closeAll();
  });
}

/* ---------- D1: login selector ---------- */

function wireLoginSelect(block) {
  const button = block.querySelector('.login-select');
  if (!button) return;
  button.addEventListener('click', (e) => {
    e.preventDefault();
    const wrap = document.querySelector('.page-outer') || document.body;
    wrap.classList.toggle('show-main-login');
    const open = wrap.classList.contains('show-main-login');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  const sections = [...((fragment && fragment.children) || [])];
  const brandSection = sections.find((s) => s.querySelector('img'));
  const loginSection = sections.find((s) => s.querySelector('code'));
  const panelSections = sections.filter((s) => s.querySelector('ul') && s !== loginSection);

  const bar = tag('header', 'nab-header-bar', { id: 'header-container' });
  const inner = tag('div', 'nab-header-bar--inner');

  inner.append(buildHamburger());
  const brand = brandSection ? buildBrand(brandSection) : null;
  if (brand) inner.append(brand);

  const loginOptions = tag('nav', 'login-options-desktop', { 'aria-label': 'Login to a NAB service' });
  loginOptions.append(icon('icon-chevron-down'));
  inner.append(loginOptions);

  const nav = tag('nav', 'nab-header-bar__nav');
  const menu = tag('div', 'mega-menu');
  const entries = [];
  panelSections.forEach((section, i) => {
    const entry = buildMenuEntry(section, i + 1);
    if (!entry) return;
    nav.append(entry.anchor);
    menu.append(entry.panel);
    entries.push(entry);
  });
  inner.append(nav);

  const search = tag('div', 'nab-header-search');
  const searchButton = tag('a', 'nab-header-search__search-button', { href: '#', 'aria-label': 'Search' });
  searchButton.append(icon('icon-search'));
  search.append(searchButton);
  inner.append(search);

  if (loginSection) inner.append(buildLogin(loginSection));

  bar.append(inner);
  if (entries.length) bar.append(menu);

  block.textContent = '';
  block.append(buildSkipLinks(), bar);

  wireMegaMenu(block, entries);
  wireLoginSelect(block);
}
