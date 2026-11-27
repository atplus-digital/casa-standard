# Changelog

## CASA 1.12 — 2026-11-27

- **The router budget is also measured in bytes** (ADR-0020, SPEC-0013): `docs-check` warns when
  `AGENTS.md` exceeds ~16 KB, besides the ~150-line cap. A router made of a few very long lines
  used to pass the line cap while costing many times the tokens.
- **Feature-scoped gotchas live in chapters:** at close, cross-cutting gotchas go to the router and
  feature-scoped ones go to the matching `docs/context/` chapter (`casa-close`, §5.2, §9 and the
  router template).
- **Unmapped chapters are flagged:** `docs-check` warns about a `docs/context/*.md` chapter that the
  router never references, since no agent would ever load it.
- **Proposals name the problem and the smallest change:** the ADR template and `casa-propose` ask for
  the observed problem and always list the smallest change among the options; the Spec template
  gains the `## Out of scope` section that §5.2 already prescribed; `casa-propose` asks that claims
  about existing code cite a path the author opened. Warnings and wording only: backward-compatible
  minor bump.

## CASA 1.11 — 2026-11-19

- **English becomes the canonical product language; zero breaking changes for Portuguese adopters**
  (ADR-0019, SPEC-0012): `STANDARD.md`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`,
  distributed templates (`docs/templates/*`, including the 5 `casa-*` Agent Skills), and CLI
  scripts (`docs-check`, `casa-init`, `docs-reserve`, `casa-update-check`, `pre-commit`,
  `install.sh`) move to canonical English.
- **Bilingual toolchain compatibility:** `docs-check`, `docs-reserve`, and `casa-init` continue
  accepting legacy Brazilian Portuguese structural markers from CASA 1.0–1.10 (`## Como validar
  (DoD global do repo)`, `> ⚠️ VERDADE ATUAL`, `## Questões em aberto`, `## Verificação`,
  `AAAA-MM-DD`, `(preencher no fechamento)`, `## Reservas ADR` / `## Reservas Spec`, and legacy
  pre-commit hook headers). Existing Portuguese repositories stay green without rewriting
  accepted ADRs or Specs; run `python3 scripts/docs-check --emit-index` once after upgrading
  the toolchain to refresh generated `README.md` table headers.
- **Bilingual official website (`/` EN + `/pt/` PT-BR):** `scripts/build-site` now publishes
  English at root (`/`) and full Brazilian Portuguese under `/pt/`, with direct page-to-page
  language switching, `hreflang` alternates, per-locale search indices, presentation-layer
  translations under `site/i18n/` (preserving immutable historical PT-BR ADRs untouched in git),
  and automated CI parity checks in `scripts/test-site`. Backward-compatible minor bump.

## CASA 1.10 — 2026-11-18

- In T1 repositories, `casa-init` installs `casa-explore`, `casa-propose`, `casa-apply`,
  `casa-verify`, and `casa-close` into `.agents/skills/` and `.claude/skills/` (open Agent
  Skills format; ADR-0017, SPEC-0010): the §9 delivery cycle becomes an executable agent
  procedure with specification links pinned to the adopter's `casa-standard-ref`. `casa-verify`
  audits edge-case × test coverage ("under what failure mode would this test still pass while
  the feature is broken?") — strictly assistive, never a gate. Backward-compatible change.

## CASA 1.9 — 2026-11-18

Trustworthy gate (SPEC-0009): the toolchain fulfills every guarantee promised by `STANDARD.md`
and closes gaps where the gate stayed green under false assumptions — or installed a hook git
never executed. Backward-compatible change.

**Migration** — re-run `casa-init` and then:
1. compare `.github/workflows/docs-check.yml` against `docs/templates/docs-check.workflow.yml`
   and incorporate per-event base SHA resolution, `merge_group`, and `permissions` — `casa-init`
   warns on workflow drift without overwriting custom workflows (repos using `master` previously
   compared PRs against a non-existent `origin/main`);
2. mark `docs-check` as a required status check in branch protection for your default branch;
3. fix any real issues uncovered by the stricter `docs-check` and update `casa-version: 1.9`.

- **Loophole-free ADR immutability**: compares against the merge-base by derived ADR number
  (renaming files no longer hides edits); deleting an accepted ADR or regressing its status is
  an error; the first top `CURRENT TRUTH` / `VERDADE ATUAL` callout is exempt up to 3 lines when
  edited (longer legacy blocks are tolerated while untouched).
- **Local gate**: `pre-commit` validates the git index (`docs-check --staged`, reading the exact
  tree `git write-tree` would commit); checkouts with an older validator fall back to disk mode
  instead of blocking commits; `casa-init` installs into the repo's effective hooks directory
  (local `core.hooksPath`, worktree common dir), refuses global `hooksPath` or parent repos of a
  subfolder, and upgrades older CASA hooks in place.
- **CI workflow**: event-aware base resolution (PR, merge queue, push), `merge_group` trigger,
  `permissions: contents: read`, and automatic default-branch detection in `casa-init`.
- **Router**: HTML comments no longer count as DoD commands; Markdown links count as chapter
  pointers; new routers start with `python3 scripts/docs-check` as their real DoD.
- **Frontmatter**: duplicate keys, empty `status`, and list-typed `status` produce clean errors
  (replacing silent overwrites or tracebacks); quoted `<Tag>` strings do not trigger placeholder
  errors.
- **Tree hygiene** follows git: `.gitignore`d files no longer fail the check.
- `docs-reserve spec` restores stamping the H1 title (regressed in 1.7); `casa-update-check`
  always `cd`s into the target root and never creates duplicate issues when `gh issue list`
  fails; documented `install.sh` pinning passes `CASA_REF` to `sh`.
- **Newly introduced prohibitions emit WARNINGs during the transition window**: placeholders in
  the global DoD or `TESTS.md`, and self-referential `builds-on`.

## CASA 1.8 — 2026-07-06

- **Scheduled out-of-gate detection of outdated contracts** (ADR-0016, SPEC-0008): new
  `scripts/casa-update-check` + weekly cron workflow distributed by `casa-init` for GitHub
  remotes (host-specific adapter, ADR-0006). Maintains **a single issue** labeled `casa-update`
  in the repo tracker — opened when declared `casa-version` lags upstream, updated in place
  while behind, and closed automatically once caught up.
- Hard invariants: always exits 0 when external I/O fails (network errors, unreadable versions)
  so the scheduled job never turns red; compares contract versions rather than git SHAs; network
  access inside `docs-check`/gates remains strictly forbidden (ADR-0010).
- Appendix A.5 updated: external drift detection is solved for GitHub remotes.

## CASA 1.7 — 2026-07-05

- **First-class home for UI in CASA** (ADR-0014): structural UI choices (design system, tokens,
  mandatory global states) live once in a repo ADR; feature-level visual states become ordinary
  EARS edge cases in the Spec under §7 DoD rules (real repo commands — never fictional samples);
  visual polish goes under `## Human review`. No fifth pillar, no separate UI template.
- **`design-ref` added to the closed frontmatter vocabulary** (§6): scalar URL or relative path,
  **non-normative** (code + snapshots win on divergence), exported to `docs/index.json` without
  format validation. UI guidance added to `spec.template.md`.

## CASA 1.6 — 2026-07-05

- **New `scripts/docs-reserve`** (ADR-0013, SPEC-0007): reserves the next `NNNN` and scaffolds
  an ADR or Spec from template (today's date, H1 = title, ASCII kebab slug), recording the
  reservation in `docs/BACKLOG.md`. Distributed via `casa-init` `TOOLCHAIN`.
- `docs/BACKLOG.md` adopts structured per-layer tables (`## ADR Reservations` / `## Spec
  Reservations` or `## Reservas ADR` / `## Reservas Spec`, accepting `NNNN` or `ADR-NNNN` in
  column 1). Unparseable lines inside reservation sections are **flagged explicitly**, never
  ignored silently.
- Refuses to operate if a misplaced backlog exists under `docs/context/` (ADR-0011) rather than
  creating a second ledger; parallel worktrees rely on merge-time table conflicts rather than
  external locks.

## CASA 1.5 — 2026-07-05

- **§7: Spec DoDs close the spec's own loop, not just the repo's** (ADR-0012): every numbered
  edge case requires a DoD command or test exercising it (case numbers cited in comments); a DoD
  that merely repeats generic router commands lacks spec-specific closure. Enforced during human
  PR review after rejecting brittle mechanical heuristics (issue #16).
- **§5.2: Incremental delivery splits the spec or trims scope** (ADR-0012): half-implemented
  umbrella specs do not exist; when splitting an accepted spec, the original becomes `deprecated`.
- Applies to new and modified specs. Doc-only contract bump (`CONTRACT_VERSION` / `CASA_VERSION`).

## CASA 1.4 — 2026-07-05

- **`casa-version` is the repository's promise** (ADR-0010): `casa-init` stops overwriting
  `casa-version` on existing routers (inserting only if absent). Updating `casa-version` is a
  deliberate act after reading `CHANGELOG.md`.
- `docs-check` gains `CONTRACT_VERSION` and **warns** on bidirectional drift between router
  declaration and installed toolchain (SPEC-0006). Warning only, never an error.
- `docs-check` **warns** when `backlog.md` (any case) appears inside `docs/context/` —
  mechanizing ADR-0002's Confirmation (ADR-0011); move to `docs/BACKLOG.md`.
- Test fixtures derive version numbers dynamically from script constants.
- Appendix A.5 records adopter update-cadence trade-offs.

## CASA 1.3 — 2026-07-05

- `casa-init` creates the **`CLAUDE.md` host shim** (`@AGENTS.md`) when absent: Claude Code does
  not read `AGENTS.md` natively, leaving the router invisible without the shim (ADR-0009,
  SPEC-0005).
- Existing `CLAUDE.md` belongs to repo identity — never overwritten; `casa-init` emits a WARNING
  if `@AGENTS.md` is missing. Host shims form a **closed** registry in `casa-init`.
- Distributes `docs/templates/CLAUDE.template.md`.

## CASA 1.2 — 2026-06-20

- Introduces **recognized context chapters** (closed registry): declaring a pointer in the
  router activates a built-in content invariant in `docs-check` (ADR-0008, SPEC-0004).
- First member: declared `docs/context/TESTS.md` requires at least one canonical test command.
- Distributes `docs/templates/context.TESTS.template.md` via `casa-init`.

## CASA 1.1 — 2026-06-13

- Defines standard maintainer: `atplus-digital/maicon`.
- Adds `casa-version` to the router to separate normative contract version from toolchain SHA.
- Validates required `AGENTS.md` metadata, global DoD, and Context map pointers.
- Tightens `accepted`/`implemented` Specs: zero unchecked open questions, placeholder-free DoD,
  and verified `implemented-by` paths.
- Adds CI immutability check for accepted ADRs.

## CASA 1.0 — 2026-06-09

- Promotes CASA Standard following green pilot validation (`console-platon`).
- Establishes layered router, ADRs, Specs, `docs-check`, `casa-init`, and `install.sh` bootstrap.
