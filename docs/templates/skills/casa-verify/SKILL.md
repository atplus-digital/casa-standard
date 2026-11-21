---
name: casa-verify
description: Audits whether an implementation truly satisfies its CASA Spec before close — runs the DoD and docs-check and inspects what deterministic gates cannot catch — untested edge cases, tests that would still pass if the feature broke, and unpropagated gotchas or state. Use before opening a PR or marking a Spec implemented.
---

# CASA · verify

§7 and §5.2 of [STANDARD](https://github.com/atplus-digital/casa-standard/blob/main/STANDARD.md) (pinned to the installed toolchain snapshot). **This step is assistive, never a gate:** the gate is `docs-check` plus the executable DoD, both deterministic. This audit prepares human PR review; it never approves or blocks merges on its own.

1. Run the Spec's DoD and `python3 scripts/docs-check`. Record each command and its outcome.
2. Map each numbered edge case to its DoD command or test. Record the environment actually exercised, the action taken, and the observable result.
3. For each cited test, ask: **under what failure mode would this test still pass while the user-facing behavior is broken?** Look for mocks replacing the real runtime, database, or service; assertions that stop short of observable outcomes; or happy-path-only checks. State explicitly where evidence stops.
4. Close readiness (§5.2): are new gotchas and current-state updates already propagated (or queued for `casa-close`) in `AGENTS.md` and `docs/context/`? If the Spec is already closed, does `implemented-by` list only real paths?
5. Emit a per-case report: ✅ covered · ⚠️ weak (explain why) · ❌ uncovered — pairing every ⚠️/❌ with the concrete test or DoD command that would close the gap. For a parity claim, report the evidence for each target. A shared component tested in headless Chromium establishes what happened there. If the packaged desktop app was untested, identify the action and result to check there.

Do not mark the Spec `implemented` here — that belongs to `casa-close`.
