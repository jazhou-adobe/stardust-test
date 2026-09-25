/*
 * Reads the approved prototype's DOM and emits a structured content model.
 *
 * Copy is never transcribed by hand: every string, href and image name is read
 * out of stardust/prototypes/index-proposed.html, so the authored document
 * generated from this model is verbatim by construction.
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const proto = `file://${root}/stardust/prototypes/index-proposed.html`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(proto, { waitUntil: 'load' });

const data = await page.evaluate(() => {
  // The prototype carries a display:none replica-offscreen surface that mirrors
  // live NAB's hidden chrome; it shadows most selectors. Every query below is
  // filtered to the visible page.
  const vis = (el) => el && !el.closest('.replica-offscreen');
  const q = (sel, ctx = document) => [...ctx.querySelectorAll(sel)].find(vis) || null;
  const qa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)].filter(vis);
  const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
  const img = (el) => (el ? el.getAttribute('src').replace('assets/img/', '/img/') : null);
  const useId = (el) => el?.getAttribute('xlink:href')?.slice(1) || null;
  const list = (ul) => [...ul.querySelectorAll('.cmp-list__item-link')].map((a) => ({
    href: a.getAttribute('href'),
    text: txt(a.querySelector('.cmp-list__item-title')),
    newWindow: !!a.querySelector('.sr-only'),
    icon: useId(a.querySelector('.cmp-list__item-icon use')),
  }));

  const tile = q('.nab-tile--banner');
  const masthead = {
    h1: txt(q('.sr-only--h1 .cmp-title__text')),
    image: img(q('.masthead__image')),
    heading: txt(tile.querySelector('.cmp-title__text')),
    body: txt(tile.querySelector('.nab-tile__body')),
    cta: {
      href: tile.querySelector('.nab-tile__cta').getAttribute('href'),
      text: txt(tile.querySelector('.nab-tile__cta')),
    },
  };

  const quicklinks = qa('.quicklinks__col').map((col) => ({
    icon: useId(col.querySelector('.quicklinks__icon use')),
    href: col.querySelector('.cmp-title__link').getAttribute('href'),
    title: txt(col.querySelector('.cmp-title__link')),
    items: list(col.querySelector('.quicklinks__list')),
  }));

  const featurePair = qa('.feature-content').map((f) => ({
    image: img(f.querySelector('img')),
    heading: txt(f.querySelector('.cmp-title__text')),
    body: txt(f.querySelector('.feature-content__body')),
    cta: {
      href: f.querySelector('.feature-content__cta').getAttribute('href'),
      text: txt(f.querySelector('.feature-content__cta')),
    },
  }));

  const bp = q('.business-section');
  const businessPanel = {
    heading: txt(bp.querySelector('.cmp-title__text')),
    items: list(bp.querySelector('.business-panel__list')),
    cta: {
      href: bp.querySelector('.business-panel__cta').getAttribute('href'),
      text: txt(bp.querySelector('.business-panel__cta')),
    },
    image: img(bp.querySelector('.business-panel__media img')),
  };

  const aw = q('.award');
  const awardLink = aw.querySelector('.award__link');
  const award = {
    badge: img(aw.querySelector('.award__badge')),
    heading: txt(aw.querySelector('.cmp-title__text')),
    bodyText: txt(aw.querySelector('.award__body p')),
    link: {
      href: awardLink.getAttribute('href'),
      text: txt(awardLink),
      icon: useId(awardLink.querySelector('use')),
    },
  };

  const card = (c) => ({
    image: img(c.querySelector('.nab-link-card__media')),
    href: c.querySelector('.nab-link-card__link').getAttribute('href'),
    title: txt(c.querySelector('.nab-link-card__link')),
    description: txt(c.querySelector('.nab-link-card__description')),
  });

  const life = {
    heading: txt(q('.band--life > .cmp-title__heading .cmp-title__text')),
    lede: txt(q('.band--life > p.lede')),
    cards: qa('.life-cards .nab-link-card').map(card),
    reasonsHeading: txt(q('.reasons-title .cmp-title__text')),
    reasonsCards: qa('.reasons-cards .nab-link-card').map(card),
  };

  const hg = q('.help-grid');
  const helpGrid = {
    heading: txt(hg.querySelector('h2')),
    body: txt(hg.querySelector('p')),
    items: list(hg.querySelector('.cmp-list')),
  };

  const contact = {
    heading: txt(q('.contact-title .cmp-title__text')),
    tiles: qa('.contact-tile').map((t) => ({
      icon: useId(t.querySelector('.nab-tile__icon use')),
      heading: txt(t.querySelector('.cmp-title__text')),
      body: txt(t.querySelector('.contact-tile__body p')),
      cta: {
        href: t.querySelector('.nab-button').getAttribute('href'),
        text: txt(t.querySelector('.nab-button__label')),
        icon: useId(t.querySelector('.nab-button use')),
      },
    })),
  };

  const ip = q('.interpreters');
  const interpreters = {
    icon: img(ip.querySelector('.interpreters__icon')),
    heading: txt(ip.querySelector('.cmp-title__text')),
    paragraphs: [...ip.querySelectorAll('.interpreters__body > p')].map(txt),
    lists: [...ip.querySelectorAll('.interpreters__lists .cmp-list')].map(list),
    cta: {
      href: ip.querySelector('.interpreters__cta').getAttribute('href'),
      text: txt(ip.querySelector('.interpreters__cta .nab-button__label')),
      icon: useId(ip.querySelector('.interpreters__cta use')),
    },
  };

  const nrsEl = q('.nrs');
  const nrsP = nrsEl.querySelector('p');
  const nrs = {
    heading: txt(nrsEl.querySelector('.cmp-title__text')),
    bodyParts: [...nrsP.childNodes].map((n) => {
      if (n.nodeType === Node.TEXT_NODE) return { type: 'text', text: n.textContent.replace(/\s+/g, ' ') };
      if (n.tagName === 'A') {
        return {
          type: 'link',
          href: n.getAttribute('href'),
          text: txt(n),
          icon: useId(n.querySelector('use')),
        };
      }
      return { type: 'other', html: n.outerHTML };
    }),
    items: list(nrsEl.querySelector('.cmp-list')),
  };

  const disclaimer = txt(q('.band--disclaimer .nab-accordion__title'));

  const chrome = {
    logo: img(q('.nab-header-bar__logo img')),
    logoHref: q('.nab-header-bar__logo').getAttribute('href'),
    navAnchors: qa('.nab-header-bar__nav .mega-menu-anchor').map(txt),
    loginService: txt(q('.current-dropdown-item')),
    loginHref: q('.quick-login').getAttribute('href'),
    loginText: txt(q('.desktop-login-label')),
    mobileLoginText: txt(q('.login-container .mobile-login-label')),
    searchLabel: q('.nab-header-search__search-button').getAttribute('aria-label'),
    menuLabel: q('.nab-header-bar__hamburger').getAttribute('aria-label'),
    skipLinks: qa('.skip-links__link').map((a) => ({
      href: a.getAttribute('href'),
      text: txt(a),
    })),
    footerAccordion: qa('.nab-footer__accordion .nab-accordion__title__description').map(txt),
    footerBackToTop: txt(q('.nab-footer__back-to-top-link')),
    footerColumns: qa('.nab-footer__columns > div').map((col) => ({
      heading: txt(col.querySelector('.nab-footer__heading .cmp-title__text')),
      links: [...col.querySelectorAll('.nab-footer__link')].map((a) => ({
        href: a.getAttribute('href'),
        text: txt(a.querySelector('.cmp-list__item-title')),
        newWindow: !!a.querySelector('.sr-only'),
        leadingIcon: useId(a.querySelector('svg:first-child use')),
        trailingIcon: a.querySelector('svg:first-child') ? null : useId(a.querySelector('use')),
      })),
    })),
    footerLegal: qa('.nab-footer__legal p').map((p) => p.innerHTML.replace(/\s+/g, ' ').trim()),
  };

  const meta = {
    title: document.title,
    description: q('meta[name="description"]').getAttribute('content'),
  };

  return {
    meta, masthead, quicklinks, featurePair, businessPanel, award, life, helpGrid, contact, interpreters, nrs, disclaimer, chrome,
  };
});

await browser.close();

mkdirSync(`${root}/stardust/.work`, { recursive: true });
writeFileSync(`${root}/stardust/.work/content-model.json`, `${JSON.stringify(data, null, 2)}\n`);
// eslint-disable-next-line no-console
console.log('wrote stardust/.work/content-model.json');
