# Block brief — NAB replica lift (read this before writing any block)

You are converting an **approved pixel-gated prototype** into EDS blocks. This is a
**replica**: `stardust/replica/inconsistency-register.md` has zero entries, so any
visual delta you introduce is a **defect**, not an improvement. Never redesign,
never "improve" spacing, never round a value. Every number comes from the
prototype CSS.

## Sources of truth

| What | Where |
|---|---|
| Prototype markup | `stardust/prototypes/index-proposed.html` |
| Prototype CSS (shared canon) | `stardust/prototypes/canon.css` |
| Prototype CSS (desktop bands) | `stardust/prototypes/index.css` |
| Prototype CSS (≤767px + ≥768px) | `stardust/prototypes/mobile.css` |
| Authored content you must decode | `content/index.html`, `content/nav.html`, `content/footer.html` |
| Runtime facts | `stardust/runtime-contract.json` |
| Dynamic behaviour to implement | `stardust/dynamic-features-plan.md` |

## What already exists — do not duplicate it

`styles/styles.css` is the foundation and already ships, globally:

- the canon custom properties (`--nab-red`, `--page-grey`, `--container`, …)
- the reset (`margin: 0` + `font: inherit` on headings/`p`/`ul`, `ul{list-style:none}`,
  `img{display:block;max-width:100%}`, `box-sizing: border-box`)
- the type ramp classes `.t-display .t-h2 .t-h3 .t-card-title .t-body`
- `.nab-icon`, `.sr-only`, `.container`, `.cmp-list*` (the chevron list module)
- the EDS button family mapped to NAB: `a.button.primary` = NAB primary (red pill),
  `a.button.secondary` = NAB tertiary (red underlined text link)
- `main > .section` and `main > .section > div` are zeroed (no margin, no padding,
  no max-width) — **your block owns its own band geometry**

`scripts/icons.js` is the shared sprite helper — the ONLY place icon SVGs come from:

```js
import { icon } from '../../scripts/icons.js';
const chevron = icon('icon-chevron-right', 'cmp-list__item-icon');
```

`icon(id, className)` returns an `<svg class=…><use href="#id">` and injects the
sprite on first use. Available ids: `icon-search icon-chevron-down
icon-chevron-right icon-savings icon-card icon-home icon-business icon-link
icon-contacts icon-location icon-authorise icon-back icon-linkedin icon-facebook
icon-instagram icon-you-tube icon-twitter icon-tiktok`.

Blocks import from `/scripts/` only. **Never import another block** (the single
exception in this codebase is `fragment/fragment.js`, which you do not need).

## Runtime facts that will bite you

1. **`wrapTextNodes` runs before your `decorate()`.** Any block cell whose first
   element child is not `P/PRE/UL/OL/PICTURE/TABLE/H1–6`, **or that leads with a
   `<picture>`/`<img>` followed by anything else**, has its entire content folded
   into ONE `<p>`. Several cells here are media-led mixed cells
   (`<img> + <h2> + <p> + <p>`), so they arrive as a single wrapper `<p>`.
   **Always decode with a wrapper-expanding collector**, never `cell.children`:

   ```js
   function parts(cell) {
     const out = [];
     [...cell.children].forEach((child) => {
       if (child.tagName === 'P' && child.querySelector('h1,h2,h3,h4,h5,h6,ul,ol,img,picture,p')) {
         out.push(...child.childNodes);
       } else {
         out.push(child);
       }
     });
     return out.filter((n) => n.nodeType === 1 || n.textContent.trim());
   }
   ```

2. **Authors omit and add cells — decode defensively.** Never index blindly
   (`row.children[2]`); find by tag/selector and tolerate a missing cell.

3. **`decorateButtons()` has already run** when `decorate()` executes: an authored
   `<p><strong><a>` is now `<p class="button-wrapper"><a class="button primary">`,
   and `<em><a>` is `a.button.secondary`. Do NOT manufacture button anchors and do
   NOT re-wrap them; find `a.button` and restyle in your block CSS if the block's
   CTA geometry differs from the foundation's.

4. **Scope every CSS rule under your block class** (`.masthead`, `.quicklinks`, …).
   `-wrapper` / `-container` are section classes the runtime adds; you may use
   `.<name>-container .default-content-wrapper` to style a section head in place,
   but never scope your layout to a wrapper class.

5. **This boilerplate vintage has NO section-metadata support.** There are no
   section style classes. Band width, ground and vertical rhythm must live on your
   block's own root element.

6. **Never edit** `scripts/aem.js`, `scripts/scripts.js`, `styles/styles.css`,
   `content/*.html`, or another agent's block.

## Editability (Experience Workspace) — EW rules that matter here

The workspace stamps `data-prose-index` on every authored outermost
`h1–h6 / p / ul / ol` and only elements that still carry it stay editable.

- **MOVE authored nodes, never rebuild them.** `container.append(el)` is fine;
  `div.innerHTML = el.textContent` destroys editability.
- **Do not put classes on the authored text element itself** where avoidable —
  wrap it and use wrapper-descendant selectors (`.masthead__tile h2 { … }`), not
  `h2.cmp-title__heading { … }`.
- **`decorate()` adds no words.** Icons, wrappers and `alt=""` clones are fine;
  new visible strings are not. The one sanctioned exception is the
  "`, opens in new window`" `.sr-only` suffix on external links, which live NAB
  emits and the chrome gates count.

## Link decoration convention (used by several blocks)

For a `.cmp-list` chevron list built from an authored `<ul>`:

- internal href (starts with `/`) → trailing `icon-chevron-right`
- external href (`http(s)://` to another origin) → trailing `icon-link` **and** a
  `<span class="sr-only">, opens in new window</span>` before it

Markup shape to produce, per item (matches the prototype exactly):

```html
<li class="cmp-list__item">
  <a class="cmp-list__item-link" href="…">
    <span class="cmp-list__item-title">Text</span>
    <svg class="cmp-list__item-icon" aria-hidden="true" focusable="false"><use href="#icon-chevron-right"></use></svg>
  </a>
</li>
```

The `<ul>` itself gets `class="cmp-list"`. Keep the authored `<li>`/`<a>` nodes —
wrap the link's text in the title span by moving nodes, do not rebuild the anchor.

## Deliverables per block

- `blocks/<name>/<name>.js` — `export default function decorate(block) { … }`
- `blocks/<name>/<name>.css` — every rule scoped under `.<name>`, desktop rules
  first, then the `@media (max-width: 767px)` block lifted from `mobile.css`
- Both must pass the project lint: `npm run lint` (eslint airbnb-base + stylelint
  standard). Notable rules: 2-space indent, single quotes, semicolons, no
  `console`, arrow-body-style, max-len 100 for JS; stylelint wants lowercase hex,
  no duplicate selectors, and a blank line between rules.

## Definition of done

- The decorated DOM reproduces the prototype band's structure and computed
  geometry at **1440** and **360**.
- Every prototype CSS declaration for your band is represented, with the same
  values. If you cannot place a declaration, say so in your report — do not drop
  it silently.
- No `console.*`, no TODOs, no placeholder copy, no invented content.
