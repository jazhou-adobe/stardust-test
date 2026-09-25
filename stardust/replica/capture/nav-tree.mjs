import { chromium } from 'playwright';
import fs from 'node:fs';
import { newLiveContext, gotoLive } from '../../scripts/diff/live-session.mjs';

const url = process.argv[2];
const out = process.argv[3];
const b = await chromium.launch();
const c = await newLiveContext(b, { viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
await gotoLive(p, url);
await p.waitForTimeout(2500);

const data = await p.evaluate(() => {
  const clean = (s) => s.replace(/\s+/g, ' ').trim();

  const readLi = (li) => {
    const a = [...li.children].find((e) => e.tagName === 'A');
    const node = {
      cls: li.getAttribute('class') || '',
      text: a ? clean(a.textContent) : clean(li.textContent),
      href: a ? a.getAttribute('href') : null,
      aCls: a ? a.getAttribute('class') || '' : '',
      aAttrs: a ? Object.fromEntries([...a.attributes].filter((x) => !['class', 'href'].includes(x.name)).map((x) => [x.name, x.value])) : {},
      children: [],
    };
    const ul = [...li.children].find((e) => e.tagName === 'UL' || e.tagName === 'DIV');
    if (ul) {
      ul.querySelectorAll(':scope > li, :scope ul > li').forEach(() => {});
      const lis = ul.matches('ul') ? [...ul.children].filter((x) => x.tagName === 'LI') : [...ul.querySelectorAll(':scope > ul > li')];
      node.children = lis.map(readLi);
    }
    return node;
  };

  const roots = [...document.querySelectorAll('li.navigation__item--level-1')];
  const rootUl = roots.length ? roots[0].parentElement : null;
  const nav = roots.map(readLi);

  // other hidden panels: capture their full innerText + links
  const panels = [];
  const seen = new Set();
  document.querySelectorAll('main *').forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.display !== 'none' && cs.visibility !== 'hidden') return;
    if (el.closest('li.navigation__item--level-1')) return;
    let anc = el.parentElement;
    let nested = false;
    while (anc && anc !== document.body) {
      const acs = getComputedStyle(anc);
      if (acs.display === 'none' || acs.visibility === 'hidden') { nested = true; break; }
      anc = anc.parentElement;
    }
    if (nested) return;
    if (el.querySelector('li.navigation__item--level-1')) return;
    const sig = el.tagName + (el.id || '') + (el.getAttribute('class') || '');
    if (seen.has(sig)) return;
    seen.add(sig);
    panels.push({
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      cls: el.getAttribute('class') || '',
      reason: cs.display === 'none' ? 'display:none' : 'visibility:hidden',
      text: clean(el.textContent).slice(0, 400),
      links: [...el.querySelectorAll('a[href]')].map((a) => ({ t: clean(a.textContent), h: a.getAttribute('href') })),
      headings: [...el.querySelectorAll('h1,h2,h3,h4,h5,h6,.cmp-title__text')].map((h) => clean(h.textContent)),
      paras: [...el.querySelectorAll('p')].map((h) => clean(h.textContent)).filter(Boolean),
      imgs: [...el.querySelectorAll('img')].map((i) => ({ src: i.getAttribute('src'), alt: i.getAttribute('alt') })),
    });
  });

  return { navRootCls: rootUl ? rootUl.getAttribute('class') : null, nav, panels };
});

fs.writeFileSync(out, JSON.stringify({ url, ...data }, null, 1));
const count = (n) => 1 + n.children.reduce((a, k) => a + count(k), 0);
console.log('nav roots', data.nav.length, 'nodes', data.nav.reduce((a, n) => a + count(n), 0), '| panels', data.panels.length, '→', out);
await b.close();
