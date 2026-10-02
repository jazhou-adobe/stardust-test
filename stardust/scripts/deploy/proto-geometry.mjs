#!/usr/bin/env node
/*
 * Measures the approved prototype's band and life-band offsets so the EDS
 * build can be reconciled against real numbers rather than eyeballed.
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const file = process.argv[2] || 'stardust/prototypes/index-proposed.html';
const width = Number(process.argv[3] || 1440);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 900 } });
await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);

const report = await page.evaluate(() => {
  const vis = (el) => el && !el.closest('.replica-offscreen');
  const rect = (sel) => {
    const el = [...document.querySelectorAll(sel)].find(vis);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + window.scrollY),
    };
  };
  return {
    docHeight: document.documentElement.scrollHeight,
    geometry: {
      header: rect('.nab-header-bar'),
      masthead: rect('.band--masthead'),
      tile: rect('.nab-tile--banner'),
      quicklinks: rect('.band--quicklinks'),
      featurePair: rect('.feature-pair'),
      businessSection: rect('.business-section'),
      award: rect('.award'),
      lifeBand: rect('.band--life'),
      lifeHeading: rect('.band--life > .cmp-title__heading'),
      lede: rect('.band--life > p.lede'),
      lifeCards: rect('.life-cards'),
      reasonsTitle: rect('.reasons-title'),
      reasonsCards: rect('.reasons-cards'),
      separator: rect('.life-separator'),
      helpGrid: rect('.help-grid'),
      contactTitle: rect('.contact-title'),
      contactGrid: rect('.contact-grid'),
      interpreters: rect('.interpreters'),
      nrs: rect('.nrs'),
      disclaimer: rect('.band--disclaimer'),
      footer: rect('.nab-footer'),
    },
  };
});

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
await browser.close();
