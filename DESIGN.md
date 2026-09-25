---
name: NAB
description: Australia's business bank, speaking plainly about money in red, black and white.
colors:
  page-grey: "#F5F5F5"
  surface-white: "#FFFFFF"
  ink-black: "#000000"
  nab-red: "#C20000"
  nab-red-hover: "#BE0D00"
  nab-red-bright: "#ED0000"
  action-green: "#2C853C"
  banking-slate: "#3E5058"
  rule-grey: "#B3B3B3"
  panel-grey: "#E6E6E6"
  text-muted: "#4D4D4D"
typography:
  display:
    fontFamily: "source-sans-pro, helvetica, -apple-system, blinkmacsystemfont, 'Segoe UI', roboto, 'Helvetica Neue', sans-serif"
    fontSize: "48px"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "32px"
    fontWeight: 300
    lineHeight: "40px"
    letterSpacing: "normal"
  title:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "32px"
    letterSpacing: "normal"
  subtitle:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "normal"
  link:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "24px"
    letterSpacing: "normal"
  label:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "8px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.nab-red}"
    textColor: "{colors.surface-white}"
    typography: "{typography.link}"
    rounded: "{rounded.sm}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "{colors.nab-red-hover}"
    textColor: "{colors.surface-white}"
  button-conversion:
    backgroundColor: "{colors.action-green}"
    textColor: "{colors.surface-white}"
    typography: "{typography.link}"
    rounded: "{rounded.sm}"
    padding: "10px 24px"
  button-on-red:
    backgroundColor: "{colors.ink-black}"
    textColor: "{colors.surface-white}"
    typography: "{typography.link}"
    rounded: "{rounded.sm}"
    padding: "13px 24px"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.nab-red}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "12px 4px"
  card:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.md}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-black}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  site-header:
    backgroundColor: "{colors.ink-black}"
    textColor: "{colors.surface-white}"
    height: "64px"
---

