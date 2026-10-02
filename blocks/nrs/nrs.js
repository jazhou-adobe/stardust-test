import { cmpList, parts } from '../../scripts/block-utils.js';
import { icon } from '../../scripts/icons.js';

/*
 * National Relay Service — prose beside a link list; closes the life band.
 *
 * One row, two cells: [heading, paragraph] and [link list]. The paragraph's
 * outbound link carries the external-link glyph inside the anchor, on the text
 * baseline, exactly as the captured page does; the tel: link carries none.
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  const cells = row ? [...row.children] : [];

  const prose = document.createElement('div');
  prose.className = 'nrs__prose';
  let list = null;

  cells.forEach((cell) => {
    parts(cell).forEach((node) => {
      if (node.tagName === 'UL' || node.tagName === 'OL') {
        list = cmpList(node);
      } else {
        prose.append(node);
      }
    });
  });

  prose.querySelectorAll('a[href^="http"]').forEach((link) => {
    if (link.host === window.location.host) return;
    link.append(icon('icon-link'));
  });

  block.textContent = '';
  block.append(prose);
  if (list) block.append(list);
}
