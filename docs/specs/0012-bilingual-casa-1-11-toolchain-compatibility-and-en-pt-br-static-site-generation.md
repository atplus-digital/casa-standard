---
status: implemented
date: 2026-11-19
builds-on: [ADR-0007, ADR-0013, ADR-0018, ADR-0019]
implemented-by:
  - STANDARD.md
  - README.md
  - CHANGELOG.md
  - CONTRIBUTING.md
  - AGENTS.md
  - CLAUDE.md
  - docs/BACKLOG.md
  - docs/templates/AGENTS.template.md
  - docs/templates/CLAUDE.template.md
  - docs/templates/adr.template.md
  - docs/templates/spec.template.md
  - docs/templates/context.TESTS.template.md
  - docs/templates/docs-check.workflow.yml
  - docs/templates/casa-update-check.workflow.yml
  - docs/templates/skills/casa-explore/SKILL.md
  - docs/templates/skills/casa-propose/SKILL.md
  - docs/templates/skills/casa-apply/SKILL.md
  - docs/templates/skills/casa-verify/SKILL.md
  - docs/templates/skills/casa-close/SKILL.md
  - install.sh
  - scripts/docs-check
  - scripts/casa-init
  - scripts/docs-reserve
  - scripts/casa-update-check
  - scripts/pre-commit
  - scripts/build-site
  - scripts/test-docs-check
  - scripts/test-casa-init
  - scripts/test-docs-reserve
  - scripts/test-update-check
  - scripts/test-install
  - scripts/test-site
  - site/style.css
  - site/app.js
  - site/i18n/en/docs.json
  - site/i18n/pt/STANDARD.md
  - site/i18n/pt/CHANGELOG.md
  - site/i18n/pt/skills.json
  - site/i18n/pt/pillars.json
  - site/i18n/pt/docs.json
  - .github/workflows/docs-check.yml
  - .github/workflows/pages.yml
---

# Bilingual CASA 1.11 toolchain compatibility and EN/PT-BR static site generation

## Goal

Ensure the CASA 1.11 reference toolchain (`scripts/docs-check`, `scripts/docs-reserve`, `scripts/casa-init`) operates in canonical English while preserving 100% backward compatibility with CASA 1.0–1.10 Brazilian Portuguese repositories, and upgrade `scripts/build-site` + `scripts/test-site` to publish and verify the complete bilingual CASA Standard website in English (`/`) and Portuguese (`/pt/`).

## Flow

1. **Toolchain validation & scaffolding (`docs-check`, `docs-reserve`, `casa-init`):**
   - New greenfield repositories initialized by `casa-init` receive English `AGENTS.md`, `CLAUDE.md`, templates (`docs/templates/*`), delivery-cycle skills (`casa-*`), workflows, and hooks stamped at `casa-version: 1.11`.
   - When `docs-check` runs against a repository using canonical English headings/markers OR legacy Portuguese headings/markers (`## Como validar (DoD global do repo)`, `> ⚠️ VERDADE ATUAL`, `## Questões em aberto`, `## Verificação`, `(preencher no fechamento)`, `AAAA-MM-DD`), all structural invariants evaluate identically.
   - When `docs-reserve` runs on a repository without `docs/BACKLOG.md`, it creates `## ADR Reservations` / `## Spec Reservations` (`| NNNN | title | date | status |`, `in use`); when run on an existing Portuguese `docs/BACKLOG.md` containing `## Reservas ADR` / `## Reservas Spec`, it recognizes and appends to the existing section in place without creating a duplicate table.
   - When `casa-init` encounters an existing pre-commit hook from CASA 1.0–1.10 (`Gate local do CASA Standard`) or CASA 1.11+ (`CASA Standard local gate`), it recognizes it as tool-owned and updates it cleanly while leaving foreign hooks untouched.
