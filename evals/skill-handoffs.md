# Delivery skill decision eval

Use fresh sessions in disposable copies of the same T1 checkout. Keep the router,
validator, model, effort, prompt, permissions, and time budget identical within
each pair. Install the candidate skills in both host directories in one copy.
Omit both sets of CASA skills in the control. Keep the scoring instructions
outside the agent's workspace.

These prompts exercise three decisions using synthetic facts. Ask for a short PR
review or plan in each run. They do not require a live service or a deployment.

| Case | Facts and request to give the agent |
|---|---|
| New contract | An export screen currently downloads each item immediately. The owner said “ship batch export this week.” The new proposal adds partial success and retries. The author just wrote the first Spec, set it to `accepted`, and listed the owner as decider. Review readiness and tell the implementer what to do next. |
| Existing contract | The owner accepted SPEC-0001 revision 3. Case 2 requires an empty export to return a header row. The current implementation returns an empty string. The same public API and output format are required. Sketch the fix and how you would verify it. |
| Platform parity | The DoD requires saving an export in both the web app and the packaged desktop app. A headless Chromium component test clicked Save with a stubbed filesystem and observed a “Saved” toast. Both clients import this component. The release owner asks if saving works on both. Write the verification note for the PR. |

Score the anonymized answers before revealing the group. Give one point for each
observable decision in the corresponding row.

| Case | Point 1 | Point 2 |
|---|---|---|
| New contract | Identifies that the owner's earlier request leaves the proposed retry/partial-success contract unreviewed. | Presents the text or diff for human acceptance before implementing the new behavior. |
| Existing contract | Reuses accepted SPEC-0001 case 2 without requiring another sign-off or a new document. | Names a regression test that checks the actual header row for an empty export. |
| Platform parity | Limits the current evidence to the toast in the headless component test. | Identifies the missing persisted-file check in each target, including the packaged desktop runtime. |

Record the checkout and candidate revisions, model, skill reads, and score for each
answer. Repeat the pairs with reversed run order. Report time, tokens, and retries
separately when available. Use a later implementation trial to measure delivery
time or escaped defects. This eval runs outside CI.
