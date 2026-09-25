/*
 * Generates the authored EDS content documents from the extracted content
 * model, so every string is verbatim from the approved prototype.
 *
 *   node stardust/scripts/deploy/gen-content.mjs
 *
 * Emits DA body fragments (no doctype/html/head):
 *   content/index.html   the home archetype
 *   content/nav.html     chrome consumed by the header block
 *   content/footer.html  chrome consumed by the footer block
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const m = JSON.parse(readFileSync(`${root}/stardust/.work/content-model.json`, 'utf8'));

const esc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const a = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`;
const ul = (items) => `<ul>${items.map((i) => `<li>${a(i.href, i.text)}</li>`).join('')}</ul>`;
const img = (src) => `<img src="${esc(src)}" alt="">`;
const cells = (...c) => `<div>${c.map((x) => `<div>${x}</div>`).join('')}</div>`;
const block = (name, rows) => `<div class="${name}">${rows.join('')}</div>`;
const primary = (cta) => `<p><strong>${a(cta.href, cta.text)}</strong></p>`;
const secondary = (cta) => `<p><em>${a(cta.href, cta.text)}</em></p>`;
const section = (...parts) => `    <div>\n      ${parts.join('\n      ')}\n    </div>`;

/* ---------- index ---------- */

const metadata = block('metadata', [
  cells('Title', esc(m.meta.title)),
  cells('Description', esc(m.meta.description)),
]);

const masthead = block('masthead', [
  cells(`<h1>${esc(m.masthead.h1)}</h1>`),
  cells(img(m.masthead.image)),
  cells(`<h2>${esc(m.masthead.heading)}</h2><p>${esc(m.masthead.body)}</p>${primary(m.masthead.cta)}`),
]);

const quicklinks = block('quicklinks', m.quicklinks.map((col) => cells(
  `<code>${esc(col.icon)}</code>`,
  a(col.href, col.title),
  ul(col.items),
)));

const featurePair = block('feature-pair', m.featurePair.map((f) => cells(
  `${img(f.image)}<h2>${esc(f.heading)}</h2><p>${esc(f.body)}</p>${primary(f.cta)}`,
)));

const businessPanel = block('business-panel', [cells(
  `<h2>${esc(m.businessPanel.heading)}</h2>${ul(m.businessPanel.items)}${primary(m.businessPanel.cta)}`,
  img(m.businessPanel.image),
)]);

const awardBody = (() => {
  const { bodyText, link } = m.award;
  const i = bodyText.indexOf(link.text);
  const before = esc(bodyText.slice(0, i));
  const after = esc(bodyText.slice(i + link.text.length));
  return `<p>${before}${a(link.href, link.text)}${after}</p>`;
})();

const award = block('award', [cells(
  img(m.award.badge),
  `<h2>${esc(m.award.heading)}</h2>${awardBody}`,
)]);

const cardCells = (c) => cells(
  `${c.image ? img(c.image) : ''}<h3>${a(c.href, c.title)}</h3><p>${esc(c.description)}</p>`,
);

const linkCards = block('link-cards', m.life.cards.map(cardCells));

const reasonsCards = block('link-cards', m.life.reasonsCards.map(cardCells));

const helpGrid = block('help-grid', [cells(
  `<h2>${esc(m.helpGrid.heading)}</h2><p>${esc(m.helpGrid.body)}</p>`,
  ul(m.helpGrid.items),
)]);

const contactTiles = block('contact-tiles', m.contact.tiles.map((t) => cells(
  `<code>${esc(t.icon)}</code>`,
  `<h3>${esc(t.heading)}</h3><p>${esc(t.body)}</p>${secondary(t.cta)}`,
)));

const interpreters = block('interpreters', [
  cells(
    img(m.interpreters.icon),
    `<h2>${esc(m.interpreters.heading)}</h2>${m.interpreters.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}${secondary(m.interpreters.cta)}`,
  ),
  cells(...m.interpreters.lists.map(ul)),
]);

const nrsBody = m.nrs.bodyParts
  .map((p) => (p.type === 'link' ? a(p.href, p.text) : esc(p.text ?? '')))
  .join('');

const nrs = block('nrs', [cells(
  `<h2>${esc(m.nrs.heading)}</h2><p>${nrsBody}</p>`,
  ul(m.nrs.items),
)]);

const disclaimer = block('disclaimer', [cells(esc(m.disclaimer))]);

const index = `<body>
  <header></header>
  <main>
${[
    section(metadata),
    section(masthead),
    section(quicklinks),
    section(featurePair),
    section(businessPanel),
    section(award),
    section(`<h2>${esc(m.life.heading)}</h2>`, `<p>${esc(m.life.lede)}</p>`, linkCards),
    section(`<h2>${esc(m.life.reasonsHeading)}</h2>`, reasonsCards),
    section(helpGrid),
    section(`<h2>${esc(m.contact.heading)}</h2>`, contactTiles),
    section(interpreters),
    section(nrs),
    section(disclaimer),
  ].join('\n')}
  </main>
  <footer></footer>
</body>
`;

/* ---------- nav ----------
 * The header block reads: brand section, one section per mega-menu panel, then
 * the login section. Panel contents come from the captured nav tree
 * (stardust/replica/capture/nav-tree.json) — D2 of the dynamic-features plan.
 * The capture walks the menu twice, so the top level is de-duplicated by label.
 */

const navTree = JSON.parse(
  readFileSync(`${root}/stardust/replica/capture/nav-tree.json`, 'utf8'),
);

const seen = new Set();
const topLevel = navTree.nav.filter((n) => {
  if (seen.has(n.text)) return false;
  seen.add(n.text);
  return true;
});

const navPanels = topLevel.map((n) => `    <div>
      <p>${a('#', n.text)}</p>
      <ul>
${n.children.map((c) => `        <li>${a(c.href, c.text)}</li>`).join('\n')}
      </ul>
    </div>`).join('\n');

const nav = `<body>
  <main>
    <div>
      <p>${a(m.chrome.logoHref, 'NAB home')}</p>
      <p>${img(m.chrome.logo)}</p>
    </div>
${navPanels}
    <div>
      <p><code>${esc(m.chrome.loginService)}</code></p>
      <p><strong>${a(m.chrome.loginHref, m.chrome.loginText)}</strong></p>
    </div>
  </main>
</body>
`;

/* ---------- footer ---------- */

const footerColumns = m.chrome.footerColumns.map((col) => `    <div>
      <h2>${esc(col.heading)}</h2>
      <ul>
${col.links.map((l) => `        <li>${a(l.href, l.text)}</li>`).join('\n')}
      </ul>
    </div>`).join('\n');

const footer = `<body>
  <main>
${footerColumns}
    <div>
${m.chrome.footerLegal.map((p) => `      <p>${p}</p>`).join('\n')}
    </div>
  </main>
</body>
`;

mkdirSync(`${root}/content`, { recursive: true });
writeFileSync(`${root}/content/index.html`, index);
writeFileSync(`${root}/content/nav.html`, nav);
writeFileSync(`${root}/content/footer.html`, footer);
// eslint-disable-next-line no-console
console.log('wrote content/index.html, content/nav.html, content/footer.html');
