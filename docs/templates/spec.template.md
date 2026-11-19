---
status: draft               # draft | accepted | implemented | deprecated
date: YYYY-MM-DD
builds-on: []               # foundational ADRs. A spec CONSUMES decisions; it does not redefine them.
implemented-by: []          # real paths (code, migrations, functions) — filled in on close
# design-ref: <url-or-path> # UI feature: NON-normative design reference (ADR-0014).
#                             Code+snapshots win on divergence; aesthetic review is human.
---

<!-- id is DERIVED from the filename (docs/specs/NNNN-kebab-title.md → SPEC-NNNN);
     title is DERIVED from the H1 below. -->

# <behavior in one sentence — becomes the derived title>

> Shared conventions (error envelope, authorization, data access):
> `docs/context/CONVENTIONS.md`. This spec does not repeat them — it only
> deviates explicitly when needed.

## Goal
<!-- What the user or system can do once this is implemented. -->

## Flow
<!-- Step-by-step observable behavior. -->

## Contract
<!-- API/events/UI: inputs, outputs, formats. What is guaranteed. -->

## Edge cases
<!-- Enumerated and DECIDED. Suggested format: EARS, stack-agnostic.
     Undecided cases DO NOT belong here — put them under Open questions.
     UI features (ADR-0014): UI states are ordinary edge cases —
     "WHEN the list is empty, THE SYSTEM SHALL render an empty-state with CTA";
     "WHEN viewport < 768px, THE SYSTEM SHALL collapse the table into cards".
     Design systems, tokens, and mandatory global states are NOT redefined here:
     they live in a repo ADR cited in builds-on. -->

| # | WHEN ⟨trigger⟩ | THE SYSTEM SHALL ⟨response⟩ |
|---|---|---|
| 1 |  |  |

## Open questions
<!-- Every unchecked item BLOCKS that part of the implementation —
     the agent never improvises over an open question. -->

- [ ] 

## Definition of Done
<!-- REQUIRED before leaving draft. Commands with binary pass criteria,
     executable in the environment described in AGENTS.md.
     Closes THIS spec's loop (§7, ADR-0012): every edge case enumerated above
     needs a line here — or a test invoked by one — that exercises it; cite case
     numbers in the comment. A DoD containing only generic repo commands
     (subset of the router's global DoD) signals a spec without its own closure.
     UI states: use a REAL repo command that exercises them (component test,
     visual regression, a11y — if the toolchain exists). NEVER copy sample
     commands the repo lacks: it passes docs-check and lies (ADR-0014). -->

```bash
npm run typecheck                 # exit 0
npm test -- --run <scope>         # N/N green — cases <numbers from table above>
```

## Human review
<!-- What requires human judgment and is NOT inside the agent's automated loop. -->

- 

## Verification
<!-- Filled in ON CLOSE (transition to implemented, same commit that populates
     implemented-by): DoD evidence — commands executed + outcome. -->

```text
(fill in on close)
```

<!-- Close checklist (single atomic commit):
     [ ] DoD green, evidence recorded above
     [ ] status: implemented + implemented-by with real paths
     [ ] new non-inferable gotchas → AGENTS.md
     [ ] new current state → relevant context chapter
     [ ] scripts/docs-check --emit-index (READMEs regenerated) -->
