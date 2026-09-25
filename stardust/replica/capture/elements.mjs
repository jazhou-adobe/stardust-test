#!/usr/bin/env node
/**
 * Flat content-element inventory for replica authoring: every visible
 * text/link/img/button/box-bearing element in document order with rect +
 * computed styles. Complements lift.mjs (which gives band structure).
 *
 * usage: node stardust/replica/capture/elements.mjs <url> <out.json> [--width 1440]
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { newLiveContext, gotoLive, dismissOverlays } from '../../scripts/diff/live-session.mjs';

const [, , url, out] = process.argv;
const wIdx = process.argv.indexOf('--width');
const width = wIdx > -1 ? Number(process.argv[wIdx + 1]) : 1440;

const browser = await chromium.launch();
const ctx = await newLiveContext(browser, { viewport: { width, height: 900 } });
const page = await ctx.newPage();
await gotoLive(page, url, { settleMs: 2500 });
await dismissOverlays(page);
await page.mouse.move(2, 2);
await page.waitForTimeout(1500);

const data = await page.evaluate(() => {
  const cs = (el) => getComputedStyle(el);
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return [Math.round(r.x), Math.round(r.y + window.scrollY), Math.round(r.width), Math.round(r.height)];
  };
  const sel = (el) => {
    const id = el.id ? `#${el.id}` : '';
    const cls = (el.className && typeof el.className === 'string')
      ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}` : '';
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  };
  const out = [];
  const all = document.querySelectorAll('body *');
  for (const el of all) {
    const s = cs(el);
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const tag = el.tagName;
    const ownText = Array.from(el.childNodes).filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.replace(/\s+/g, ' ').trim()).join(' ').trim();
    const isImg = tag === 'IMG' || tag === 'SVG' || tag === 'svg';
    const isLink = tag === 'A' || tag === 'BUTTON';
    const painted = s.backgroundColor !== 'rgba(0, 0, 0, 0)'
      || s.backgroundImage !== 'none'
      || s.borderTopWidth !== '0px' || s.borderBottomWidth !== '0px'
      || s.boxShadow !== 'none';
    if (!ownText && !isImg && !isLink && !painted) continue;
    const rec = { sel: sel(el), rect: rect(el) };
    if (ownText) rec.text = ownText.slice(0, 240);
    if (isLink) { rec.href = el.getAttribute('href'); rec.label = (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120); }
    if (tag === 'IMG') rec.img = { src: el.currentSrc || el.src, alt: el.alt, natural: [el.naturalWidth, el.naturalHeight], objectFit: s.objectFit, objectPosition: s.objectPosition };
    if (tag.toLowerCase() === 'svg') rec.svg = { viewBox: el.getAttribute('viewBox'), fill: s.fill, html: el.outerHTML.slice(0, 600) };
    if (ownText || isLink) {
      rec.type = {
        f: s.fontFamily.split(',')[0].replace(/"/g, ''),
        size: s.fontSize,
        w: s.fontWeight,
        lh: s.lineHeight,
        ls: s.letterSpacing,
        c: s.color,
        tt: s.textTransform,
        td: s.textDecorationLine,
        ta: s.textAlign,
      };
    }
    if (painted || isLink) {
      rec.box = {
        d: s.display,
        pos: s.position,
        bg: s.backgroundColor,
        bgi: s.backgroundImage === 'none' ? undefined : s.backgroundImage.slice(0, 300),
        bd: s.borderWidth === '0px' ? undefined : `${s.borderWidth} ${s.borderStyle} ${s.borderColor}`,
        r: s.borderRadius === '0px' ? undefined : s.borderRadius,
        sh: s.boxShadow === 'none' ? undefined : s.boxShadow,
        p: s.padding,
        m: s.margin,
        gap: s.gap === 'normal' ? undefined : s.gap,
        gtc: s.gridTemplateColumns === 'none' ? undefined : s.gridTemplateColumns,
        fd: s.display.includes('flex') ? s.flexDirection : undefined,
      };
    }
    out.push(rec);
  }
  return { count: out.length, elements: out };
});

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ url, width, capturedAt: new Date().toISOString(), ...data }, null, 0));
console.log(`elements → ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB, ${data.count} elements)`);
await browser.close();
