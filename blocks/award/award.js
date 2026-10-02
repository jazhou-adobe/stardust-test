import { parts } from '../../scripts/block-utils.js';
import { icon } from '../../scripts/icons.js';

/*
 * Award — badge beside a short prose block.
 *
 * One row, two cells: [badge image] and [heading, body]. The body's outbound
 * link carries the captured external-link glyph inside the anchor, which is
 * what puts the icon on the text baseline rather than after the sentence.
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  const cells = row ? [...row.children] : [];

  const inner = document.createElement('div');
  inner.className = 'award__inner';

  const body = document.createElement('div');
  body.className = 'award__body';

  cells.forEach((cell) => {
    parts(cell).forEach((node) => {
      if (node.tagName === 'IMG' || node.tagName === 'PICTURE') {
        node.classList.add('award__badge');
        inner.append(node);
      } else {
        body.append(node);
      }
    });
  });

  const link = body.querySelector('a');
  if (link) {
    link.classList.remove('button', 'primary', 'secondary', 'accent');
    link.classList.add('award__link');
    link.append(icon('icon-link'));
  }

  inner.append(body);
  block.textContent = '';
  block.append(inner);
}
