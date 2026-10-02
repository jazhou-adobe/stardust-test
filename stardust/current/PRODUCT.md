<!-- stardust:provenance
writtenBy: stardust:extract
writtenAt: 2026-09-22T01:12:00Z
againstInput: https://www.nab.com.au/
readArtifacts:
  - stardust/current/_brand-extraction.json
  - stardust/current/pages/index.json
  - stardust/current/pages/personal.json
  - stardust/current/pages/business.json
  - stardust/current/pages/personal-home-loans.json
  - stardust/current/pages/contact-us.json
  - stardust/current/assets/screenshots/
synthesizedInputs: []
stardustVersion: 0.10.0
note: Descriptive snapshot of the existing site. This is what nab.com.au IS, not what it should be.
-->

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

_provenance: inferred — basis: the site's own top-level IA splits the audience five ways before any product is named, and each pillar's copy addresses a different reader._

- **Personal banking customers and prospects** — the default reader. Addressed in the second person about life events rather than products: buying a first home, moving to Australia, refinancing, managing money, travelling.
- **Business owners, weighted to small business and sole traders** — served by a parallel `/business` tree with its own accounts, cards, lending, EFTPOS and an explicit Small Business Hub, Sole Trader Resource Centre and AI for Business masterclass.
- **Corporate and institutional clients** — a third tree (`/corporate`) covering specialised finance, working capital, transaction banking, market risk and infrastructure.
- **Shareholders, job seekers and media** — served through `/about-us` (Shareholder Centre, board of directors, executive leadership, careers, news) and a dedicated contact route.
- **People who need help right now** — a distinct and heavily-signposted reader: fraud and scam victims, customers in financial hardship, people notifying a death, non-English speakers, and customers overseas. `/contact-us` leads with "What do you need help with?" and a topic selector before it offers any channel.

## Product Purpose

nab.com.au is the public storefront and service front door for National Australia Bank. It does three jobs at once:

1. **Acquisition** — surface and sell banking products (transaction and savings accounts, home loans, personal loans, credit cards, business lending, merchant services, insurance, wealth) and move the reader into an application.
2. **Self-service navigation** — route existing customers to Internet Banking, the NAB app, calculators, rate tables, branch finders and support channels. The header carries a persistent Internet Banking selector and Login button on every page.
3. **Obligation and disclosure** — publish the regulatory surface a licensed Australian bank must publish: Target Market Determinations, the Banking Code of Practice, Financial Services Guide, privacy policy, modern slavery statement, accessibility commitments and interpreter services.

Content is authored in Adobe Experience Manager (`/content/dam/nab/...`, `/etc.clientlibs/nab/...`) and composed from a fixed catalogue of section modules.

## Positioning

The brand line is **"more than money"**, set into the logo lockup itself. The site positions NAB less as a product vendor than as a partner through life and business stages — "We're here to help with whatever life looks like", "Your partner for zero fuss banking at every stage", "From your first questions to your next steps, we're your partner for every stage."

Competitive claims are made only where they are externally awarded and cited: Bank of the Year 2025 (badge on the home page), Finder Awards 2026 Small Business Rewards Credit Card, and "#1 for Platform Overall Features and Functionality — 8 years in a row" attributed to the Coalition Greenwich Voice of Client 2026 study. The site never asserts superiority in its own voice.

Effort, not price, is the recurring promise: "Open in less than 5 minutes", "Schedule your chat in 2 minutes.", "$0 monthly fee", "$0 international transfer fee".

## Capabilities and Constraints

- **Stack:** Adobe Experience Manager. Client libraries under `/etc.clientlibs/nab/`, assets under `/content/dam/nab/`.
- **Type:** one family site-wide — Source Sans Pro, self-hosted as four woff2 files (300/400/600/700). No second family anywhere.
- **Imagery:** every hero and card image is an `<img>`/`<picture>`. There are zero CSS background images on any captured page — a constraint worth preserving deliberately, since it keeps imagery in the content layer rather than the style layer.
- **Server-rotated mastheads:** the home and `/personal` mastheads serve a different campaign slide per request from identical markup. Any downstream process that treats one slide as the canonical hero will be wrong half the time.
- **Navigation chrome carries content:** each of the five mega-menus embeds its own promo panels with full-size rasters, so the same four campaign images appear in every page's media inventory regardless of topic.
- **Regulatory furniture is non-negotiable:** the compliance sentence that follows a product promise ("Other fees and charges apply. Consider the T&Cs, TMD and if right for you."), the footnote markers on offer copy, and the footer's policy block are legal obligations, not editorial choices.
- **Accessibility is stated as a commitment**, with a dedicated "Accessibility and inclusion" destination, interpreter services with a standing offer to arrange a translator, and every off-site link labelled ", opens in new window".
- **Scale:** 2,290 URLs in the published sitemap; 2,224 after filtering; 66 auth-walled.

