#!/usr/bin/env node
/*
 * Side-by-side element measurements for reconciling the EDS build against the
 * approved prototype. Selectors differ between the two trees, so each probe is
 * a [prototypeSelector, edsSelector] pair.
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const PAIRS = [
  ['.contact-tile', '.contact-tile'],
  ['.contact-tile__body', '.contact-tile__body'],
  ['.contact-tile__body h3', '.contact-tile__body h3'],
  ['.contact-tile__body p', '.contact-tile__body p'],
  ['.contact-tile__body .nab-button', '.contact-tile__body a.button'],
  ['.interpreters__body', '.interpreters__body'],
  ['.interpreters__body h2', '.interpreters__body h2'],
  ['.interpreters__body p', '.interpreters__body p'],
  ['.interpreters__lists', '.interpreters__lists'],
  ['.interpreters__cta', '.interpreters__cta'],
  ['.nab-tile--banner', '.nab-tile--banner'],
  ['.nab-footer__columns', '.nab-footer__columns'],
  ['.nab-footer__legal', '.nab-footer__legal'],
];

const browser = await chromium.launch();

async function measure(url, index) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  if (url.startsWith('http')) {
    await page.waitForSelector('body.appear', { timeout: 15000 });
    await page.waitForTimeout(1500);
  } else {
    await page.waitForTimeout(400);
  }
  const out = await page.evaluate(([pairs, i]) => pairs.map((pair) => {
    const sel = pair[i];
    const el = [...document.querySelectorAll(sel)].find((e) => !e.closest('.replica-offscreen'));
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { h: Math.round(r.height), top: Math.round(r.top + window.scrollY) };
  }), [PAIRS, index]);
  await page.close();
  return out;
}

const proto = await measure(pathToFileURL(resolve('stardust/prototypes/index-proposed.html')).href, 0);
const eds = await measure(process.argv[2] || 'http://localhost:3033/', 1);

PAIRS.forEach((pair, i) => {
  const p = proto[i];
  const e = eds[i];
  const fmt = (v) => (v ? `${String(v.h).padStart(4)}h @${String(v.top).padStart(5)}` : '        missing');
  const flag = p && e && (p.h !== e.h) ? '  <-- height delta' : '';
  process.stdout.write(`${pair[0].padEnd(34)} proto ${fmt(p)}   eds ${fmt(e)}${flag}\n`);
});

await browser.close();
