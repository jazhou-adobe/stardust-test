#!/usr/bin/env node
/**
 * Replica CSS lift for the NAB home archetype.
 * Dumps document-level tokens, top-level section anchors, and per-element
 * computed styles + rects, using the hardened live session from diff/.
 *
 * usage: node stardust/replica/capture/lift.mjs <url> <out.json> [--width 1440]
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { newLiveContext, gotoLive, dismissOverlays } from '../../scripts/diff/live-session.mjs';

const [, , url, out] = process.argv;
const wIdx = process.argv.indexOf('--width');
const width = wIdx > -1 ? Number(process.argv[wIdx + 1]) : 1440;

const browser = await chromium.launch();
const ctx = await newLiveContext(browser, { viewport: { width, height: 900 } });
const page = await ctx.newPage();
await gotoLive(page, url, { settleMs: 2500 });
await dismissOverlays(page);
await page.mouse.move(2, 2);
await page.waitForTimeout(1200);

const data = await page.evaluate(() => {
  const cs = (el) => getComputedStyle(el);
  const pick = (el, keys) => {
    const s = cs(el);
    const o = {};
    keys.forEach((k) => { o[k] = s[k]; });
    return o;
  };
  const TEXT = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing', 'textTransform', 'color', 'textAlign', 'textWrap'];
  const BOX = ['display', 'position', 'width', 'maxWidth', 'minHeight', 'height', 'margin', 'padding', 'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'border', 'borderRadius', 'boxShadow', 'gap', 'gridTemplateColumns', 'flexDirection', 'alignItems', 'justifyContent', 'overflow'];
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return [Math.round(r.x), Math.round(r.y + window.scrollY), Math.round(r.width), Math.round(r.height)];
  };
  const sel = (el) => {
    const id = el.id ? `#${el.id}` : '';
    const cls = (el.className && typeof el.className === 'string')
      ? `.${el.className.trim().split(/\s+/).slice(0, 4).join('.')}` : '';
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  };

  const bodyS = cs(document.body);
  const doc = {
    docHeight: document.documentElement.scrollHeight,
    viewport: [window.innerWidth, window.innerHeight],
    body: pick(document.body, [...TEXT, 'backgroundColor', 'margin']),
    rendering: {
      textRendering: bodyS.textRendering,
      webkitFontSmoothing: bodyS.webkitFontSmoothing,
      fontSynthesis: bodyS.fontSynthesis,
      fontVariantNumeric: bodyS.fontVariantNumeric,
      fontKerning: bodyS.fontKerning,
    },
    customProps: (() => {
      const o = {};
      for (const sheet of Array.from(document.styleSheets)) {
        let rules;
        try { rules = sheet.cssRules; } catch { continue; }
        for (const r of Array.from(rules || [])) {
          if (r.style && r.selectorText && /^(:root|html|body)/.test(r.selectorText)) {
            for (const p of Array.from(r.style)) {
              if (p.startsWith('--')) o[p] = r.style.getPropertyValue(p).trim();
            }
          }
        }
      }
      return o;
    })(),
    stylesheets: Array.from(document.styleSheets).map((s) => s.href).filter(Boolean),
  };

  const mains = Array.from(document.querySelectorAll('main, [role=main], #main, .main, #content, .content'))
    .map((el) => ({ sel: sel(el), rect: rect(el) }));

  const describe = (el, depth) => {
    const node = {
      sel: sel(el),
      tag: el.tagName.toLowerCase(),
      rect: rect(el),
      box: pick(el, BOX),
    };
    const ownText = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (ownText) { node.text = ownText.slice(0, 300); node.type = pick(el, TEXT); }
    if (el.tagName === 'IMG') {
      node.img = {
        src: el.currentSrc || el.src,
        alt: el.alt,
        natural: [el.naturalWidth, el.naturalHeight],
        srcset: (el.getAttribute('srcset') || '').slice(0, 400),
        sizes: el.getAttribute('sizes'),
      };
    }
    if (el.tagName === 'A' || el.tagName === 'BUTTON') {
      node.link = { href: el.getAttribute('href'), label: el.innerText.trim().slice(0, 120) };
      node.type = pick(el, TEXT);
    }
    if (/^H[1-6]$/.test(el.tagName)) {
      node.type = pick(el, TEXT);
      node.text = el.innerText.trim().slice(0, 300);
      const span = el.querySelector('span');
      if (span) node.innerSpanType = pick(span, TEXT);
    }
    if (depth > 0) {
      const kids = Array.from(el.children).filter((c) => {
        const s = cs(c);
        if (s.display === 'none' || s.visibility === 'hidden') return false;
        const r = c.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      if (kids.length) node.children = kids.map((c) => describe(c, depth - 1));
    }
    return node;
  };

  const header = document.querySelector('header, [role=banner], .header');
  const footer = document.querySelector('footer, [role=contentinfo], .footer');

  const visibleKids = (el) => Array.from(el.children).filter((c) => {
    const s = cs(c);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    const r = c.getBoundingClientRect();
    return r.height > 4;
  });

  // unwrap single-child wrapper chains until a real band list appears
  let bandRoot = document.querySelector('main') || document.querySelector('#main') || document.body;
  for (let i = 0; i < 12; i += 1) {
    const kids = visibleKids(bandRoot);
    if (kids.length !== 1) break;
    bandRoot = kids[0];
  }
  const sections = visibleKids(bandRoot).map((c) => describe(c, 4));

  return {
    doc,
    mains,
    contentRootSel: sel(bandRoot),
    header: header ? describe(header, 6) : null,
    footer: footer ? describe(footer, 6) : null,
    sections,
  };
});

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ url, width, capturedAt: new Date().toISOString(), ...data }, null, 1));
console.log(`lift → ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB, docHeight ${data.doc.docHeight})`);
await browser.close();