<!-- stardust:provenance
writtenBy: stardust:extract
writtenAt: 2026-09-22T01:14:00Z
againstInput: https://www.nab.com.au/
readArtifacts:
  - stardust/current/_brand-extraction.json
  - stardust/current/pages/*.json
  - stardust/current/assets/screenshots/*.png
synthesizedInputs: []
stardustVersion: 0.10.0
note: >
  Descriptive capture of the EXISTING nab.com.au design system, aggregated across
  5 pages weighted by element count. Every value traces to a computed style, a
  captured asset, or a screenshot pixel. No creative direction is expressed here.
-->

# Design System: NAB

## Overview

**Creative North Star: "The Plain-Spoken Counter"**

_(Descriptive, not directed — the metaphor names what the captured artifact already does; no interview was run.)_

NAB's site behaves like a well-run bank counter: a black band across the top that never changes, a warm photograph to catch you, and then row after row of plainly labelled things you can do. The page background is a soft grey (#F5F5F5) and the content sits on it as white cards, so the whole site reads as a stack of forms and leaflets laid out on a counter rather than as a designed composition. Density is moderate and consistent — 40px between sections, 24px inside cards, nothing crowded and nothing luxurious.

The personality comes almost entirely from two decisions. The first is typographic: one family, Source Sans Pro, at Light 300 for every display and section heading. A 48px Light headline over 16px Regular body is unusual for a bank and is what keeps the site from feeling like a form — it is quiet where a competitor would be bold. The second is chromatic restraint: red is the brand and the action, black is structure, green is reserved for the one thing on the page you are most likely to want, and nothing else is coloured at all.

Photography carries the warmth the layout withholds. It is editorial and staged on purpose — studio lighting rigs are left in frame, walls are punched through in the shape of the NAB star — and it always appears as a full-bleed 1440×480 band with a white card floated over its left third. That masthead-with-overlay-card is the single most recognisable device on the site. Confirmed visual rejections, read from their total absence across 4,131 captured elements: no gradients, no pill buttons, no decorative shadows, no second typeface, no letter-spacing adjustments, no CSS background images.

**Key Characteristics:**

- One typeface, one weight ramp — hierarchy is carried by weight (300 / 600 / 700), not by size or family
- Grey page, white cards, black header — a three-layer surface model with no tonal steps between
- Red for brand and action; green for the single highest-intent action; nothing else coloured
- 4px on controls, 8px on cards, 50% on icon discs — no other radii exist
- Full-bleed editorial photo + floating white card as the standard page opening
- A red right-chevron as the universal "there is more here" mark

## Colors

A three-value neutral base (grey page, white surface, black ink) with one saturated brand red doing nearly all the work, plus a single green permitted to outrank it.

| Token | Value | Role |
|---|---|---|
| `page-grey` | `#F5F5F5` | The page. Every section that is not white sits on this. 47% of home-page pixels. |
| `surface-white` | `#FFFFFF` | Cards, panels, the masthead overlay card, alternating section bands. |
| `ink-black` | `#000000` | All body and heading text, and the fill of the 64px site header. |
| `nab-red` | `#C20000` | Brand. Primary button fill, link colour, active-nav underline, every chevron. |
| `nab-red-hover` | `#BE0D00` | The header Login button; the hover state of red fills. |
| `nab-red-bright` | `#ED0000` | Lives only inside the logo SVG's gradient and in campaign photography. |
| `action-green` | `#2C853C` | The single highest-intent action on a page: "Get started", "Talk to an expert". |
| `banking-slate` | `#3E5058` | Exactly one element: the "Internet Banking" selector in the header utility bar. |
| `rule-grey` | `#B3B3B3` | Card outlines and list hairlines. |
| `panel-grey` | `#E6E6E6` | Icon-card top panels and secondary fills. |
| `text-muted` | `#4D4D4D` | Microcopy that qualifies a CTA ("Open in less than 5 minutes"). |

**The green rule is the most important thing in this palette.** Red is the brand, but red is *not* the conversion colour. Green appears three times across five pages, always on the one action the page is built to produce. A page with two green buttons would be a defect.

**Colour on red.** Where a section is filled with `nab-red` (the `/business` masthead), the button switches to `ink-black` — never to white, never to a red tint.

## Typography

One family: **Source Sans Pro**, self-hosted as four woff2 files (300 / 400 / 600 / 700) from `/etc.clientlibs/nab/`. It is licensed under SIL OFL 1.1, so it is freely re-hostable on any target domain. 4,126 of 4,131 captured visible elements resolve to the same stack.

| Role | Size | Weight | Line-height | Where |
|---|---|---|---|---|
| `display` | 48px | 300 Light | 1.1 | Masthead H1 ("Home loans", "Contact Us") |
| `headline` | 32px | 300 Light | 40px | Section headings — the most common heading on the site (70 occurrences) |
| `title` | 24px | 700 Bold | 32px | Card titles |
| `title` (alt) | 24px | 300 Light | 32px | Sub-section headings — same size, opposite weight, different job |
| `subtitle` | 20px | 600 Semibold | 1.2 | Minor headings |
| `body` | 16px | 400 Regular | 24px | All `p` and `li` — 408 occurrences |
| `link` | 16px | 600 Semibold | 24px | In-content links, not underlined by default — 225 occurrences |
| `label` | 14px | 400 Regular | 20px | Disclaimers, footnotes, legal |

**The scale is ad-hoc, not modular.** 14 → 16 → 20 → 24 → 32 → 48 gives ratios of 1.14, 1.25, 1.2, 1.33, 1.5 — sizes chosen off a 4px grid rather than off a constant ratio. This is a real property of the system, not an oversight to correct.

**Weight, not size, does the hierarchy work.** 24px appears at both 700 and 300 depending on whether it titles a card or opens a sub-section. Light at display sizes and Bold at card sizes is the signature; a uniform-weight rendering would read as a different brand.

`letter-spacing` is `normal` at every size on every page. There are no tracking adjustments anywhere.

## Layout

- **Container:** `max-width: 1248px`, centred, inside a 1440px viewport — a ~96px gutter each side.
- **Header:** 64px, full-bleed black, `position: relative` at 1440 (it is not sticky on desktop). Carried as the custom property `--header-bar-height: 64px`.
- **Section rhythm:** 40px top / 40px bottom is the dominant section padding (17 occurrences); 40px / 0 is the second (10 occurrences), used where two sections share a background.
- **Base unit: 4px.** Every observed padding, gap and radius is a multiple of 4.
- **Page opening:** breadcrumb strip (white, thin, absent on the home page) → full-bleed 1440×480 photographic masthead with a white overlay card on the left third → optional sticky sub-nav → content.
- **Grids:** 2-up and 4-up are the common card grids; `/business` runs a 5-up product row and `/contact-us` a 3×2 support grid.
- **Alternating bands:** sections alternate between `page-grey` and `surface-white` full-bleed to separate topics without rules.
- **Responsive behaviour was not captured.** This extraction rendered at 1440×900 only; any downstream work needing mobile must re-measure.

## Elevation & Depth

The system is **nearly flat, with one shadow**.

- Standard card lift: `0 0 4px rgb(128, 128, 128)` — a tight, even, *non-directional* grey halo (25 occurrences). It reads as a soft outline rather than as a light source, which is why cards also carry a `1px solid #B3B3B3` border; the border does the separating and the shadow only softens it.
- Secondary variants: `0 0 4px rgba(0,0,0,0.32)` (10) and `0 1px 3px rgba(0,0,0,0.6)` (5), the latter on overlay chrome.
- There is no elevation *scale*. Nothing is raised further than anything else. Depth is expressed by tonal layering — black header over grey page over white card — not by stacked shadows.

## Shapes

- `4px` on controls: buttons, inputs, tags (72 occurrences).
- `8px` on cards and panels (38 occurrences).
- `50%` on icon and avatar discs (13 occurrences).
- **No pill radius exists anywhere on the site.** Not on buttons, not on chips, not on the topic selector.
- **No gradients in CSS.** The red gradient on the `/business` masthead is baked into a raster; the logo's gradient lives inside the SVG.
- Borders are hairlines: `1px solid #B3B3B3`, occasionally `#E6E6E6`.
- The recurring non-rectangular form is the **NAB six-point star** — as the logo, as a hole punched through walls in photography, as an outlined line-motif filling the `/business` masthead, and printed on the cards.

## Components

**Primary button** — `#C20000` fill, white text, `4px` radius, `10px 24px` padding, 16px/700. Bordered `1px solid #C20000` so it holds its metrics when it inverts.

**Conversion button** — identical geometry, `#2C853C` fill. Reserved for the one highest-intent action per page.

**On-red button** — identical geometry, `#000000` fill. Used only where the surface behind is NAB red.

**Tertiary "button"** — the most common action on the site (23 occurrences) is not a button at all: transparent, `#C20000` text at 16px/400, underlined, with a trailing red chevron. Used for "Find out more", "View all calculators", "Explore ways to bank with us".

**Card** — white, `1px solid #B3B3B3`, `8px` radius, the standard grey halo, a 24px/700 title, 16px/24px body, and a red chevron pinned to the right of the title row. The chevron, not the border, is what marks it as clickable.

**Icon card** — a card whose top half is a `#E6E6E6` panel holding a red-and-black line illustration, with title and body beneath. Used for the calculator grid.

**Quick-links list** — two columns of labelled rows on hairlines, each with a leading line-icon and a trailing red chevron. A denser alternative to a card grid for the same content.

**Site header** — 64px black bar: logo left; five nav items with a `2px` red underline marking the active section; search icon; the slate `#3E5058` Internet Banking selector; red Login flush right. Each nav item opens a full-width mega-menu carrying its own promo panels and images.

**Sticky sub-nav** — on product templates, a white tab bar under the masthead (red active underline) with a persistent conversion CTA on its right.

**Topic selector** — a full-width row of equal-width bordered buttons acting as a filter; square corners, no fill.

**Site footer** — four link columns (Quick links / About us / Policies and terms / Connect with us), a "Top" back-to-top link, six social destinations, then the regulatory block. 592px tall and identical on every page.

**Feedback side-tab** — a fixed red tab on the right viewport edge.

## Do's and Don'ts

**Do**

- Keep one typeface and let weight carry hierarchy — 300 for display, 700 for card titles, 600 for links.
- Open a page with a full-bleed photograph and float a white card over its left third.
- Give a page exactly one green action.
- Put the qualifying compliance sentence directly under the promise, in the same size.
- Use the red chevron wherever there is more to see — it is the site's universal affordance.
- Keep imagery in `<img>`/`<picture>`. The site has zero CSS background images and that is a real, useful property.
- Quantify effort next to the CTA ("Open in less than 5 minutes").
- Suffix every off-site link with ", opens in new window".

**Don't**

- Don't add a second typeface, a gradient, or a pill radius — none exist anywhere on the site.
- Don't make a red button the conversion action when a green one is present.
- Don't put a red button on a red surface; switch to black, as `/business` does.
- Don't raise anything above the single flat card shadow; there is no elevation scale.
- Don't treat one home-page masthead slide as canonical — it rotates server-side per request.
- Don't treat the mega-menu promo images as page content; they appear in every page's media inventory as navigation chrome.
- Don't adjust letter-spacing. Nothing on the site does.
- Don't tighten body copy below 16px/24px.
