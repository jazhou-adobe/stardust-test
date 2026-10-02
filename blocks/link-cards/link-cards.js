import { parts } from '../../scripts/block-utils.js';
import { icon } from '../../scripts/icons.js';

/*
 * Link cards — the life band's card grids.
 *
 * One row per card: an optional image, then a linked heading and description.
 * The media-led cards arrive folded into one wrapper <p>, so read via parts().
 *
 * The page uses this grid twice and the two differ only in track count: the
 * text-only cards run two-up, the media cards three-up. That is derived from
 * the content rather than authored, so an author adding an image to a card
 * cannot land it in the wrong grid.
 */
export default function decorate(block) {
  let hasMedia = false;

  [...block.children].forEach((row) => {
    const cell = row.querySelector(':scope > div') || row;

    const inner = document.createElement('div');
    inner.className = 'nab-link-card__inner-container';
    const body = document.createElement('div');
    body.className = 'nab-link-card__body';

    row.className = 'nab-link-card';
    const collected = parts(cell);
    cell.remove();

    collected.forEach((node) => {
      if (node.tagName === 'IMG' || node.tagName === 'PICTURE') {
        node.classList.add('nab-link-card__media');
        row.append(node);
        hasMedia = true;
      } else if (/^H[1-6]$/.test(node.tagName)) {
        node.classList.add('nab-link-card__title');
        const link = node.querySelector('a');
        if (link) {
          link.classList.remove('button', 'primary', 'secondary', 'accent');
          link.classList.add('nab-link-card__link');
        }
        body.append(node);
      } else {
        node.classList.add('nab-link-card__description');
        body.append(node);
      }
    });

    inner.append(body, icon('icon-chevron-right', 'nab-link-card__chevron'));
    row.append(inner);
  });

  block.classList.add(hasMedia ? 'link-cards--media' : 'link-cards--text');

  // The band head above each grid is default content in the same section, so
  // the section is tagged here rather than guessed at from CSS.
  const section = block.closest('.section');
  if (section) section.classList.add(hasMedia ? 'life-reasons' : 'life-intro');
}
