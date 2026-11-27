---
status: proposed            # proposed | accepted | deprecated | superseded
date: YYYY-MM-DD
builds-on: []               # upstream ADRs: ADR-NNNN or repo:ADR-NNNN
superseded-by: null         # scalar; set on the old ADR in the commit that accepts the new one
deciders: []
---

<!-- id is DERIVED from the filename (docs/adr/NNNN-kebab-title.md → ADR-NNNN);
     title is DERIVED from the H1 below. Neither exists in frontmatter on purpose.

     ⚠️ CURRENT TRUTH callout — required when this ADR is superseded.
     Only substantive edit permitted on an accepted ADR. Max 3 lines:

> ⚠️ CURRENT TRUTH: <what still holds; what was revoked; current source ADR>
-->

# <decision title in active voice — becomes the derived title>

## Context and Problem
<!-- What situation forces a decision? Why now? Name the OBSERVED problem (incident, bug,
     request). No observed problem yet → issue tracker or docs/BACKLOG.md, not an ADR.
     ⚠️ DECISION ≠ CURRENT STATE: this document records the dated decision.
     Resulting current state lives in docs/context/ and points back here. -->

## Decision Drivers
<!-- Forces at play: requirements, constraints, cost, timeline, risk. -->

## Considered Options
<!-- Always list the smallest change that solves the observed problem (or doing nothing),
     even when it is not the option chosen (ADR-0020). -->

### Option 1 — <name>
**Pros:**
**Cons:**

### Option 2 — <name>
**Pros:**
**Cons:**

## Decision
<!-- The choice in one sentence + rationale in one paragraph.
     Integrable backend? Place it on the common axis: write coupling ×
     partial-failure handling (synchronous+compensation vs. asynchronous+reconciler). -->

## Consequences
<!-- Positive, negative, and what becomes forbidden or mandatory. -->

## Confirmation
<!-- How to verify the decision is respected IN PRACTICE:
     command, query, inspection. Closes the agent loop for this decision. -->

```bash
# e.g.: grep -r "supabase functions deploy" scripts/ && exit 1   # nobody bypasses sbx
```

## Notes
<!-- ⚠️ Do not invent: unmade business decisions go to the issue tracker, not an ADR.
     Mechanical rule: on an accepted ADR only frontmatter and the top CURRENT TRUTH
     callout may change (immutability lint, STANDARD §8). Any body edit —
     including typos or links — requires a new ADR that supersedes this one. -->
