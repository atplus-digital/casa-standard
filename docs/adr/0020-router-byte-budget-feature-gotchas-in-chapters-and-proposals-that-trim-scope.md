---
status: proposed
date: 2026-11-27
builds-on: [ADR-0012, ADR-0017]
superseded-by: null
deciders: [maicon]
---

# Router byte budget, feature gotchas in chapters, and proposals that trim scope

## Context and Problem

An audit of a T1 adopter that follows the standard mechanically and passes `docs-check` with zero errors found four gaps (issue #45):

1. **The router grows without tripping the cap.** `casa-close` tells the agent to append every non-inferable gotcha to `## Gotchas` in `AGENTS.md`, and the cap is counted in lines only. The audited router had 109 lines, under the ~150 cap, and 32 KB: 29 gotchas took 24 KB, with single lines up to 1,649 characters, almost all of them current state of one feature restating its ADR and Spec.
2. **Chapters can be invisible.** Three of eight `docs/context/` chapters were missing from the Context map. `docs-check` validates router → file, never file → router.
3. **The Spec template lacks a section the standard prescribes.** §5.2 and `casa-propose` send deferred work to `## Out of scope`, and `spec.template.md` has no such section.
4. **Nothing in the cycle rewards a smaller proposal.** Templates and `casa-propose` ask for options, edge cases and DoD coverage, never for the observed problem or the smallest change. One proposal reached 9 Specs and 66 edge cases following the process to the letter; after trimming it solved the same observed problems with 2 Specs and 23 cases. Three of its "reuses the existing mechanism" claims were wrong and were caught only by a later review against the code.

All four rely on discipline that the design criterion of this standard says will rot.

## Decision Drivers

- Mechanical where it is cheap, wording where judgment is needed.
- No new failing gate: adopters upgrade without breaking.
- Product-agnostic: the standard carries the mechanism, never an adopter's product values.

## Considered Options
<!-- Always list the smallest change that solves the observed problem (or doing nothing),
     even when it is not the option chosen (ADR-0020). -->

### Option 1 — Wording only

Route feature gotchas to chapters in `casa-close` and add `## Out of scope` to the Spec template.

**Pros:** no validator change.
**Cons:** routers that are already oversized stay silent, and listing chapters in the map keeps depending on discipline.

### Option 2 — Wording plus two warnings

**Pros:** the two silent failures become visible at the gate without failing anyone.
**Cons:** adopters with a large router or unlisted chapters see new warnings after upgrading.

### Option 3 — Hard limits

Error on router size, a cap on edge cases per Spec, a validated "smallest change" section.

**Pros:** fully mechanical.
**Cons:** measures form instead of the decision, breaks existing adopters, and turns judgment into a gate.

## Decision

Adopt option 2.

1. The router budget is ~150 lines **and** ~16 KB (about 4,000 tokens, the size of 150 ordinary lines). `docs-check` warns on either.
2. At close, cross-cutting gotchas go to the router and feature-scoped gotchas go to the matching `docs/context/` chapter (§5.2, §9, `casa-close`, the router template).
3. `docs-check` warns about a `docs/context/*.md` chapter the router never references. `README.md` is skipped, and a misplaced backlog keeps its own warning (ADR-0011).
4. The Spec template gains `## Out of scope`.
5. The ADR template and `casa-propose` ask for the observed problem and always list the smallest change among the options. `casa-propose` asks that claims about existing code cite a path the author opened.

## Consequences

- Nothing fails after the upgrade. Adopters over budget, or with unlisted chapters, get warnings that say what to move and where.
- A file kept in `docs/context/` without being a chapter, such as a dated note, has to be listed or moved out.
- Proposals get smaller by default and reviewers have a rule to point to. Whether the listed change really is the smallest remains a judgment for review.
- The number of edge cases and the size of a Spec stay unvalidated on purpose.
- An adopter's product principles stay in the adopter's own ADR and chapter. No new document type is introduced.

## Confirmation

```bash
bash scripts/test-docs-check     # SPEC-0013 cases 1–5
scripts/test-casa-init           # SPEC-0013 cases 6–7
python3 scripts/docs-check       # this repository stays green under its own new warnings
```