## Brand Commitments

- **Register: `brand`.** This is a marketing and service storefront, not a tool. Basis: full-bleed editorial photography, campaign mastheads, award badges, question-form section headings, and a conversion CTA in every viewport. The authenticated product (Internet Banking, the NAB app) lives behind the Login button and is out of this scope.
- **Observed brand personality:** warm, plain-spoken, quietly confident, procedural when it matters. It names the reader's situation before it names a product. It quantifies effort. It qualifies every promise immediately rather than burying the qualification.
- **The star is the brand.** The six-point NAB star is not only the logo — it is punched through walls in the photography, drawn as a line motif across the `/business` masthead, and printed on the credit cards. Photography deliberately leaves studio lighting rigs in frame, so the imagery reads as knowingly staged rather than documentary.
- **Colour discipline:** red (#C20000) is the brand and the primary action; green (#2C853C) is reserved for the single highest-intent action on a page; black is structure (the header bar) and text. Nothing else.
- **Observed anti-references:** no exclamation marks; no superlatives in NAB's own voice; no urgency devices beyond dated promotional terms; no jargon in headings; no pill buttons, no gradients, no decorative shadows.

## Evidence on Hand

| Path | What it holds |
|---|---|
| `stardust/current/pages/index.json` + `.html` | Home — structure, full content, media, rendered DOM |
| `stardust/current/pages/personal.json` + `.html` | Personal pillar landing |
| `stardust/current/pages/business.json` + `.html` | Business pillar landing |
| `stardust/current/pages/personal-home-loans.json` + `.html` | Product template (sticky sub-nav, calculators) |
| `stardust/current/pages/contact-us.json` + `.html` | Support/contact template (topic selector) |
| `stardust/current/assets/screenshots/*.png` | Five full-page captures, 1440 wide, 3,571–7,347px tall |
| `stardust/current/assets/logo.svg` | NAB star + "more than money" lockup |
| `stardust/current/assets/favicon.ico` | Site favicon |
| `stardust/current/assets/fonts/*.woff2` | Source Sans Pro 300/400/600/700, as served |
| `stardust/current/_brand-extraction.json` | Consolidated brand surface with per-value citations |
| `stardust/current/_crawl-log.json` | Discovery, selection scores, vision check, media-coverage verdict |

## Product Principles

_provenance: inferred — basis: patterns that hold across all five captured pages._

1. **Name the situation, then the product.** Section headings are questions about the reader's life ("Ready for a new everyday account?", "Thinking about refinancing?", "What do you need help with?"). 7 of 17 captured section headings are questions.
2. **One action per viewport, and make it obvious.** Green marks the single highest-intent action; everything else is red primary or a red text link with a chevron.
3. **Quantify the effort.** Time-to-complete appears next to the CTA, not in the fine print.
4. **Qualify immediately, in plain words.** The compliance sentence sits directly under the promise in the same type size, not in a footer.
5. **One family, weight does the work.** Hierarchy is carried by weight (300 display, 700 card titles, 600 links) rather than by a wide size ramp or a second typeface.
6. **Restraint in the furniture.** 4px radius on controls, 8px on cards, one tight grey shadow, no gradients, no pills.
7. **Help is never more than one surface away.** Every page carries the same support routes in the header, the footer, and often a persistent CTA or side tab.

## Accessibility & Inclusion

Observed on the captured pages:

- A dedicated **"Accessibility and inclusion"** destination in the contact IA.
- **Interpreter services** presented as a first-class support card with an explicit offer: "just say 'I need an interpreter' and we'll arrange for someone to help with your enquiry", plus a fallback for unlisted languages.
- **First Nations support** as a named support route.
- Every external link is suffixed **", opens in new window"** in its accessible name.
- **Semantic landmarks** present on every page: `header`, `nav`, `main`, `footer`.
- **Body text at 16px/24px** (1.5 line-height) with `letter-spacing: normal` at every size.
- **Contrast:** black on #F5F5F5 measures 19.26:1, white on #C20000 6.38:1, white on #2C853C 4.64:1, and the muted microcopy #4D4D4D on white 8.45:1 — all clear 4.5:1. The lowest observed pairing is the #B3B3B3 card hairline against white at 2.10:1; as a non-text boundary the bar is 3:1, so it does not clear. See the brand review's tensions.
- **Alt text:** 98 of 134 captured images (73%) carry empty `alt`. Some of that is correct — decorative campaign rasters in the mega-menus should be empty — but the proportion is high enough to need a content-sourcing decision rather than an assumption.
- **Not verified by this extraction:** keyboard traps, focus-visible styling, screen-reader order through the mega-menus, and the accessible names of the chevron affordances. These need a live audit, not a DOM capture.
