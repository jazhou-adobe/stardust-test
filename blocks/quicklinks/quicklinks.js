import { cmpList, iconId } from '../../scripts/block-utils.js';
import { icon } from '../../scripts/icons.js';

/*
 * Quick-links band.
 *
 * Each row is one column: [<code>icon-id</code>] [title link] [link list].
 * Two renderings live in the DOM at once and CSS picks one - the desktop grid
 * and, at <=767, the collapsed accordion the live page shows instead. No panel
 * contents were captured for the mobile accordion (live lazy-loads them), so
 * the headers stand alone exactly as the prototype has them.
 */
export default function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'quicklinks__grid';

  const accordion = document.createElement('ul');
  accordion.className = 'cmp-list nab-accordion quicklinks__accordion';

  [...block.children].forEach((row) => {
    const id = iconId(row);
    const link = row.querySelector('a');
    const list = row.querySelector('ul');

    const col = document.createElement('div');
    col.className = 'quicklinks__col';

    const head = document.createElement('div');
    head.className = 'quicklinks__head';
    if (id) head.append(icon(id, 'quicklinks__icon'));

    const title = document.createElement('h3');
    title.className = 'quicklinks__title';
    if (link) {
      link.classList.remove('button', 'primary', 'secondary', 'accent');
      link.className = 'cmp-title__link';
      title.append(link);
    }
    head.append(title);
    col.append(head);

    if (list) col.append(cmpList(list, 'quicklinks__list'));
    grid.append(col);

    if (id && link) {      const item = document.createElement('li');
      item.className = 'nab-accordion__item';
      const header = document.createElement('h3');
      header.className = 'nab-accordion__header';
      const button = document.createElement('button');
      button.className = 'nab-accordion__button';
      button.type = 'button';
      button.setAttribute('aria-expanded', 'false');

      const titleHeader = document.createElement('span');
      titleHeader.className = 'nab-accordion__title__header';
      const description = document.createElement('span');
      description.className = 'nab-accordion__title__description';
      description.textContent = link.textContent.trim();
      titleHeader.append(description);

      button.append(icon(id, 'nab-accordion__icon'), titleHeader, icon('icon-chevron-down', 'nab-accordion__chevron'));
      header.append(button);
      item.append(header);
      accordion.append(item);
    }
  });

  const card = document.createElement('div');
  card.className = 'quicklinks__card';
  card.append(accordion, grid);

  block.textContent = '';
  block.append(card);
}
