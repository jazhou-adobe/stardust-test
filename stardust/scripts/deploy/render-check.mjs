#!/usr/bin/env node
/*
 * Renders the decorated EDS page and reports what the runtime actually built,
 * so block decode faults surface before any pixel comparison.
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';

const url = process.argv[2] || 'http://localhost:3033/';
const width = Number(process.argv[3] || 1440);
const out = process.argv[4];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 900 } });

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});
page.on('requestfailed', (r) => errors.push(`404/fail: ${r.url()}`));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForSelector('body.appear', { timeout: 15000 });
await page.waitForFunction(
  () => ![...document.querySelectorAll('[data-block-status]')]
    .some((b) => b.dataset.blockStatus !== 'loaded'),
  null,
  { timeout: 15000 },
);
await page.evaluate(async () => {
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise((r) => { setTimeout(r, 400); });
  window.scrollTo(0, 0);
});
await page.waitForTimeout(500);

const report = await page.evaluate(() => {
  const rect = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + window.scrollY),
    };
  };
  return {
    docHeight: document.documentElement.scrollHeight,
    blocks: [...document.querySelectorAll('[data-block-name]')]
      .map((b) => `${b.dataset.blockName}:${b.dataset.blockStatus}`),
    geometry: {
      header: rect('.nab-header-bar'),
      masthead: rect('.masthead'),
      tile: rect('.nab-tile--banner'),
      quicklinks: rect('.quicklinks'),
      featurePair: rect('.feature-pair__inner'),
      businessSection: rect('.business-section'),
      award: rect('.award__inner'),
      lifeCards: rect('.link-cards--text'),
      reasonsCards: rect('.link-cards--media'),
      helpGrid: rect('.help-grid'),
      contactTiles: rect('.contact-tiles'),
      interpreters: rect('.interpreters'),
      nrs: rect('.nrs'),
      disclaimer: rect('.disclaimer'),
      footer: rect('.nab-footer'),
    },
    counts: {
      navAnchors: document.querySelectorAll('.mega-menu-anchor').length,
      megaPanels: document.querySelectorAll('.mega-menu__panel').length,
      quicklinkCols: document.querySelectorAll('.quicklinks__col').length,
      linkCards: document.querySelectorAll('.nab-link-card').length,
      contactTiles: document.querySelectorAll('.contact-tile').length,
      footerLinks: document.querySelectorAll('.nab-footer__link').length,
      footerAccordion: document.querySelectorAll('.nab-footer__accordion .nab-accordion__item').length,
      cmpItems: document.querySelectorAll('.cmp-list__item').length,
      emptyUse: [...document.querySelectorAll('use')]
        .filter((u) => !document.querySelector(u.getAttribute('href') || '#none')).length,
      leftoverCode: document.querySelectorAll('main code').length,
    },
  };
});

report.errors = errors;
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

if (out) {
  mkdirSync(out.replace(/\/[^/]+$/, ''), { recursive: true });
  await page.screenshot({ path: out, fullPage: true });
  writeFileSync(out.replace(/\.png$/, '.json'), JSON.stringify(report, null, 2));
}

await browser.close();
