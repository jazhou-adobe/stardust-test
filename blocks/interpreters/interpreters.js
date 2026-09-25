import { cmpList, parts, tertiaryCta } from '../../scripts/block-utils.js';

/*
 * Interpreters — an icon beside prose, two language lists and a tertiary CTA.
 *
 * Row 1: [icon image] [heading, two paragraphs, CTA].
 * Row 2: [language list] [language list] — lifted into the body between the
 *        prose and the CTA, which is where the prototype carries them.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const body = document.createElement('div');
  body.className = 'interpreters__body';
  const lists = document.createElement('div');
  lists.className = 'interpreters__lists';
  let iconImage = null;

  rows.forEach((row, i) => {
    [...row.children].forEach((cell) => {
      parts(cell).forEach((node) => {
        if (node.tagName === 'IMG' || node.tagName === 'PICTURE') {
          node.classList.add('interpreters__icon');
          iconImage = node;
        } else if (i > 0 && (node.tagName === 'UL' || node.tagName === 'OL')) {
          lists.append(cmpList(node));
        } else {
          body.append(node);
        }
      });
    });
  });

  const cta = body.querySelector('a.button');
  const ctaHost = cta ? (cta.closest('p') || cta) : null;
  if (lists.firstChild) {
    if (ctaHost && ctaHost.parentElement === body) body.insertBefore(lists, ctaHost);
    else body.append(lists);
  }
  if (cta) {
    tertiaryCta(cta);
    // The class goes on the wrapper <p> decorateButtons() created, not the
    // anchor: the band's paragraph margin already lands on the wrapper, so
    // marking the anchor too would stack two 32px gaps.
    (ctaHost || cta).classList.add('interpreters__cta');
  }

  block.textContent = '';
  if (iconImage) block.append(iconImage);
  block.append(body);
}
