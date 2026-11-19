---
status: accepted
date: 2026-11-19
builds-on: [ADR-0007, ADR-0010, ADR-0018]
superseded-by: null
deciders: [maicon]
---

# Adopt English as canonical product language with bilingual toolchain compatibility and bilingual site

## Context and Problem

Through CASA 1.10 (`ADR-0017`, `ADR-0018`), `casa-standard` was authored exclusively in Brazilian Portuguese (`PT-BR`): `STANDARD.md`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, distributed templates (`docs/templates/*`, including the five `casa-*` Agent Skills), reference CLI tools (`scripts/*`, `install.sh`), and the public GitHub Pages site (`/`).

As CASA opens up to international engineering teams, open-source contributors, and AI coding agents whose system prompts and skill routers operate predominantly in English, keeping Portuguese as the sole product language creates friction on two fronts:
1. **Product adoption & agent ergonomics:** global teams and English-first coding agents expect `STANDARD.md`, `AGENTS.template.md`, `SKILL.md` descriptions, and CLI diagnostics in English.
2. **Existing PT-BR ecosystem & ADR immutability:** existing repositories (`console-platon` with 66+ docs, plus `casa-standard` itself with `ADR-0001`–`ADR-0018` and `SPEC-0001`–`SPEC-0011`) already use Portuguese structural headings (`## Como validar (DoD global do repo)`, `> ⚠️ VERDADE ATUAL`, `## Questões em aberto`, `## Verificação`, `## Reservas ADR`) and hold accepted ADRs whose bodies are **mechanically immutable** under CASA §5.1 / §8.6 (`--check-adr-immutability`).

We need a clear language architecture that makes English the canonical source of truth for the product without breaking existing Portuguese adopters, violating ADR immutability, or allowing silent drift between languages on the public documentation site.

## Decision Drivers

- **Zero breaking changes for CASA 1.0–1.10 adopters:** upgrading the toolchain via `casa-init` must keep existing Portuguese repositories green without forcing teams to rewrite accepted ADRs or Specs (ADR-0010).
- **Strict ADR immutability (§5.1, §8.6):** `docs/adr/0001-*.md` through `docs/adr/0018-*.md` are `accepted` in `main`; rewriting their bodies in place to translate them would violate `--check-adr-immutability`, and superseding 17 active decisions just to change prose language would pollute the causal graph.
- **Principle 2 (one fact lives in one file):** normative rules must have a single authoritative source (`STANDARD.md` in English); translations exist strictly for human presentation on the website and must be mechanically checked for structural parity in CI.
- **Zero external dependencies (ADR-0018):** both the validator and the bilingual static site builder must remain pure Python 3 stdlib + Vanilla HTML/CSS/JS, and site-only translation catalogs must never leak into adopter repositories via `casa-init`.

## Considered Options

### Option 1 — English-only hard cutover (CASA 2.0) and rewrite/supersede historical docs
Translate every file in `casa-standard` (including rewriting `ADR-0001`–`ADR-0018` on disk) and drop Portuguese structural markers from `docs-check`.

**Pros:** Single language everywhere on disk with zero legacy aliases in `docs-check`.

**Cons:** Directly violates CASA §5.1 (`--check-adr-immutability`) on 17 accepted ADRs, breaks every existing PT-BR adopter repository on `casa-init`, and abandons Portuguese-speaking readers on the website.

### Option 2 — Keep Portuguese canonical on disk and translate to English only during site build
Leave `STANDARD.md`, `docs/templates/*`, and `scripts/*` in Portuguese and generate an `/en/` website subtree from translation files.

**Pros:** Zero changes to templates or `docs-check`.

**Cons:** Fails the core product goal: adopters running `install.sh` or `casa-init` still receive Portuguese templates, Portuguese `SKILL.md` triggers, and Portuguese CLI errors, keeping the product itself locked to a single regional language.

