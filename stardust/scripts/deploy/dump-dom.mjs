#!/usr/bin/env node
/* Dumps the decorated DOM of one selector, for diagnosing block decode. */
import { chromium } from 'playwright';

const url = process.argv[2];
const selector = process.argv[3];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(process.argv[4] || 1440), height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForSelector('body.appear', { timeout: 15000 });
await page.waitForTimeout(1500);

const html = await page.evaluate((sel) => {
  const el = document.querySelector(sel);
  return el ? el.outerHTML : `NOT FOUND: ${sel}`;
}, selector);

process.stdout.write(`${html}\n`);
if (errors.length) process.stdout.write(`\nERRORS:\n${errors.join('\n')}\n`);
await browser.close();
