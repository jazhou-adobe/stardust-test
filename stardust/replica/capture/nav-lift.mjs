import { chromium } from 'playwright';
import fs from 'node:fs';
import { newLiveContext, gotoLive } from '../../scripts/diff/live-session.mjs';

const url = process.argv[2];
const out = process.argv[3];
const b = await chromium.launch();
const c = await newLiveContext(b, { viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
await gotoLive(p, url);
await p.waitForTimeout(2500);

const links = await p.evaluate(() => {
  const res = [];
  document.querySelectorAll('main a[href]').forEach((a) => {
    const r = a.getBoundingClientRect();
    let hiddenBy = '';
    for (let e = a; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') {
        hiddenBy = e.tagName.toLowerCase()
          + (e.id ? `#${e.id}` : '')
          + (typeof e.className === 'string' && e.className.trim() ? `.${e.className.trim().split(/\s+/).join('.')}` : '');
        break;
      }
    }
    res.push({
      text: a.textContent.replace(/\s+/g, ' ').trim(),
      href: a.getAttribute('href'),
      visible: r.width > 0 && r.height > 0,
      hiddenBy,
    });
  });
  return res;
});

const texts = await p.evaluate(() => {
  const res = [];
  document.querySelectorAll('main h1,main h2,main h3,main h4,main h5,main h6,main p,main li,main span,main div').forEach((el) => {
    if (el.children.length) return;
    const t = el.textContent.replace(/\s+/g, ' ').trim();
    if (!t) return;
    const r = el.getBoundingClientRect();
    let hiddenBy = '';
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') {
        hiddenBy = e.tagName.toLowerCase()
          + (e.id ? `#${e.id}` : '')
          + (typeof e.className === 'string' && e.className.trim() ? `.${e.className.trim().split(/\s+/).join('.')}` : '');
        break;
      }
    }
    res.push({ tag: el.tagName.toLowerCase(), text: t, visible: r.width > 0 && r.height > 0, hiddenBy });
  });
  return res;
});

const serializeTree = await p.evaluate(() => {
  const walk = (el, depth) => {
    if (depth > 16) return null;
    const cs = getComputedStyle(el);
    const n = {
      tag: el.tagName.toLowerCase(),
      cls: el.getAttribute('class') || '',
      id: el.id || '',
      display: cs.display,
    };
    const a = {};
    for (const at of el.attributes) if (!['class', 'id', 'style'].includes(at.name)) a[at.name] = at.value;
    if (Object.keys(a).length) n.attrs = a;
    const kids = [...el.children];
    if (!kids.length) {
      const t = el.textContent.replace(/\s+/g, ' ').trim();
      if (t) n.text = t;
    } else {
      n.children = kids.map((k) => walk(k, depth + 1)).filter(Boolean);
    }
    return n;
  };
  const roots = [];
  document.querySelectorAll('header, .header, [class*="mega"], [class*="navigation"]').forEach((el) => {
    if (el.closest('header') && el.tagName !== 'HEADER') return;
    roots.push(walk(el, 0));
  });
  return roots;
});

fs.writeFileSync(out, JSON.stringify({ url, links, texts, trees: serializeTree }, null, 1));
console.log('nav →', out, links.length, 'links,', links.filter((l) => !l.visible).length, 'hidden;', texts.length, 'texts');
await b.close();
