---
name: casa-close
description: Performs atomic closure of a CASA Spec in a single commit — status implemented, implemented-by with real paths, Verification populated with DoD evidence, gotchas added to the router, current state updated in context chapters, and indices regenerated. Use once the DoD is green and the delivery is ready for final PR review.
---

# CASA · close

Step 6 of the delivery cycle — §9 and §5.2 of [STANDARD](https://github.com/atplus-digital/casa-standard/blob/main/STANDARD.md) (pinned to the installed toolchain snapshot).
Prerequisite: DoD green. Findings from `casa-verify` inform human PR review — they do not block on their own.

Perform all steps in the **same commit**:

1. **Spec:** set `status: implemented`; populate `implemented-by` with real repository paths (code, migrations, tests); fill `## Verification` (`## Verificação`) with the date, exact command, and observed outcome of every DoD line. Where the environment affects the claim, name the runtime exercised and carry any remaining coverage gap into the PR.
2. **Gotchas** (non-inferable) → append concisely to `## Gotchas` in `AGENTS.md`. The router has a ~150-line cap: if exceeded, move detailed prose into a context chapter and leave a pointer in the router.
3. **Current state** that changed → update the matching `docs/context/` chapter in the Context map: imperative, timeless, pointing to the ADR rather than copying its body.
4. Run `python3 scripts/docs-check --emit-index` followed by `python3 scripts/docs-check` → 0 errors.

Part of the scope left unfinished? Do not mark `implemented`: with human agreement, either split the Spec (marking the original `deprecated`) or move the deferred slice to `## Out of scope` plus the issue tracker or `docs/BACKLOG.md` (casa-standard:ADR-0012).