2. **Bilingual static site compilation (`scripts/build-site`):**
   - Reads canonical English `STANDARD.md`, `README.md`, `CHANGELOG.md`, and `docs/templates/skills/*/SKILL.md` for `/`, and reads Portuguese counterparts from `site/i18n/pt/{STANDARD.md,CHANGELOG.md,pillars.json,skills.json}` for `/pt/`.
   - Reads `docs/index.json` and on-disk Markdown files (`docs/adr/*.md`, `docs/specs/*.md`). For English (`/`), overlays translated title/callout/body from `site/i18n/en/docs.json` for historical PT-BR documents (`ADR-0001`–`ADR-0018`, `SPEC-0001`–`SPEC-0011`) and renders a provenance notice linking to the immutable Portuguese source. For Portuguese (`/pt/`), renders historical PT-BR documents directly from disk and overlays Portuguese translations from `site/i18n/pt/docs.json` for English-authored documents (`ADR-0019+`, `SPEC-0012+`) with a provenance notice.
   - Emits full English pages under `_site/` (`index.html`, `standard/index.html`, `graph/index.html`, `skills/index.html`, `changelog/index.html`, `adr/<stem>/index.html`, `specs/<stem>/index.html`), a legacy redirect stub at `_site/grafo/index.html` → `../graph/`, full Portuguese pages under `_site/pt/` (`pt/index.html`, `pt/standard/index.html`, `pt/grafo/index.html`, `pt/skills/index.html`, `pt/changelog/index.html`, `pt/adr/<stem>/index.html`, `pt/specs/<stem>/index.html`), and per-locale search indices (`assets/search-index.en.json`, `assets/search-index.pt.json`).

## Contract

### Bilingual Toolchain Markers (`CASA 1.11`)

| Construct | Canonical English (`1.11+`) | Accepted Legacy Alias (`1.0`–`1.10`) |
|---|---|---|
| Router DoD section | `## How to validate (global repo DoD)` | `## Como validar (DoD global do repo)` |
| Superseded ADR top callout | `> ⚠️ CURRENT TRUTH: …` | `> ⚠️ VERDADE ATUAL: …` |
| Spec open questions section | `## Open questions` | `## Questões em aberto` |
| Spec close evidence section | `## Verification` | `## Verificação` |
| Spec close placeholder | `(fill in on close)` | `(preencher no fechamento)` |
| Date template token | `YYYY-MM-DD` | `AAAA-MM-DD` |
| Reservation ledger sections | `## ADR Reservations` / `## Spec Reservations` | `## Reservas ADR` / `## Reservas Spec` |
| Local pre-commit hook marker | `CASA Standard local gate` | `Gate local do CASA Standard` |

### Bilingual Site Routes & Assets

- **English (`lang="en"`):** `/`, `/standard/`, `/graph/` (plus redirect `/grafo/` → `../graph/`), `/skills/`, `/changelog/`, `/adr/<stem>/`, `/specs/<stem>/`, indexed in `/assets/search-index.en.json`.
- **Portuguese (`lang="pt-BR"`):** `/pt/`, `/pt/standard/`, `/pt/grafo/`, `/pt/skills/`, `/pt/changelog/`, `/pt/adr/<stem>/`, `/pt/specs/<stem>/`, indexed in `/assets/search-index.pt.json`.
- **Language switcher & SEO:** Every page renders a masthead `EN | PT-BR` switcher whose relative `href` points to the exact counterpart page in the other locale, plus `<link rel="alternate" hreflang="en" …>`, `<link rel="alternate" hreflang="pt-BR" …>`, and `<link rel="alternate" hreflang="x-default" …>` (pointing to the English URL) when `--base-url` is set.

## Edge cases

