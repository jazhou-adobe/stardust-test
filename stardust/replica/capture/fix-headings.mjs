import fs from 'node:fs';

/**
 * Heading-tag parity: the live page carries these strings inside real heading
 * elements (h3.nab-link-card__title, h3.cmp-title__heading, h2.nab-accordion__header).
 * A build that uses bare anchors reads as a heading shortfall on visual-diff.
 */
const file = 'stardust/prototypes/index-proposed.html';
let html = fs.readFileSync(file, 'utf8');
const before = html;

html = html.replace(
  /<a class="nab-link-card__link" href="([^"]*)">([^<]*)<\/a>/g,
  '<h3 class="nab-link-card__title"><a class="nab-link-card__link" href="$1">$2</a></h3>',
);

html = html.replace(
  /<a class="quicklinks__title" href="([^"]*)">([^<]*)<\/a>/g,
  '<h3 class="cmp-title__heading quicklinks__title"><span><span class="cmp-title__text h3">'
  + '<a class="cmp-title__link" href="$1">$2</a></span></span></h3>',
);

html = html.replace(
  /(<div class="nab-accordion__item">\s*)<button class="nab-accordion__button"([\s\S]*?)<\/button>/,
  '$1<h2 class="nab-accordion__header"><button class="nab-accordion__button"$2</button></h2>',
);

// Live wraps each hidden accordion label in a button > title header.
html = html.replace(
  /<div class="nab-accordion__title"><span class="nab-accordion__title__description">([^<]*)<\/span><\/div>/g,
  '<button class="nab-accordion__button" type="button"><span class="nab-accordion__title__header">'
  + '<span class="nab-accordion__title__description">$1</span></span></button>',
);

fs.writeFileSync(file, html);
console.log('changed', before !== html,
  '| cards', (html.match(/nab-link-card__title/g) || []).length,
  '| quicklink heads', (html.match(/quicklinks__title/g) || []).length,
  '| accordion header', (html.match(/nab-accordion__header/g) || []).length,
  '| hidden accordions', (html.match(/nab-accordion__title__header/g) || []).length);
