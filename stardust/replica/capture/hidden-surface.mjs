import { chromium } from 'playwright';
import fs from 'node:fs';
import { newLiveContext, gotoLive } from '../../scripts/diff/live-session.mjs';

/**
 * Capture the ordered CONTENT MODEL of the live page's hidden interactive
 * surfaces (mega-menu, notification banner, search form, login menus,
 * disclaimer accordion panel). Replica re-authors these as clean hidden
 * markup so the content-diff inventory is symmetric — the live <main> wraps
 * them, so a build without them reads as hundreds of false structural reds
 * (source-fidelity-gate.md § Hardening rule 3).
 */
const url = process.argv[2];
const out = process.argv[3];
const b = await chromium.launch();
const c = await newLiveContext(b, { viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
await gotoLive(p, url);
await p.waitForTimeout(2500);

const roots = [
  '#main-navigation',
  '.nab-header-bar__mega-menu--desktop',
  '.mega-menu--container',
  '.notification-banner',
  'form.nab-header-search__form',
  'nav.login-options-desktop',
  'nav#main-login',
  '#panel--1754297723-0',
];

const model = await p.evaluate((sels) => {
  const clean = (s) => s.replace(/\s+/g, ' ').trim();
  const isHidden = (el) => {
    const cs = getComputedStyle(el);
    return cs.display === 'none' || cs.visibility === 'hidden';
  };
  const collect = (root) => {
    const build = (el) => {
      const tag = el.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || el instanceof SVGElement) return null;
      const n = {
        tag: tag.toLowerCase(),
        cls: el.getAttribute('class') || '',
        text: clean([...el.childNodes].filter((k) => k.nodeType === 3).map((k) => k.nodeValue).join(' ')),
        children: [],
      };
      if (el.getAttribute('href') !== null) n.href = el.getAttribute('href');
      if (tag === 'IMG') { n.src = el.getAttribute('src'); n.alt = el.getAttribute('alt') || ''; return n; }
      for (const k of el.children) {
        const c = build(k);
        if (c) n.children.push(c);
      }
      if (!n.text && !n.children.length && n.href === undefined) return null;
      return n;
    };
    return [build(root)].filter(Boolean);
  };
  const res = [];
  for (const sel of sels) {
    const el = document.querySelector(sel);
    if (!el) continue;
    res.push({ sel, hidden: isHidden(el), stream: collect(el) });
  }
  // the hidden "More …" list items that live inside visible quick-link lists
  const extras = [];
  document.querySelectorAll('li.cmp-list__item').forEach((li) => {
    if (!isHidden(li)) return;
    collect(li).forEach((n) => extras.push(n));
  });
  res.push({ sel: 'li.cmp-list__item[hidden]', hidden: true, stream: extras });
  return res;
}, roots);

fs.writeFileSync(out, JSON.stringify({ url, model }, null, 1));
model.forEach((m) => console.log(m.sel.padEnd(38), m.stream.length, 'nodes'));
await b.close();
