import { chromium } from 'playwright';
import fs from 'node:fs';
import { newLiveContext, gotoLive } from '../../scripts/diff/live-session.mjs';

/** Report the live tag+class that carries each given string, so the build can
 *  mirror the live wrapping (recreation-procedure § role parity). */
const strings = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const b = await chromium.launch();
const c = await newLiveContext(b, { viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
await gotoLive(p, 'https://www.nab.com.au/');
await p.waitForTimeout(2500);
const res = await p.evaluate((list) => {
  const clean = (s) => s.replace(/\s+/g, ' ').trim();
  const out = {};
  for (const s of list) {
    const hits = [];
    document.querySelectorAll('main *').forEach((el) => {
      const own = clean([...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join(' '));
      if (own !== s) return;
      const chain = [];
      for (let e = el; e && e.tagName !== 'MAIN'; e = e.parentElement) {
        chain.push(`${e.tagName.toLowerCase()}${e.id ? `#${e.id}` : ''}${e.getAttribute('class') ? `.${e.getAttribute('class').split(/\s+/).join('.')}` : ''}`);
        if (chain.length > 3) break;
      }
      hits.push({ chain, hidden: getComputedStyle(el).display === 'none' || !el.getClientRects().length });
    });
    out[s] = hits;
  }
  return out;
}, strings);
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(process.argv[3] || 'stardust/replica/capture/role-probe.json', JSON.stringify(res, null, 1));
await b.close();
