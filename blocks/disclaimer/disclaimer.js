import { icon } from '../../scripts/icons.js';

/*
 * Disclaimer — a single collapsed disclosure closing the page.
 *
 * One cell holding the label. Live lazy-loads the panel body and the capture
 * never saw it, so the header stands alone exactly as the prototype has it:
 * the control is present and measurable, and nothing is invented behind it.
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block.firstElementChild;

  const title = document.createElement('span');
  title.className = 'nab-accordion__title';
  if (cell) {
    const source = cell.querySelector('p') || cell;
    while (source.firstChild) title.append(source.firstChild);
  }

  const button = document.createElement('button');
  button.className = 'nab-accordion__button';
  button.type = 'button';
  button.setAttribute('aria-expanded', 'false');
  button.append(title, icon('icon-chevron-down'));

  const header = document.createElement('h2');
  header.className = 'nab-accordion__header';
  header.append(button);

  const item = document.createElement('div');
  item.className = 'nab-accordion__item';
  item.append(header);

  block.textContent = '';
  block.append(item);
}
