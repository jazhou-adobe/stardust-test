# Dynamic features — NAB home (`index`)

Scope: home page only. Evidence: `stardust/replica/motion/index.json` (runtime
observation, 1440), `stardust/replica/capture/elements-{1440,360}.json`,
`stardust/current/pages/index.json`, and the gate probe outputs under
`stardust/replica/gates/index-*/`.

The static recreation is gated and passing at both breakpoints. Everything below
is the **dynamic surface the pixel gate certifies as correct but does not
exercise** — each row needs a disposition before the archetype ships.

| # | Feature | Where | Evidence | Host-bound? | Disposition |
|---|---------|-------|----------|-------------|-------------|
| D1 | Login selector panel | Header, `button#login.login-select` | `motion/index.json` → `classMutations: ["show-main-login"]` — the only behavior that fired | No | **Implemented** — class toggle + `aria-expanded`, inline script in `index-proposed.html`. Panel contents are not in the captured source (lazy), so nothing is fabricated. |
| D2 | Mega menu | Header, `a#menu` + `.mega-menu-anchor` ×5 | Captured hidden surface (panel markup + promo CTAs present in the offscreen block, absent from live's source inventory → content-diff 🟠 EXTRA, register R5) | No | **Rebuild as an EDS block** — panel markup is captured; wire open/close + focus trap at block level. Not implemented in the prototype (no runtime behavior fired at 1440). |
| D3 | Search overlay | Header, `.nab-header-search__search-button` | Anchor present in capture; live's `#search` **not found** by motion-observe (`widgetSamples[1].error`) — the overlay is injected on demand | Yes — search results API | **Replace with platform search.** Do not port NAB's search endpoint; bind to the EDS search index at rollout. |
| D4 | Rotating masthead | `.band--masthead` | No CSS animations/transitions observed; slide varies per request → rotation is **server-side**, not client carousel | Yes — content service | **Author as a single slide** (as gated) or promote to an EDS carousel block fed from a content sheet. Residual R1 records the volatility. |
| D5 | Footer accordions | `.nab-accordion__item` ×N, `button[aria-expanded]` | Poked at 1440 — **no animation, transition, or class mutation** (dead at desktop, where panels render expanded). Collapsed at 360 by layout. | No | **Implement at block level for mobile only** — expand/collapse + `aria-expanded`. Deliberately NOT implemented in the prototype: nothing fired, per the observed-not-inferred rule. |
| D6 | Notification / disclaimer banner | `.band--disclaimer` | Static in capture; no dismiss control observed | No | **Static** — no behavior to port. |
| D7 | Analytics + tag manager | End of `<body>` | content-diff 🟡 MISSING BODY ×2 — live's inline bootstrap script and the page `<title>`; a trailing ~24px tracking-pixel line box is included in `docHeight` 8692 | Yes | **Re-provision on the target host.** Never copy NAB's container IDs; the 24px line box must be reproduced or the height Δ moves. |
| D8 | Login destination links | `.quick-login` → `https://ib.nab.com.au/login` | Captured verbatim | Yes — external origin | **Keep absolute.** Internet Banking is a separate origin and does not migrate. |

## Not present on this page

Forms (no `<form>` in the captured home page), media players, modals beyond D1,
client-rendered listings, and sheet-backed content. Any of these on sibling
pages must be re-triaged — this row set covers `index` only.

## Observed-motion discipline

`motion-observe.mjs` ran once against the live URL with widget pokes
(`button[aria-expanded]`, `#search`, `button.login-select`) and hover probes
(`a`, `button`). Result: **0 animations, 0 transitions, 1 class mutation**.
The header timeline is constant across 14 scroll positions — there is no sticky
morph to replicate. Declared-but-never-fired transitions on `button`
(`box-shadow/border-color/background-color/color/fill 0.2s ease-in`) are
recorded as dead classes, not implemented.
