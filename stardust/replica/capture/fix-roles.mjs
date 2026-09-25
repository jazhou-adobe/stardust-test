import fs from 'node:fs';

/**
 * Role parity (recreation-procedure § role parity): mirror the live wrapping
 * per string. NAB carries every heading's text in
 * <hN class="cmp-title__heading"><span><span class="cmp-title__text hN">,
 * so a build using a bare <hN> reads as a ROLE SWAP against the source.
 */
const file = 'stardust/prototypes/index-proposed.html';
let html = fs.readFileSync(file, 'utf8');

const flagged = [
  'NAB Homepage', 'Thinking about refinancing?', 'Need help choosing an account?',
  'Get the most out of business banking', 'Award-winning banking',
  'We’re here to help with whatever life lo', 'More reasons to choose NAB',
  'How to contact us', 'NAB banking contacts', 'Visit a NAB branch', 'Feedback',
  'Interpreters available', 'National Relay Service', 'Quick links', 'About us',
  'Policies and terms', 'Connect with us',
];

let wrapped = 0;
html = html.replace(/<h([1-3])([^>]*)>([\s\S]*?)<\/h\1>/g, (m, lvl, attrs, inner) => {
  if (inner.includes('cmp-title__text')) return m;
  const plain = inner.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (!flagged.some((f) => plain.startsWith(f.slice(0, 38)))) return m;
  wrapped += 1;
  const cls = /class="([^"]*)"/.exec(attrs);
  const next = cls
    ? attrs.replace(cls[0], `class="cmp-title__heading ${cls[1]}"`)
    : `${attrs} class="cmp-title__heading"`;
  return `<h${lvl}${next}><span><span class="cmp-title__text h${lvl}">${inner}</span></span></h${lvl}>`;
});

// Live separates a link's label span from its sr-only suffix with whitespace;
// without it the build's CTA text joins as "Label, opens…" and never matches.
const before = html.length;
html = html.replace(/<\/span><span class="sr-only">/g, '</span> <span class="sr-only">');

fs.writeFileSync(file, html);
console.log('headings wrapped', wrapped, '| sr-only spaces', (html.length - before));
