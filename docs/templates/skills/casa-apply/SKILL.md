---
name: casa-apply
description: Implements an accepted CASA Spec until its DoD is green while honoring upstream builds-on ADRs and never improvising over open questions. Use when implementing, fixing, or resuming a feature specified under docs/specs/ in a CASA repository.
---

# CASA · apply

Steps 4–5 of the delivery cycle — §9 of [STANDARD](https://github.com/atplus-digital/casa-standard/blob/main/STANDARD.md) (pinned to the installed toolchain snapshot).

1. **Check the Spec:** `status: accepted` and zero unchecked `- [ ]` items under `## Open questions`. If still `draft`, or if an open question touches your scope, stop and ask — agents never improvise over open questions (§5.2).
2. Read every ADR listed in `builds-on` and honor each `## Confirmation` check.
3. Implement edge case by edge case, writing or updating the test invoked by the corresponding DoD command.
4. Run both the Spec's DoD and the router's global DoD until green. Never weaken or swap out a DoD command just to make it pass.
5. Track notes while working for `casa-close`: non-inferable gotchas that cost failed attempts, current-state changes (destined for `docs/context/`), and every real path touched (destined for `implemented-by`).

Need to change the observable contract mid-flight? Update the Spec — and confirm with the human — before continuing. Code and Spec never diverge.
