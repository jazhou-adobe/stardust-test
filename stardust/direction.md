---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-09-22T02:10:00Z
  againstInput: https://www.nab.com.au/
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of
https://www.nab.com.au/, promoted verbatim (no `direct` invocation, no
creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-09-22T02:10:00Z).

Scope: home page only (one archetype, `index`). The extract on disk is a
discovery-cap crawl (5 pages) that DID produce the descriptive synthesis, so
promotion is verbatim (full-prep branch), not `bounded-single`. Site-scope
fan-out would require re-running Phase 1 with `--prep`.

Permitted deltas: ONLY the entries of
stardust/replica/inconsistency-register.md (0 entries — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.
