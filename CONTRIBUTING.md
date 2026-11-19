# Contributing to casa-standard

This repository is the **reference implementation** of the CASA Standard and dogfoods its own
rules. Normative truth lives in `STANDARD.md`, `docs/adr/`, `docs/specs/`, and `docs/templates/`;
this guide describes only the **contribution workflow** and points to canonical sources rather
than duplicating them (Principle 2: one fact lives in one file).

> Scale: this reference repository is maintained by a small core team. The workflow below is
> intentionally lean — GitHub issues track delivery, and pull requests host technical discussion
> (`STANDARD.md` §10). Delivery tracking lives in issues, PRs, and commits, never inside `docs/`
> (§3).

## Workflow

1. **Issue first.** Describe the problem, scope, and out-of-scope boundaries. Issues track
   delivery — §3 delegates tracking to the issue tracker rather than CASA documents.
2. **Branch** `<type>/<issue>-short-slug`, with `<type>` ∈ {`feat`, `fix`, `docs`, `chore`,
   `refactor`, `test`}. Example: `feat/39-english-canonical-bilingual-site`.
3. **Let §3 triggers decide what to write:**
   - Structural decision → **ADR**: run `scripts/docs-reserve adr "title"` to reserve `NNNN` and
     scaffold from template (ADR-0013; manual reservation in `docs/BACKLOG.md` remains valid).
   - Observable behavior contract → **Spec**: run `scripts/docs-reserve spec "title"` (define
     the executable DoD **before** implementing; §5.2).
   - Neither trigger fired? Write no document — code + tests + PR only.
   - Changed `docs-check` behavior? Update **§8** of `STANDARD.md` (and `site/i18n/pt/STANDARD.md`
     for bilingual site parity) in the same PR.
4. **Implement and close the loop.** Run every global DoD gate in `AGENTS.md` until green. Any
   completed Spec transitions to `implemented` in the same commit (`implemented-by` with real
   paths + `## Verification` evidence); regenerate indices via `scripts/docs-check --emit-index`.
5. **Open a PR** referencing `Closes #NNN` (or `Refs #NNN` for partial work). CI enforces
   `docs-check`.
6. **Conventional commits:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.
7. **Language:** new canonical docs (`ADR-0019+`, `SPEC-0012+`), templates, and scripts are
   authored in English (ADR-0019). Historical Portuguese ADRs (`ADR-0001`–`ADR-0018`) are
   immutable on disk; site-layer translations live in `site/i18n/` and are verified by
   `scripts/test-site`.

## Technical gate (Definition of Done)

The executable DoD lives in `AGENTS.md` (**"How to validate (global repo DoD)"**) — not
duplicated here. Every command listed there must exit 0 before merging.

## Review rules

- Normative changes (`STANDARD.md`, `docs-check` semantics) warrant peer review before merge.
- **Accepted ADRs are immutable:** any body edit — including typos or links — requires a new ADR
  that supersedes the old one; only frontmatter and the top `CURRENT TRUTH` / `VERDADE ATUAL`
  callout may change (`STANDARD.md` §5.1/§8).

## What does NOT become a document here

Epics, milestones, and delivery status belong in GitHub issues, PRs, and commits. Plans are
ephemeral; ADRs, Specs, and context chapters are what endure in `docs/`.
