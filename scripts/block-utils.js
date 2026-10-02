/*
 * NAB replica — shared block helpers.
 *
 * Blocks import from /scripts/ only (fragment/fragment.js is the single
 * sanctioned cross-block import in this codebase), so the two decode rules that
 * every band needs live here rather than being copied per block.
 */

import { icon } from './icons.js';

/*
 * wrapTextNodes() runs before decorate(): any cell whose first element child is
 * not P/PRE/UL/OL/PICTURE/TABLE/H1-6 — or that leads with a picture followed by
 * more content — is folded into a single wrapper <p>. Reading cell.children
 * then silently drops everything. Always collect through the wrapper.
 */
export function parts(cell) {
  const out = [];
  [...cell.children].forEach((child) => {
    if (child.tagName === 'P' && child.querySelector('h1,h2,h3,h4,h5,h6,ul,ol,img,picture,p')) {
      out.push(...child.children);
    } else {
      out.push(child);
    }
  });
  return out;
}

/** First element in `cell` matching `selector`, looking through a wrapper <p>. */
export function pick(cell, selector) {
  return cell.querySelector(selector);
}

function isExternal(href) {
  return /^https?:\/\//i.test(href) && !href.startsWith(window.location.origin);
}

/*
 * Turns an authored <ul> into the site's most repeated module, the chevron
 * list. Internal links get a chevron; external links get the live "opens in new
 * window" suffix and the external-link glyph. The authored <li>/<a> nodes are
 * kept and their text is moved into the title span, so the workspace keeps them
 * editable.
 */
export function cmpList(list, extraClass) {
  if (!list) return null;
  list.classList.add('cmp-list');
  if (extraClass) list.classList.add(extraClass);
  [...list.children].forEach((item) => {
    item.classList.add('cmp-list__item');
    const link = item.querySelector('a');
    if (!link) return;
    link.classList.remove('button', 'primary', 'secondary', 'accent');
    link.classList.add('cmp-list__item-link');

    const title = document.createElement('span');
    title.className = 'cmp-list__item-title';
    while (link.firstChild) title.append(link.firstChild);
    link.append(title);

    const href = link.getAttribute('href') || '';
    if (isExternal(href)) {
      const note = document.createElement('span');
      note.className = 'sr-only';
      note.textContent = ', opens in new window';
      link.append(' ', note, ' ', icon('icon-link', 'cmp-list__item-icon'));
    } else {
      link.append(' ', icon('icon-chevron-right', 'cmp-list__item-icon'));
    }
  });
  return list;
}

/*
 * The captured tertiary CTA is an underlined red label plus a trailing chevron.
 * decorateButtons() has already produced a.button.secondary from the authored
 * <em><a>; this only adds the label span and the glyph.
 */
export function tertiaryCta(link) {
  if (!link || link.querySelector('.nab-button__label')) return link;
  const label = document.createElement('span');
  label.className = 'nab-button__label';
  while (link.firstChild) label.append(link.firstChild);
  link.append(label, icon('icon-chevron-right'));
  return link;
}

/** Reads and removes the authored `<code>icon-id</code>` encode cell. */
export function iconId(scope) {
  const code = scope.querySelector('code');
  if (!code) return null;
  const id = code.textContent.trim();
  const wrapper = code.parentElement;
  code.remove();
  // wrapTextNodes() puts the encode cell in its own <p>; left behind it would
  // still take a line box (and any min-height the band sets on paragraphs).
  if (wrapper && wrapper !== scope && wrapper.tagName === 'P' && !wrapper.textContent.trim() && !wrapper.querySelector('img,picture,svg,a')) {
    wrapper.remove();
  }
  return id;
}
