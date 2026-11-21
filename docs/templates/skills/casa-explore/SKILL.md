---
name: casa-explore
description: Maps CASA context before touching code — the AGENTS.md router, matching Context map chapters, upstream ADRs and Specs in docs/index.json, and affected source files — and determines whether the task requires an ADR, a Spec, or neither. Use when starting a non-trivial task, investigating an issue, or preparing a change in a CASA Standard repository.
---

# CASA · explore

Step 4 of the delivery cycle — §9 of [STANDARD](https://github.com/atplus-digital/casa-standard/blob/main/STANDARD.md) (pinned to the installed toolchain snapshot). Goal: understand **why** before **what**. Do not edit any files during this step.

1. Read `AGENTS.md` (router): global DoD, gotchas, and the Context map.
2. Load only the `docs/context/` chapters whose "When to load" trigger matches the task. Chapters hold current state; dated decisions live in ADRs.
3. Traverse the causal subgraph: in `docs/index.json` (or the generated `README.md` files under `docs/adr/` and `docs/specs/`), pick the relevant ADRs and Specs by title and follow `builds-on` upstream. For any `superseded` ADR, read its top `CURRENT TRUTH` (`VERDADE ATUAL`) callout and jump to `superseded-by`.
4. Read the code and tests touched by the task.
5. Return a concise brief:
   - active decisions constraining the task (`ADR-NNNN` + one line each);
   - the existing `SPEC-NNNN`, its status, and the case that covers the requested behavior, if any;
   - the §3 decision in one line: identify the ADR to propose for a new structural decision, the Spec to propose or revise for an observable contract change, or why code and tests suffice under the current contract;
   - anything the repo leaves unanswered → ask the human. Never invent requirements.

Revisit that decision if the scope expands, for example when a UI fix adds a new API operation. Unmade business decisions belong in the issue tracker or, in a trackerless repo, in `docs/BACKLOG.md` (§5.1).
