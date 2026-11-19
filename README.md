# CASA Standard

**Context · ADRs · Specs · Automation** — an open engineering workflow standard for teams where AI coding agents (Claude Code, Cursor, Opencode, Codex, and peers) operate as first-class executors.

Design criterion: **complexity sustained by automation is cheap; complexity sustained by human discipline rots.** Everything in CASA is either enforced mechanically by zero-dependency tooling or costs near nothing to keep current.

🌐 **Documentation site:** [English (`/` — canonical)](https://atplus-digital.github.io/casa-standard/) · [Português (`/pt/`)](https://atplus-digital.github.io/casa-standard/pt/)

## The four pillars

| | What | Where |
|---|---|---|
| **C**ontext | Current operational state organized by token cost: always-loaded `AGENTS.md` router + on-demand chapters | `AGENTS.md`, `docs/context/` |
| **A**DRs | Structural, dated, immutable architectural decisions (MADR 4.0 + practical Confirmation) | `docs/adr/` |
| **S**pecs | Observable behavior contracts paired with an executable Definition of Done | `docs/specs/` |
| **A**utomation | Deterministic `docs-check` gate validating router, frontmatter, causal graph, and tree hygiene in CI | `scripts/docs-check` |

## What lives in this repository

- **[Official Website (GitHub Pages)](https://atplus-digital.github.io/casa-standard/)** — bilingual (`EN` / `PT-BR`) editorial reader for `STANDARD.md`, copyable quickstart, interactive ADR/Spec causal graph, Agent Skills catalog, and changelog, compiled directly from canonical sources (ADR-0018, ADR-0019).
- **[STANDARD.md](STANDARD.md)** — the normative specification and single source of truth.
- **[CHANGELOG.md](CHANGELOG.md)** — CASA contract version history and migration notes.
- **[docs/templates/](docs/templates/)** — official templates for `AGENTS.md`, `CLAUDE.md`, ADRs, Specs, recognized chapters, CI workflows, and delivery-cycle Agent Skills (`skills/casa-*`, ADR-0017).
- **[scripts/docs-check](scripts/docs-check)** — zero-dependency Python 3 reference validator.

## Getting started

New project or existing repository — bootstrap is identical ([STANDARD.md §10](STANDARD.md)), one command, zero clone required:

```bash
curl -fsSL https://raw.githubusercontent.com/atplus-digital/casa-standard/main/install.sh | sh -s -- <path-to-your-repo> --repo-id <name>
```

With no arguments, it targets the current working directory. To pin a specific version, pass `CASA_REF` to `sh`, not `curl` — `curl -fsSL …/install.sh | CASA_REF=<tag|sha> sh -s -- <path> --repo-id <name>` (prefixing `curl` never reaches the installer, which defaults to `main`). To audit before executing (recommended on first use):

```bash
curl -fsSLO https://raw.githubusercontent.com/atplus-digital/casa-standard/main/install.sh
less install.sh   # ~60 lines; writes only to mktemp and the target repo
sh install.sh <path-to-your-repo> --repo-id <name>
```

Or from a local clone: `git clone https://github.com/atplus-digital/casa-standard && casa-standard/scripts/casa-init <path> --repo-id <name>`.

`casa-init` installs the validator, templates, delivery-cycle skills (in T1), router (if absent), and automated gate (GitHub Actions CI with a GitHub remote; local pre-commit hook otherwise) — additive and idempotent: it never overwrites repository-owned content, and re-running updates the toolchain. In legacy repositories, it reports what needs content migration under §10; Portuguese structural markers from CASA 1.0–1.10 remain supported alongside canonical English (ADR-0019).

Validate any repository locally:

```bash
python3 scripts/docs-check               # validate; exits 1 on any error
python3 scripts/docs-check --emit-index  # regenerate docs/{adr,specs}/README.md and docs/index.json
python3 scripts/docs-check --warn-only   # print diagnostics and exit 0 (initial adoption window only)
```

## Status

Current contract version: header of [STANDARD.md](STANDARD.md) and [CHANGELOG.md](CHANGELOG.md) — intentionally not repeated here (Principle 2: one fact lives in one file). Maintainer: `atplus-digital/maicon`. Promotion rule fulfilled on 2026-06-09 (`console-platon`, 66 docs green under `docs-check`, plus `casa-standard` dogfooding itself). Changes happen via pull requests with conversation.

## License

[MIT](LICENSE) © atplus-digital
