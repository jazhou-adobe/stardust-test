import { parts } from '../../scripts/block-utils.js';

/*
 * Masthead band.
 *
 * Rows: [sr-only h1] [background image] [tile: heading, body, CTA].
 * The h1 is the off-canvas title the live page carries for role parity; it is
 * authored so it stays editable, and positioned off-screen by .sr-only--h1.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const heading = block.querySelector('h1');
  const image = block.querySelector('img');

  const tile = document.createElement('div');
  tile.className = 'nab-tile nab-tile--banner';

  const tileRow = rows[rows.length - 1];
  if (tileRow) {
    const cell = tileRow.querySelector(':scope > div') || tileRow;
    parts(cell).forEach((node) => {
      if (node.tagName === 'P' && !node.classList.contains('button-wrapper')) {
        node.classList.add('nab-tile__body');
      }
      tile.append(node);
    });
  }

  const cta = tile.querySelector('a.button');
  if (cta) cta.classList.add('nab-tile__cta');

  const inner = document.createElement('div');
  inner.className = 'masthead__inner';
  inner.append(tile);

  block.textContent = '';
  if (heading) {
    heading.classList.add('sr-only', 'sr-only--h1');
    block.append(heading);
  }
  if (image) {
    image.className = 'masthead__image';
    block.append(image);
  }
  block.append(inner);
}
