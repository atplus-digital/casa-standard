<!-- RECOGNIZED context chapter in CASA (STANDARD §4/§8).
     Copy to docs/context/TESTS.md and add a pointer in AGENTS.md's Context map:
       | `docs/context/TESTS.md` | when touching tests, DoD, bugfixes, or critical behavior |
     Content is IMPERATIVE and TIMELESS ("run X", "NEVER Y", "current state is Z").
     When this chapter is DECLARED in the router, docs-check requires at least ONE canonical
     command inside a fenced code block — list the repo's real command, not prose. Shared
     testing conventions POINT to an ADR/Spec when one exists rather than copying its body (§4). -->

# Tests

## Canonical commands
<!-- The command(s) that run the suite. Required by docs-check when declared. -->

```bash
npm test                 # replace with the repo's real command (pytest -q, deno test, …)
```

## Test types used in this repo
<!-- Which layers exist (unit/integration/e2e) and what each covers. Omit unused ones. -->

## Where to add new tests
<!-- Directory and naming convention per test type (e.g., `tests/unit/<module>.test.ts`). -->

## How to test a bugfix
<!-- Rule: reproduce the bug in a regression test BEFORE applying the fix. Where/how. -->

## What counts as a regression
<!-- When a new test is mandatory vs. optional. -->

## What NOT to test
<!-- Boundaries: what is too brittle or costly and intentionally left out. -->
