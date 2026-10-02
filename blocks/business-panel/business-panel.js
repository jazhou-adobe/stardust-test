import { cmpList, parts } from '../../scripts/block-utils.js';

/*
 * Business panel — a prose-and-list column beside a full-bleed image.
 *
 * One row, two cells: [heading, link list, CTA] and [image]. The prototype's
 * inner column also carries the class "business-panel"; here the block root
 * owns that name, so the column is business-panel__col and the image panel
 * keeps business-panel__media.
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  const cells = row ? [...row.children] : [];

  const section = document.createElement('div');
  section.className = 'business-section';

  const col = document.createElement('div');
  col.className = 'business-panel__col';

  const media = document.createElement('div');
  media.className = 'business-panel__media';

  cells.forEach((cell) => {
    parts(cell).forEach((node) => {
      if (node.tagName === 'IMG' || node.tagName === 'PICTURE') {
        media.append(node);
      } else if (node.tagName === 'UL' || node.tagName === 'OL') {
        col.append(cmpList(node, 'business-panel__list'));
      } else {
        col.append(node);
      }
    });
  });

  const cta = col.querySelector('a.button');
  if (cta) cta.classList.add('business-panel__cta');

  section.append(col);
  if (media.firstChild) section.append(media);

  block.textContent = '';
  block.append(section);
}
