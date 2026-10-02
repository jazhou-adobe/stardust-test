#!/usr/bin/env node
/**
 * Download the home archetype's media into the prototype assets dir, using a
 * real-Chrome session (direct curl 403s on the NAB CDN).
 * usage: node stardust/replica/capture/fetch-media.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { newLiveContext } from '../../scripts/diff/live-session.mjs';

const inv = JSON.parse(fs.readFileSync('stardust/replica/capture/elements-1440.json', 'utf8'));
const urls = [...new Set(inv.elements.filter((e) => e.img && e.img.natural[0] > 2).map((e) => e.img.src))];
const outDir = 'stardust/prototypes/assets/img';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await newLiveContext(browser, { viewport: { width: 1440, height: 900 } });
const map = {};
for (const url of urls) {
  const name = decodeURIComponent(url.split('?')[0].split('/').pop());
  const res = await ctx.request.get(url);
  if (!res.ok()) { console.error('FAIL', res.status(), name); continue; }
  fs.writeFileSync(path.join(outDir, name), await res.body());
  map[url] = `assets/img/${name}`;
  console.log(res.status(), name, `${(fs.statSync(path.join(outDir, name)).size / 1024).toFixed(0)} KB`);
}
fs.writeFileSync('stardust/replica/capture/media-map.json', JSON.stringify(map, null, 1));
await browser.close();
