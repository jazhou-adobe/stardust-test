#!/usr/bin/env node
/* Element screenshot, for inspecting one region of the build in isolation. */
import { chromium } from 'playwright';

const [url, selector, out, width] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width || 1440), height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForSelector('body.appear', { timeout: 15000 });
await page.waitForTimeout(2000);
const target = page.locator(selector).first();
await target.scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await target.screenshot({ path: out });
process.stdout.write(`wrote ${out}\n`);
await browser.close();
