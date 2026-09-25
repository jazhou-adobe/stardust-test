import { parts } from '../../scripts/block-utils.js';

/*
 * Feature pair — two promo panels, grey then white.
 *
 * Each row is one panel: a media-led mixed cell (image, heading, body, CTA), so
 * it arrives folded into a single wrapper <p> and must be read through parts().
 * The first panel insets a portrait image; the second runs its image full.
 */
const VARIANTS = [
  ['feature-content--grey', 'feature-content__media--inset'],
  ['feature-content--white', 'feature-content__media--full'],
];

export default function decorate(block) {
  const inner = document.createElement('div');
  inner.className = 'feature-pair__inner';

  [...block.children].forEach((row, i) => {
    const cell = row.querySelector(':scope > div') || row;
    const [tone, fit] = VARIANTS[i] || VARIANTS[VARIANTS.length - 1];

    const panel = document.createElement('div');
    panel.className = `feature-content ${tone}`;

    const media = document.createElement('div');
    media.className = `feature-content__media ${fit}`;

    parts(cell).forEach((node) => {
      if (node.tagName === 'IMG' || node.tagName === 'PICTURE') {
        media.append(node);
      } else {
        if (node.tagName === 'P' && !node.classList.contains('button-wrapper')) {
          node.classList.add('feature-content__body');
        }
        panel.append(node);
      }
    });

    if (media.firstChild) panel.prepend(media);
    const cta = panel.querySelector('a.button');
    if (cta) cta.classList.add('feature-content__cta');
    inner.append(panel);
  });

  block.textContent = '';
  block.append(inner);
}
