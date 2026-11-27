# AGENTS.md

```yaml
casa-repo-id: casa-standard
casa-tier: T1
casa-version: 1.12
casa-standard-ref: self
```

> ROUTER (CASA §4): always loaded, ~150-line cap. Cross-cutting high-ROI only.
> This repository IS the CASA Standard reference — it dogfoods its own rules.

## Context in 5 lines

This repo is the canonical source of truth for the **CASA Standard** (Context, ADRs, Specs,
Automation), the agent-first engineering workflow standard by `atplus-digital`. It houses the
normative specification (`STANDARD.md`), official templates (`docs/templates/`), zero-dependency
Python 3 reference toolchain (`scripts/*`, `install.sh`), and bilingual static site builder
(`scripts/build-site`, `site/`). There is no runtime service — the product is the spec + tools.

## How to validate (global repo DoD)

```bash
python3 scripts/docs-check          # exit 0; exact CI gate
bash scripts/test-docs-check        # exit 0; validator scenarios (SPEC-0003..0009, 0012, 0013)
scripts/test-casa-init              # exit 0; bootstrap scenarios (SPEC-0001, 0009, 0010, 0013)
scripts/test-docs-reserve           # exit 0; reservation scenarios (SPEC-0007, 0012)
scripts/test-update-check           # exit 0; update-check scenarios (SPEC-0008)
scripts/test-install                # exit 0; curl|sh installer scenarios (SPEC-0002)
scripts/test-site                   # exit 0; bilingual site & i18n parity scenarios (SPEC-0011, 0012)
```

## Git & PRs

Contribution flow (issue → `<type>/<issue>-slug` branch → PR with `Closes #NNN`): `CONTRIBUTING.md`.
Normative changes require a PR with discussion (STANDARD §10). `STANDARD.md` is normative: if you
change `docs-check` behavior, update §8 (and `site/i18n/pt/STANDARD.md`) in the same PR.

## Gotchas

<!-- NON-INFERABLE knowledge that already cost failed attempts. -->

- `docs-check` parses only a **restricted YAML subset** in frontmatter (scalar, inline list,
  block list). Anything else is a deliberate ERROR, never ignored — see STANDARD §6.
- `docs-check`, `docs-reserve`, and `casa-init` accept **both** canonical English structural
  markers and legacy Portuguese markers from CASA 1.0–1.10 (ADR-0019). Never break PT-BR
  backward compatibility; historical PT-BR ADRs (`0001`–`0018`) are immutable on disk.
- Pointer resolution scans the ENTIRE router (outside HTML comments): any chapter path under
  `docs/context` ending in `.md` written inside backticks OR as a Markdown link target becomes
  a declared pointer and must exist on disk — never format example paths either way in prose.
- `pre-commit` runs `docs-check --staged`: it validates the git INDEX, not the working tree.
  Stage changes with `git add` before testing `--staged`; `--check-adr-immutability` compares
  ADRs by derived NUMBER against the merge-base (renaming does not hide body edits).
- Declaring a RECOGNIZED chapter in the Context map (today only `TESTS.md` under `docs/context/`)
  activates a built-in content invariant requiring a canonical command (`RECOGNIZED_CHAPTERS`;
  extending requires an ADR — ADR-0008 / SPEC-0004).
- Errors exit `1` by default; `--warn-only` exits `0` and is strictly for adoption windows.
- `docs/adr|specs/README.md` and `docs/index.json` are **generated** via `--emit-index`; never
  hand-edit them. Freshness checks fail on drift.
- `install.sh`: keep the entire body inside `main()`, invoked on the VERY LAST line — truncation
  guard (SPEC-0002). Never append lines after `main "$@"`.
- Every new executable in `scripts/` needs `+x` recorded in the git index:
  `git update-index --chmod=+x scripts/<name>` (CI invokes scripts directly; exit 126 otherwise).
- `scripts/build-site`, `scripts/test-site`, and `site/` (including `site/i18n/`) belong strictly
  to this repo (never add to `TOOLCHAIN` in `casa-init`). Internal HTML links must stay relative
  so GitHub Pages subpath `/casa-standard/` resolves both `/` (EN) and `/pt/` (PT-BR) cleanly.
- `scripts/build-site` enforces structural i18n parity (SPEC-0012): changing section headings in
  `STANDARD.md`, `## CASA X.Y` versions in `CHANGELOG.md`, `casa-*` skills, or adding `ADR-0019+` /
  `SPEC-0012+` without updating `site/i18n/pt/` fails the build and CI (`scripts/test-site`).

## Context map

<!-- docs/context/ chapters — none needed in this repo yet. -->

| Chapter | When to load |
|---|---|
| (none yet) | — |

## Docs map

- Normative spec: `STANDARD.md` · Templates: `docs/templates/` · Contract history: `CHANGELOG.md`
- Decisions: `docs/adr/` · Behavior: `docs/specs/` (GENERATED READMEs — do not edit)
- Pending items & `NNNN` ledger: `docs/BACKLOG.md` — reserve via `scripts/docs-reserve adr|spec "title"`
- Adopter bootstrap/upgrade: `scripts/casa-init <target>` · Agent Skills: `docs/templates/skills/casa-*`
- Bilingual public site (GitHub Pages): `scripts/build-site` → `_site/` (`/` EN + `/pt/` PT-BR; `site/i18n/`)
- Validate: `scripts/docs-check` · Regenerate indices: `scripts/docs-check --emit-index`
