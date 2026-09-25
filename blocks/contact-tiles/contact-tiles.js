import { iconId, parts, tertiaryCta } from '../../scripts/block-utils.js';
import { icon } from '../../scripts/icons.js';

/*
 * Contact tiles — three icon-and-prose tiles under the band's own heading.
 *
 * Each row is one tile: [<code>icon-id</code>] [heading, body, CTA].
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const id = iconId(row);
    const cells = [...row.children];

    const body = document.createElement('div');
    body.className = 'contact-tile__body';

    cells.forEach((cell) => {
      parts(cell).forEach((node) => body.append(node));
      cell.remove();
    });

    tertiaryCta(body.querySelector('a.button'));

    row.className = 'contact-tile';
    if (id) {
      const badge = document.createElement('div');
      badge.className = 'nab-tile__icon';
      badge.append(icon(id));
      row.append(badge);
    }
    row.append(body);
  });

  const section = block.closest('.section');
  if (section) section.classList.add('contact-head');
}
