import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { icon } from '../../scripts/icons.js';

/*
 * NAB replica footer.
 *
 * Decodes the authored /footer document: every section that carries a <ul> is a
 * link column (its <h2> is the column heading); the section without one is the
 * legal block.
 *
 * D5 (stardust/dynamic-features-plan.md): the accordion rendering exists in the
 * DOM at both breakpoints and CSS decides which is shown. The toggle is wired
 * only under matchMedia('(max-width: 767px)'), with no transition - nothing was
 * observed animating on live. No panel contents were captured (live lazy-loads
 * them), so the toggle flips state and nothing else.
 */

const isMobile = window.matchMedia('(max-width: 767px)');

const SOCIAL_ICONS = [
  ['linkedin.com', 'icon-linkedin'],
  ['facebook.com', 'icon-facebook'],
  ['instagram.com', 'icon-instagram'],
  ['youtube.com', 'icon-you-tube'],
  ['x.com', 'icon-twitter'],
  ['tiktok.com', 'icon-tiktok'],
];

function tag(name, className, attrs = {}) {
  const node = document.createElement(name);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function isExternal(href) {
  return /^https?:\/\//i.test(href) && !href.startsWith(window.location.origin);
}

function socialIconId(href) {
  const match = SOCIAL_ICONS.find(([host]) => href.includes(host));
  return match ? match[1] : null;
}

/* Moves the anchor's own text into the title span - the anchor node itself is
   preserved so the workspace keeps it editable. */
function decorateLink(link) {
  const href = link.getAttribute('href') || '';
  link.classList.remove('button', 'primary', 'secondary', 'accent');
  link.className = 'nab-footer__link';

  const title = tag('span', 'cmp-list__item-title');
  while (link.firstChild) title.append(link.firstChild);

  const social = socialIconId(href);
  if (social) link.append(icon(social));
  link.append(title);

  if (isExternal(href)) {
    const note = tag('span', 'sr-only');
    note.textContent = ', opens in new window';
    link.append(' ', note, ' ', icon('icon-link'));
  }
  return link;
}

/* A column section -> a <div> of heading + flattened anchors. The authored
   nodes are moved; the emptied list scaffolding is discarded. */
function buildColumn(section) {
  const column = document.createElement('div');
  const heading = section.querySelector('h1,h2,h3,h4,h5,h6');
  const list = section.querySelector('ul,ol');

  let label = '';
  if (heading) {
    label = heading.textContent.trim();
    heading.classList.add('nab-footer__heading');
    column.append(heading);
  }
  if (list) {
    list.querySelectorAll('a').forEach((link) => column.append(decorateLink(link)));
    list.remove();
  }
  return { column, label };
}

/*
 * The capture only ever shows the closed accordion — live lazy-loads each
 * panel on first open, so nothing below the header was ever recorded. The
 * links do exist in the authored footer, as the desktop columns, so each panel
 * borrows its column rather than cloning it: one copy in the DOM, moved to
 * wherever the current breakpoint renders it.
 */
function buildAccordion(labels) {
  const list = tag('ul', 'cmp-list nab-accordion nab-footer__accordion');
  labels.forEach((label) => {
    const item = tag('li', 'nab-accordion__item');
    const header = tag('h2', 'nab-accordion__header');
    const button = tag('button', 'nab-accordion__button', { type: 'button', 'aria-expanded': 'false' });
    const titleHeader = tag('span', 'nab-accordion__title__header');
    const description = tag('span', 'nab-accordion__title__description');
    description.textContent = label;
    titleHeader.append(description);
    button.append(titleHeader, icon('icon-chevron-down', 'nab-accordion__chevron'));
    header.append(button);
    item.append(header, tag('div', 'nab-accordion__panel'));
    list.append(item);
  });
  return list;
}

function buildBackToTop() {
  const link = tag('a', 'nab-footer__back-to-top-link', { href: '#' });
  link.append(icon('icon-back', 'nab-footer__back-to-top-icon'), ' Top ');
  return link;
}

/* ---------- D5 ---------- */

function movePanels(accordion, columns, toAccordion) {
  const items = [...accordion.querySelectorAll('.nab-accordion__item')];
  const cols = [...columns.children];
  items.forEach((item, i) => {
    const panel = item.querySelector('.nab-accordion__panel');
    const column = cols[i];
    if (!panel || !column) return;
    if (toAccordion) {
      while (column.childNodes.length > 1) panel.append(column.childNodes[1]);
    } else {
      while (panel.firstChild) column.append(panel.firstChild);
    }
  });
}

function closeAll(accordion) {
  accordion.querySelectorAll('.nab-accordion__button').forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
    const item = button.closest('.nab-accordion__item');
    if (item) item.classList.remove('nab-accordion__item--open');
  });
}

function wireAccordion(accordion, columns) {
  if (isMobile.matches) movePanels(accordion, columns, true);

  accordion.addEventListener('click', (e) => {
    if (!isMobile.matches) return;
    const button = e.target.closest('.nab-accordion__button');
    if (!button) return;
    const item = button.closest('.nab-accordion__item');
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', open ? 'false' : 'true');
    if (item) item.classList.toggle('nab-accordion__item--open', !open);
  });

  isMobile.addEventListener('change', () => {
    closeAll(accordion);
    movePanels(accordion, columns, isMobile.matches);
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  const sections = [...((fragment && fragment.children) || [])];
  const columnSections = sections.filter((s) => s.querySelector('ul,ol'));
  const legalSection = sections.find((s) => !s.querySelector('ul,ol'));

  const footer = tag('footer', 'nab-footer');
  const container = tag('div', 'container');
  const columns = tag('div', 'nab-footer__columns');

  const labels = [];
  columnSections.forEach((section) => {
    const { column, label } = buildColumn(section);
    columns.append(column);
    if (label) labels.push(label);
  });

  const accordion = buildAccordion(labels);
  container.append(accordion, columns);

  if (legalSection) {
    const legal = tag('div', 'nab-footer__legal');
    const wrapper = legalSection.querySelector(':scope > div') || legalSection;
    while (wrapper.firstChild) legal.append(wrapper.firstChild);
    container.append(legal);
  }

  footer.append(buildBackToTop(), container);

  block.textContent = '';
  block.append(footer);

  wireAccordion(accordion, columns);
}
