---
status: draft
date: 2026-11-27
builds-on: [ADR-0020]
implemented-by: []
---

# docs-check flags an oversized router and unmapped chapters; templates and skills prompt for scope and evidence

## Goal

An adopter learns from the gate that its router is too heavy or that a context chapter is never loaded, and an agent proposing an ADR or a Spec is asked for the observed problem, the smallest change, what is out of scope, and evidence for claims about existing code.

## Flow

1. `docs-check` reads `AGENTS.md`, measures lines and bytes, and collects the chapter pointers.
2. It lists `docs/context/*.md` and compares the files with the pointers.
3. Size and unmapped-chapter findings are printed as warnings. The exit code does not change.
4. `casa-init` distributes the updated templates and skills, as it already does for the toolchain.

## Contract

- **Router byte budget.** `ROUTER_BYTE_CAP = 16_000` bytes of UTF-8, checked independently of the 150-line cap. Message: `AGENTS.md has N bytes (~16000-byte budget) — move feature-scoped gotchas and detailed content to docs/context/ and keep a pointer in the Context map (ADR-0020)`.
- **Unmapped chapter.** For each `docs/context/*.md` (top level, sorted) whose repository-relative path is not a router pointer: `AGENTS.md: chapter '<path>' is not referenced by the router — add it to the Context map with when to load it, or move it out of docs/context/ (ADR-0020)`. A pointer is what the router already recognizes: the path in backticks or as a Markdown link target. `README.md` and `backlog.md`, in any letter case, are skipped.
- **Templates.** `spec.template.md` has `## Out of scope` before `## Open questions`. `adr.template.md` asks for the observed problem in the context and for the smallest change among the options. `AGENTS.template.md` describes `## Gotchas` as cross-cutting and sends feature-scoped gotchas to a chapter.
- **Skills.** `casa-close` sends cross-cutting gotchas to the router and feature-scoped ones to the matching chapter. `casa-propose` asks for the observed problem and the smallest change in an ADR, for `## Out of scope` in a Spec, and for evidence behind claims about existing code.

## Edge cases

| # | WHEN ⟨trigger⟩ | THE SYSTEM SHALL ⟨response⟩ |
|---|---|---|
| 1 | WHEN `AGENTS.md` has fewer than 150 lines and more than 16,000 bytes | THE SYSTEM SHALL emit the byte-budget warning, no line-cap warning, and exit 0 |
| 2 | WHEN `AGENTS.md` is within both budgets | THE SYSTEM SHALL emit no router-size warning |
| 3 | WHEN a `docs/context/*.md` file is not referenced by the router | THE SYSTEM SHALL emit a warning naming that file and exit 0 |
| 4 | WHEN every chapter is referenced, one in backticks and one as a link target | THE SYSTEM SHALL emit no unmapped-chapter warning |
| 5 | WHEN `docs/context/` holds `README.md` and a backlog file | THE SYSTEM SHALL not report them as unmapped chapters and SHALL keep the backlog warning |
| 6 | WHEN `casa-init` installs the templates | THE SYSTEM SHALL deliver a Spec template with `## Out of scope` and an ADR template that asks for the smallest change |
| 7 | WHEN `casa-init` installs the skills | THE SYSTEM SHALL deliver a `casa-close` that routes feature-scoped gotchas to a chapter and a `casa-propose` that asks for the observed problem, the smallest change and evidence |

## Out of scope

- A limit on edge cases per Spec, or any validation of whether the listed change is the smallest: judgment stays with review (ADR-0020).
- Nested folders under `docs/context/`: only top-level chapters are compared with the map.
- A warning for Specs accepted over an ADR that is still `proposed`: seen in the same audit, tracked in issue #45 as a possible follow-up.

## Open questions

None.

## Definition of Done

```bash
bash scripts/test-docs-check     # exit 0 — cases 1–5 (SPEC-0013/1 to SPEC-0013/5)
scripts/test-casa-init           # exit 0 — cases 6–7 (SPEC-0013/6 and SPEC-0013/7)
scripts/test-site                # exit 0 — EN/PT parity of STANDARD, CHANGELOG, skills and docs
python3 scripts/docs-check       # exit 0 — this repository under its own new warnings
```

## Human review

- Whether ~16 KB is the right budget. It is a constant chosen as the size of 150 ordinary lines.
- The wording of the new prompts in the templates and in `casa-propose`.

## Verification

```text
(fill in on close)
```
