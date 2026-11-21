---
name: casa-propose
description: Turns a requirement into a review-ready CASA ADR or Spec — evaluates STANDARD §3 triggers, reserves the next number via scripts/docs-reserve, writes EARS edge cases, and defines an executable DoD with real repository commands. Use when a task introduces a structural decision or new/changed observable behavior.
---

# CASA · propose

Steps 1–3 of the delivery cycle — §9 of [STANDARD](https://github.com/atplus-digital/casa-standard/blob/main/STANDARD.md) (pinned to the installed toolchain snapshot). Context not mapped yet? Run `casa-explore` first.

1. **Trigger (§3):** structural decision → ADR. Observable contract (API, user flow, meaningful edge cases) → Spec. Neither → write no document.
2. **Reserve and scaffold from template:** `python3 scripts/docs-reserve adr "title"` or `python3 scripts/docs-reserve spec "title"`. Use the reserved number and edit the file at the path printed by the command.
3. **ADR** (`status: proposed`): context, decision drivers, options with pros and cons, one-sentence decision, consequences, and `## Confirmation` with a practical command verifying compliance (§5.1). Current state never goes into an ADR — put it in a context chapter. When superseding an accepted ADR, in the commit that accepts the new ADR mark the old one `superseded`, set `superseded-by`, and add the top `CURRENT TRUTH` callout (max 3 lines).
4. **Spec** (`status: draft`): cite foundational ADRs in `builds-on`; define Flow, Contract, and numbered Edge cases, preferably in EARS ("WHEN trigger, THE SYSTEM SHALL response"). Anything undecided goes under `## Open questions` as `- [ ]` — blocking implementation on that point.
5. **DoD (§7):** REAL repository commands with a binary pass criterion in comments; every numbered edge case must be exercised by a DoD line or a test it runs (`# cases 1–4`). A DoD containing only generic router commands lacks spec-level closure.
6. Run `python3 scripts/docs-check --emit-index` and `python3 scripts/docs-check` until green. Present the proposed text or diff for human review. When promoting it to `accepted`, point in the PR to the human decision covering that revision. Reuse an explicit acceptance of the same text. A request to ship a feature sets its scope. A contract written afterward still needs review.

Delivery too large for a single atomic close? Split into separate specs or move deferred scope to `## Out of scope` (casa-standard:ADR-0012).
