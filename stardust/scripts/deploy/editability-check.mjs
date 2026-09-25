#!/usr/bin/env node
/*
 * Editor-workspace editability gate.
 *
 * The da.live canvas edits the *authored* nodes. A block that rebuilds text
 * from textContent/innerHTML, retags it, or clones it leaves the author editing
 * something the page no longer renders — or editing one of two copies.
 *
 * Method: intercept the page response and stamp every outermost authored
 * block-level element with a unique data-ew marker before the browser parses
 * it. After decoration, each marker must survive on exactly one element, and
 * that element must still carry the text it was stamped with.
 *
 * Usage: node stardust/scripts/deploy/editability-check.mjs [url]
 */
import { chromium } from 'playwright';
import { readFile } from 'fs/promises';

const url = process.argv[2] || 'http://localhost:3033/';

/* Stamp the authored markup. Only opening tags of outermost prose elements are
   touched; nesting is handled by tracking depth of the same tag names. */
function instrument(html, prefix) {
  let index = 0;
  const depth = { value: 0 };
  return html.replace(/<(\/?)(h[1-6]|p|ul|ol|pre|blockquote)(\s[^>]*)?>/gi, (match, slash, tagName, attrs) => {
    if (slash) {
      depth.value = Math.max(0, depth.value - 1);
      return match;
    }
    const outermost = depth.value === 0;
    depth.value += 1;
    if (!outermost) return match;
    index += 1;
    return `<${tagName}${attrs || ''} data-ew="${prefix}-${index}">`;
  });
}

const sources = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const local = (p) => readFile(new URL(p, `file://${process.cwd()}/`), 'utf8');

await page.route('**/*', async (route) => {
  const target = new URL(route.request().url());
  const map = {
    '/': 'stardust/.work/harness/index.html',
    '/nav.plain.html': 'content/nav.html',
    '/footer.plain.html': 'content/footer.html',
  };
  const file = map[target.pathname];
  if (!file) {
    await route.continue();
    return;
  }
  let body = await local(file);
  if (file.startsWith('content/')) {
    const match = body.match(/<main>([\s\S]*)<\/main>/i);
    body = match ? match[1] : body;
  }
  const instrumented = instrument(body, file);
  sources.push(instrumented);
  await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: instrumented });
});

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForSelector('body.appear', { timeout: 15000 });
await page.waitForTimeout(2000);

const report = await page.evaluate((authoredSources) => {
  const norm = (value) => value.replace(/\s+/g, ' ').trim();

  /* The smallest editable units inside an authored node. A <ul> of links has
     one per link; a <p> of prose has one. */
  const leafTexts = (el) => {
    const leaves = [...el.querySelectorAll('*')].filter((node) => !node.firstElementChild);
    const nodes = leaves.length ? leaves : [el];
    return [...new Set(nodes.map((node) => norm(node.textContent)).filter(Boolean))];
  };

  const authored = new Map();
  authoredSources.forEach((html) => {
    const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
    doc.querySelectorAll('[data-ew]').forEach((el) => {
      authored.set(el.getAttribute('data-ew'), leafTexts(el));
    });
  });

  /* What survived decoration. */
  const markers = {};
  document.querySelectorAll('[data-ew]').forEach((el) => {
    const key = el.getAttribute('data-ew');
    markers[key] = (markers[key] || 0) + 1;
  });

  /* Every string the decorated page renders or announces. An authored node may
     legitimately be unwrapped, or its text moved to aria-label/alt, so long as
     the string still reaches the reader. */
  const surface = new Set();
  document.querySelectorAll('body *').forEach((el) => {
    if (!el.firstElementChild) surface.add(norm(el.textContent));
    ['aria-label', 'alt', 'title', 'value'].forEach((attr) => {
      const value = el.getAttribute(attr);
      if (value) surface.add(norm(value));
    });
  });

  const lost = [];
  const duplicated = [];
  const unwrapped = [];

  authored.forEach((texts, key) => {
    const count = markers[key] || 0;
    if (count > 1) {
      duplicated.push(`${key} x${count} - ${texts[0] || ''}`);
      return;
    }
    if (count === 1) return;
    const missing = texts.filter((text) => !surface.has(text));
    if (missing.length) lost.push(`${key} - ${missing.map((t) => `"${t.slice(0, 50)}"`).join(', ')}`);
    else unwrapped.push(`${key} - ${texts.length} text(s), first "${(texts[0] || '').slice(0, 40)}"`);
  });

  return {
    total: authored.size, lost, duplicated, unwrapped,
  };
}, sources);

await browser.close();

const failures = report.lost.length + report.duplicated.length;
const intact = report.total - failures - report.unwrapped.length;

process.stdout.write(`authored prose nodes instrumented:   ${report.total}\n`);
process.stdout.write(`authored node survives decoration:   ${intact}\n`);
process.stdout.write(`unwrapped, every text still present: ${report.unwrapped.length}\n`);
process.stdout.write(`text lost (rebuilt from scratch):    ${report.lost.length}\n`);
process.stdout.write(`node duplicated (cloned):            ${report.duplicated.length}\n`);
report.lost.forEach((line) => process.stdout.write(`  LOST ${line}\n`));
report.duplicated.forEach((line) => process.stdout.write(`  DUPLICATED ${line}\n`));
report.unwrapped.forEach((line) => process.stdout.write(`  unwrapped ${line}\n`));
process.exit(failures ? 1 : 0);