| # | WHEN ⟨trigger⟩ | THE SYSTEM SHALL ⟨response⟩ |
|---|---|---|
| 1 | `docs-check` validates a repository whose router uses `## How to validate (global repo DoD)`, whose superseded ADR uses `> ⚠️ CURRENT TRUTH:`, and whose implemented Spec uses `## Open questions` + `## Verification` | exit `0` with `0` errors, enforcing identical placeholder, checkbox, `implemented-by`, and 3-line callout invariants as legacy Portuguese markers |
| 2 | `docs-check` validates an existing repository whose router, ADRs, and Specs use legacy Portuguese markers (`## Como validar (DoD global do repo)`, `> VERDADE ATUAL:`, `## Questões em aberto`, `## Verificação`) | exit `0` with `0` errors without requiring edits to accepted Portuguese documents |
| 3 | `docs-check --check-adr-immutability` runs on a superseded ADR whose top `> ⚠️ CURRENT TRUTH:` block exceeds 3 lines or is placed after the first `## ` heading | exit `1` rejecting the edit, matching `VERDADE ATUAL` immutability rules |
| 4 | `docs-reserve` runs on a repository without `docs/BACKLOG.md` vs. a repository whose `docs/BACKLOG.md` already has `## Reservas ADR` | create `## ADR Reservations` (`in use`) in the new ledger, or append to the existing `## Reservas ADR` table in place without creating a second section |
| 5 | `casa-init` runs on a repository containing a CASA 1.0–1.10 pre-commit hook copy (`Gate local do CASA Standard`) | recognize the legacy marker, upgrade the hook to the CASA 1.11 `scripts/pre-commit`, and preserve non-CASA hooks untouched |
| 6 | `scripts/build-site` compiles the repository into `_site` | emit complete HTML trees for both `/` (`lang="en"`) and `/pt/` (`lang="pt-BR"`), a relative redirect at `_site/grafo/index.html` → `../graph/`, and separate `search-index.en.json` / `search-index.pt.json` files |
| 7 | A reader clicks `EN` or `PT-BR` in the header on any page (including deep pages like `/adr/0017-…/` or `/pt/graph` counterpart `/pt/grafo/`) | navigate via relative path to the exact counterpart page in the target language without root-absolute `/…` paths that would break GitHub Pages `/casa-standard/` subpath hosting |
| 8 | Historical PT-BR documents (`ADR-0001`–`ADR-0018`, `SPEC-0001`–`SPEC-0011`) are rendered at `/` (EN) or English documents (`ADR-0019+`, `SPEC-0012+`) are rendered at `/pt/` (PT-BR) | render the complete translated prose from `site/i18n/<lang>/docs.json` alongside a provenance note linking to the canonical Markdown source on GitHub |
| 9 | `STANDARD.md` sections, `CHANGELOG.md` versions, `casa-*` skills, or `docs/index.json` documents diverge from `site/i18n/` | fail `scripts/test-site` (and `scripts/build-site` when required i18n entries are missing) with a non-zero exit code so CI blocks incomplete translations |
| 10 | `casa-init` installs or updates an adopting repository | never copy `site/`, `site/i18n/`, `scripts/build-site`, or `scripts/test-site` into the adopter |

## Out of scope

- Translating adopter-authored ADRs/Specs in external repositories (`site/i18n/` belongs exclusively to `casa-standard`).
- Automatic machine translation via network APIs during `build-site` (build remains 100% offline and deterministic).

## Open questions

(none — all architectural choices resolved in Issue #39 and ADR-0019)

## Definition of Done

```bash
python3 scripts/docs-check --check-adr-immutability --base-ref origin/main   # exit 0; historical ADRs untouched
bash scripts/test-docs-check        # exit 0; cases 1, 2, 3 (EN + PT-BR validator invariants)
scripts/test-docs-reserve           # exit 0; case 4 (EN + legacy PT-BR reservation ledgers)
scripts/test-casa-init              # exit 0; cases 5, 10 (hook upgrade + site/i18n isolation)
scripts/test-site                   # exit 0; cases 6, 7, 8, 9, 10 (bilingual build, links, switcher, parity)
```

## Human review

- Spot-check editorial tone, typography, and `EN | PT-BR` switching across desktop and mobile viewports on `/` and `/pt/`.

## Verification

```text
2026-11-19 · python3 scripts/docs-check --check-adr-immutability --base-ref origin/main → 30 docs · 0 error(s) · 0 warning(s), exit 0 (0 historical ADRs modified)
2026-11-19 · bash scripts/test-docs-check → 55 PASS / 0 FAIL (cases 1, 2, 3: canonical EN + legacy PT-BR invariants), exit 0
2026-11-19 · scripts/test-docs-reserve → 24 PASS / 0 FAIL (case 4: EN ledger + legacy ## Reservas ADR append), exit 0
2026-11-19 · scripts/test-casa-init → 73 PASS / 0 FAIL (cases 5, 10: PT-BR hook upgrade + site/i18n isolation), exit 0
2026-11-19 · scripts/test-update-check → 14 PASS / 0 FAIL, exit 0
2026-11-19 · scripts/test-install → 13 PASS / 0 FAIL, exit 0
2026-11-19 · scripts/test-site → 18 passed, 0 failed (cases 6, 7, 8, 9, 10: 71 EN/PT-BR HTML pages, relative switcher, provenance notes, CI parity gates), exit 0
```
