import { cmpList, parts } from '../../scripts/block-utils.js';

/*
 * Help grid — prose beside a link list, opened by the life band's rule.
 *
 * One row, two cells: [heading, body] and [link list]. The separator above is
 * drawn as the block's own top border rather than an <hr>, so the 72/1/72
 * rhythm survives without a second element in the authored content.
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  const cells = row ? [...row.children] : [];

  const prose = document.createElement('div');
  prose.className = 'help-grid__prose';
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

  block.textContent = '';
  block.append(prose);
  if (list) block.append(list);
}
