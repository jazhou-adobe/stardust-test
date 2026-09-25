#!/usr/bin/env node
/*
 * Behavioural QA for the three dynamic features this migration owns:
 *   D1 login selector toggle (both breakpoints)
 *   D2 mega menu open/close, Escape, outside click, aria state
 *   D5 footer accordions (mobile only)
 */
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3033/';
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok, detail });

async function open(width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('body.appear', { timeout: 15000 });
  await page.waitForTimeout(1200);
  return { page, errors };
}

/* D2 at desktop. D1 is mobile-only: motion/index.json recorded the handler
   on .login-select, which mobile.css is the only breakpoint to show. */
{
  const { page, errors } = await open(1440);

  const anchor = page.locator('.mega-menu-anchor').first();
  await anchor.click();
  check('D2 opens panel 1', await page.isVisible('#mega-menu-panel-1'));
  check('D2 sets aria-expanded', (await anchor.getAttribute('aria-expanded')) === 'true');

  await page.locator('.mega-menu-anchor').nth(1).click();
  check('D2 switches panels', await page.isVisible('#mega-menu-panel-2') && !(await page.isVisible('#mega-menu-panel-1')));

  await page.keyboard.press('Escape');
  check('D2 closes on Escape', !(await page.isVisible('#mega-menu-panel-2')));

  await anchor.click();
  await page.mouse.click(700, 700);
  check('D2 closes on outside click', !(await page.isVisible('#mega-menu-panel-1')));

  check('no page errors at 1440', errors.length === 0, errors.join(' | '));
  await page.close();
}

/* D1 + D5 at mobile. */
{
  const { page, errors } = await open(360);

  await page.click('#login');
  check('D1 toggles show-main-login', await page.evaluate(() => (document.querySelector('.page-outer') || document.body).classList.contains('show-main-login')));
  check('D1 sets aria-expanded', (await page.getAttribute('#login', 'aria-expanded')) === 'true');
  await page.click('#login');
  check('D1 toggles back off', !(await page.evaluate(() => (document.querySelector('.page-outer') || document.body).classList.contains('show-main-login'))));

  const button = page.locator('.nab-footer__accordion .nab-accordion__button').first();
  const item = page.locator('.nab-footer__accordion .nab-accordion__item').first();

  const closedHeight = (await item.boundingBox()).height;
  await button.click();
  await page.waitForTimeout(150);
  const openHeight = (await item.boundingBox()).height;

  check('D5 expands the first panel', openHeight > closedHeight, `${closedHeight} -> ${openHeight}`);
  check('D5 sets aria-expanded', (await button.getAttribute('aria-expanded')) === 'true');

  await button.click();
  await page.waitForTimeout(150);
  check('D5 collapses again', Math.round((await item.boundingBox()).height) === Math.round(closedHeight));

  check('no page errors at 360', errors.length === 0, errors.join(' | '));
  await page.close();
}

await browser.close();

let failed = 0;
results.forEach((r) => {
  if (!r.ok) failed += 1;
  process.stdout.write(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}\n`);
});
process.exit(failed ? 1 : 0);