### Option 3 — English canonical product (`CASA 1.11`), bilingual marker acceptance in toolchain, immutable historical docs on disk, and bilingual `/` (EN) + `/pt/` (PT-BR) site
Move `STANDARD.md`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `AGENTS.md`, `docs/templates/*`, and `scripts/*` to English under a backward-compatible minor bump (`CASA 1.11`); accept both canonical English and legacy Portuguese structural markers in `docs-check`, `docs-reserve`, and `casa-init`; keep `ADR-0001`–`ADR-0018` and `SPEC-0001`–`SPEC-0011` untouched in git while authoring `ADR-0019+` and `SPEC-0012+` in English; and publish a bilingual website (`/` in English, `/pt/` in Portuguese) backed by presentation-only `site/i18n/` catalogs verified for structural parity in CI.

**Pros:** Makes the repository, templates, skills, and CLI genuinely English-first; preserves 100% backward compatibility for PT-BR adopters; honors ADR immutability to the byte; and delivers complete native reading experiences in both English and Portuguese on GitHub Pages.

**Cons:** Requires maintaining `site/i18n/` presentation translations in `casa-standard` when `STANDARD.md`, `CHANGELOG.md`, skills, or new ADRs/Specs change — mitigated by automated parity checks in `scripts/test-site`.

## Decision

Adopt **Option 3** as **CASA 1.11** (backward-compatible minor version):

1. **Canonical English product:** `STANDARD.md`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md`, `docs/BACKLOG.md`, all distributed templates (`docs/templates/*`, including `docs/templates/skills/casa-*/SKILL.md`), and CLI tools (`scripts/*`, `install.sh`) are authored in English.
2. **Bilingual structural compatibility in the toolchain:** `scripts/docs-check`, `scripts/docs-reserve`, and `scripts/casa-init` accept both canonical English structural markers (`## How to validate (global repo DoD)`, `CURRENT TRUTH`, `## Open questions`, `## Verification`, `(fill in on close)`, `YYYY-MM-DD`, `## ADR Reservations` / `## Spec Reservations`, `CASA Standard local gate`) and legacy Portuguese markers from CASA 1.0–1.10 (`## Como validar (DoD global do repo)`, `VERDADE ATUAL`, `## Questões em aberto`, `## Verificação`, `(preencher no fechamento)`, `AAAA-MM-DD`, `## Reservas ADR` / `## Reservas Spec`, `Gate local do CASA Standard`).
3. **Historical immutability + presentation-layer `site/i18n/`:** `ADR-0001`–`ADR-0018` and `SPEC-0001`–`SPEC-0011` remain untouched in their original Portuguese Markdown files on disk; `ADR-0019+` and `SPEC-0012+` are authored in English. Presentation-only translations live under `site/i18n/{en,pt}/` (strictly non-normative: in any divergence, the canonical file on disk wins, and `site/` is never distributed by `casa-init`).
4. **Bilingual GitHub Pages (`/` EN + `/pt/` PT-BR):** `scripts/build-site` emits English at `/` (`lang="en"`, `/graph/` with a compatibility redirect at `/grafo/`) and Brazilian Portuguese at `/pt/` (`lang="pt-BR"`, `/pt/grafo/`), complete with direct counterpart language switchers, `hreflang` alternate links, per-locale search indices, and CI parity gates in `scripts/test-site`.

## Consequences

- **Positive:** New adopters worldwide get an idiomatic English standard, templates, Agent Skills, and CLI out of the box, while Portuguese-speaking teams keep full native documentation at `/pt/` and zero migration breakage in existing repositories.
- **Positive:** Historical `ADR-0001`–`ADR-0018` pass `--check-adr-immutability --base-ref origin/main` with zero byte modifications.
- **Negative / Obligations:** Changes to `STANDARD.md`, `CHANGELOG.md`, `docs/templates/skills/casa-*`, or new ADRs/Specs in `casa-standard` must update the corresponding `site/i18n/` counterpart in the same PR — enforced mechanically by `scripts/test-site` in CI.

## Confirmation

```bash
python3 scripts/docs-check --check-adr-immutability --base-ref origin/main   # exit 0; 0 historical ADRs touched
bash scripts/test-docs-check                                                 # exit 0; EN + PT-BR fixtures pass
scripts/test-site                                                            # exit 0; EN (/), PT-BR (/pt/), and i18n parity green
grep -q "site/" scripts/casa-init && exit 1 || true                          # site/i18n never leaks into casa-init
```
