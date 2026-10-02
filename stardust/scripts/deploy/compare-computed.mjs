#!/usr/bin/env node
/* Prints computed styles for one selector on both the prototype and the build. */
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const selector = process.argv[2];
const props = (process.argv[3] || 'font-family,font-size,font-weight,line-height,color,text-decoration-line').split(',');

const vw = Number(process.argv[4] || 1440);
const browser = await chromium.launch();

async function read(url) {
  const page = await browser.newPage({ viewport: { width: vw, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  if (url.startsWith('http')) {
    await page.waitForSelector('body.appear', { timeout: 15000 });
    await page.waitForTimeout(1500);
  } else {
    await page.waitForTimeout(400);
  }
  const out = await page.evaluate(([sel, list]) => {
    const el = [...document.querySelectorAll(sel)].find((e) => !e.closest('.replica-offscreen'));
    if (!el) return null;
    const cs = getComputedStyle(el);
    return Object.fromEntries(list.map((p) => [p, cs.getPropertyValue(p)]));
  }, [selector, props]);
  await page.close();
  return out;
}

const proto = await read(pathToFileURL(resolve('stardust/prototypes/index-proposed.html')).href);
const eds = await read('http://localhost:3033/');
props.forEach((p) => {
  const a = proto && proto[p];
  const b = eds && eds[p];
  process.stdout.write(`${p.padEnd(24)} proto ${String(a).padEnd(34)} eds ${b}${a !== b ? '   <-- differs' : ''}\n`);
});
await browser.close();
