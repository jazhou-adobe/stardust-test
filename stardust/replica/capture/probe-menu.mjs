import { chromium } from 'playwright';
import { newLiveContext, gotoLive } from '../../scripts/diff/live-session.mjs';

const b = await chromium.launch();
const c = await newLiveContext(b, { viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
await gotoLive(p, 'https://www.nab.com.au/');
await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(() => {
  const li = document.querySelector('li.navigation__item--level-1');
  const chain = [];
  for (let e = li; e && e !== document.body; e = e.parentElement) {
    const cs = getComputedStyle(e);
    chain.push(`${e.tagName.toLowerCase()}${e.id ? `#${e.id}` : ''}.${(e.getAttribute('class') || '').split(/\s+/).slice(0, 3).join('.')} [${cs.display}]`);
  }
  const menus = [...document.querySelectorAll('[class*="mega-menu"],[class*="navigation"]')]
    .filter((e) => e.querySelectorAll('li.navigation__item--level-1').length)
    .slice(0, 20)
    .map((e) => `${e.tagName.toLowerCase()}${e.id ? `#${e.id}` : ''}.${e.getAttribute('class')} [${getComputedStyle(e).display}] lvl1=${e.querySelectorAll('li.navigation__item--level-1').length}`);
  return { chain, menus };
}), null, 1));
await b.close();
