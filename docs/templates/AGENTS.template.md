# AGENTS.md

```yaml
casa-repo-id: <repo-canonical-name>      # used in cross-repo references (repo:ADR-0001)
casa-tier: T1                            # T0 (light) | T1 (standard) — STANDARD §3
casa-version: 1.12                       # adopted CASA contract version (repo promise, ADR-0010)
casa-standard-ref: <sha>                 # source casa-standard snapshot — stamped by casa-init
```

> Standard: https://github.com/atplus-digital/casa-standard (STANDARD.md)
> ROUTER (CASA §4): always loaded, ~150-line cap. Cross-cutting high-ROI only.
> Over the cap → push details down to docs/context/, keep only a pointer here.
> ⚠️ DO NOT use @import to inline chapters: @import expands everything at launch.
> Package-specific rules → <subdir>/AGENTS.md (native lazy loading, nearest-wins).

## Context in 5 lines
<!-- What this system is, who it serves, and its primary stack. Max 5 lines. -->

## Infra & environments
<!-- Where it runs; what is self-hosted. ⚠️ List tools you must NEVER use
     (e.g., "Self-hosted Supabase → never run the supabase CLI").
     Extensive detail → docs/context/INFRA.md (add pointer to the map below). -->

## How to run locally
```bash
# exact, copyable commands
```

## How to validate (global repo DoD)
```bash
python3 scripts/docs-check   # exit 0 — CASA gate (STANDARD §8)
```
<!-- Add this repo's REAL build/test commands to the block above, with a binary
     pass criterion in the comment (e.g., `pytest -q   # exit 0`). Copying sample
     commands the repo does not have passes docs-check and lies (STANDARD §7). -->


## How to deploy
<!-- Official tool/script, sequence, and what NOT to do. -->

## Git & PRs
<!-- Conventions; when to commit; whether a remote exists; whether agents open PRs unprompted. -->

## Gotchas
<!-- CROSS-CUTTING, NON-INFERABLE knowledge that already cost failed attempts (toolchain,
     environment, repo-wide rules). A gotcha scoped to one feature goes to that feature's
     docs/context/ chapter, listed in the Context map below (ADR-0020). -->

- 

## Context map
<!-- Index of chapters (docs/context/), each stating WHEN to load it.
     Chapter = current, imperative, timeless state. Dated decision = ADR. -->

| Chapter | When to load |
|---|---|
| (none yet) | — |

## Docs map
- Decisions: `docs/adr/` · Behavior: `docs/specs/` (GENERATED READMEs — do not edit)
- Validate: `scripts/docs-check` · Regenerate indices: `scripts/docs-check --emit-index`
