# CASA — Context, ADRs, Specs, Automation

**CASA Version:** 1.11 · **Status:** accepted (2026-11-19) · **Maintainer:** atplus-digital/maicon

Engineering workflow standard designed for teams where AI coding agents (Claude Code, Cursor, Opencode, Codex, and peers) operate as first-class executors alongside humans. Design criterion: **complexity sustained by automation is cheap; complexity sustained by human discipline rots.** Everything in this standard is either enforced mechanically by a tool or costs near zero to maintain. Anything that would rely on unverified human discipline lives in Appendix A — adopted only when its symptom appears in practice.

**Promotion rule (fulfilled 2026-06-09):** the standard could only be promoted after a pilot repository passed `docs-check` cleanly — `console-platon` passed (66 migrated documents, 0 errors), and `casa-standard` itself began operating under its own rules. That principle holds for every future change: a standard contradicted by its own reference repository teaches agents to distrust every guarantee it claims.

---

## 1. Principles

1. **Causal context > current state.** Agents need to know *why* things are the way they are. Structural decisions become durable documents, and documents cross-reference one another.
2. **One fact lives in one file.** Wherever two documents touch the same subject, one points to the other — it never copies prose. Multi-file documentation without this rule becomes multi-source-of-truth, which rots faster than a single giant file.
3. **DECISION ≠ CURRENT STATE.** A decision is dated and immutable (ADR). Current state is mutable and lives in a context chapter. Mixing the two is what forces inline amendments onto accepted ADRs.
4. **Acceptance criteria are commands, not paragraphs.** Agents close their own verification loop.
5. **A clean repository tree is part of the standard.** Duplicate files and sync artifacts confuse agents — a spec glob matching both `0039-x.md` and `0039-x 2.md` can read the wrong contract. Tree hygiene is a CI gate, not good intentions.

---

## 2. Repository structure

```
AGENTS.md                  # ROUTER: cross-cutting high-ROI rules + Context map (§4)
CLAUDE.md                  # host shim: imports the router for Claude Code (ADR-0009)
docs/
  context/                 # CURRENT STATE chapters, loaded on demand (§4)
    INFRA.md  TESTS.md  CONVENTIONS.md  ...   # one topic per file
  adr/                     # DECISIONS — created when a structural decision occurs
  specs/                   # BEHAVIOR — created when a feature has an observable contract
  templates/               # official templates distributed by casa-init
  BACKLOG.md               # pending items + NNNN reservation ledger — when needed (§5)
scripts/
  docs-check               # validates router, frontmatter, causal graph, and hygiene (§8)
  pre-commit               # local gate when no CI adapter applies (§3)
<subdir>/AGENTS.md         # optional: package-scoped rules (§4)
.agents/skills/casa-*/     # T1 adopter: §9 delivery cycle as Agent Skills, tool-owned (ADR-0017)
.claude/skills/casa-*/     # identical mirror for Claude Code, which ignores .agents/ (ADR-0017)
```

`AGENTS.md` and an executable global DoD exist **always**. Every other directory or file appears only when a trigger fires.

---

## 3. Two tiers, two triggers

Every repository declares its tier in `AGENTS.md`:

- **T0 — light** (scripts, POCs, disposable tools): only `AGENTS.md` + minimal executable DoD (green build/tests).
- **T1 — standard** (everything else): this entire specification, with `docs-check` wired into an **automated gate** — CI when the git remote belongs to a host with a workflow adapter (today: GitHub); local pre-commit hook otherwise — when there is no remote or the host has no CI adapter, accompanied by a warning to wire `docs-check` into host CI (reference: `scripts/pre-commit`; decision: `casa-standard` ADR-0006). A purely documentary gate ("listed in the router's DoD") does not count: that is human discipline, not automation.

Inside T1, what to write is governed strictly by **triggers**:

| When this happens… | …write this |
|---|---|
| Structural decision (backend choice, coupling model, partial-failure strategy) | **ADR** |
| Feature with an observable contract (API, user flow, meaningful edge cases) | **Spec** |

Neither trigger fired? Write no document. Documentation without a trigger is noise.

> Grouping deliveries (epics, milestones, implementation tracking) **is not the job of a CASA document** — it belongs in pull requests, issue trackers, and commits. Cross-Spec initiatives are tracked in the issue tracker or PR, never in an umbrella CASA file.

---

## 4. Layered context

Operational context is organized by **token cost**, not arbitrary topic folders:

**Layer 1 — Router (`/AGENTS.md`, always loaded, ~150-line cap).** Cross-cutting high-ROI essentials only: CASA metadata (`casa-repo-id`, `casa-tier`, `casa-version`, `casa-standard-ref`), 5-line project summary, global DoD, local run/deploy commands, non-inferable gotchas, and the **Context map** — a table of chapters stating *when to load each one* ("touching database migrations → read `docs/context/INFRA.md`"). Once the router exceeds ~150 lines, detailed content moves down into a chapter and the router keeps only the pointer. Agent hosts that do not read `AGENTS.md` natively (today: Claude Code) reach the router via the `CLAUDE.md` **host shim** — a minimal `@AGENTS.md` file created by `casa-init` if missing and never overwritten (ADR-0009); host-specific instructions go below the import without duplicating the router.

**Layer 2 — Chapters (`docs/context/*.md`, loaded on demand).** One topic per file (`INFRA`, `TESTS`, `SECURITY`, `CONVENTIONS`…). Content is **imperative and timeless**: "run X", "NEVER call Y", "current state is Z". This is where CURRENT STATE lives — relieving ADRs of the pressure to be amended over time. Certain chapters are **recognized** by `docs-check`: declaring a pointer to them in the router activates a built-in content invariant (today only `TESTS.md` — requires at least one canonical test command; §8). The recognized set is **closed** and versioned — adding a new recognized chapter requires an ADR in `casa-standard` (ADR-0008), never ad-hoc validation rules carried by an adopter.

**Layer 3 — Nested `AGENTS.md` (`<subdir>/AGENTS.md`, native lazy loading).** Rules scoped to a single package or subtree (e.g., `supabase/AGENTS.md`). Agents load them only when touching that subtree (nearest-wins).

Two rules sustain this architecture:

- **Load-bearing technical fact (verified in Claude Code — treat subtree lazy loading in other agents as best-effort until verified):** inline `@import` **does not** save context tokens — it expands eagerly at session launch. Only nested `AGENTS.md` files below CWD are genuinely lazy. Therefore, inlining chapters via `@import` inside the router is **forbidden**; heavy composition uses pointers + on-demand reads + directory nesting. (The `CLAUDE.md` shim is the deliberate exception: importing the entire router at launch matches router semantics — ADR-0009.)
- **Anti-duplication boundary:** chapters hold imperative, timeless state; ADRs and Specs hold dated, versioned decisions and contracts. Where they overlap, the chapter points ("integration model: see ADR-0032") — it never copies the body.

---

## 5. The two document layers

```
ADR (decision, the why)  →  Spec (behavior, the what)  →  code + CI (the delivery)
```

A Spec cites the ADRs it builds on and never redefines them. Files live at `docs/<layer>/NNNN-kebab-title.md`; numbering is **local per repository and per layer**. Reserve the next `NNNN` in the PR that creates the document: `scripts/docs-reserve adr|spec "title"` computes the next number across layer files and the ledger, scaffolds the file from template, and appends a reservation row to `docs/BACKLOG.md` (ADR-0013) — preventing parallel branches from silently colliding on the same ID (`docs-check` catches duplicate IDs, but only post-merge, when renumbering cascades across `builds-on`). Unparseable lines inside the reservation section are flagged explicitly, never silently skipped; parallel worktrees surface collisions early as a **git merge conflict on the ledger table** rather than relying on external locks. Cross-repo references use `repo:ADR-0032` matching the target router's `casa-repo-id`.

### 5.1 ADR — the decision

Full MADR 4.0 structure: context and problem, decision drivers, considered options with pros/cons, decision outcome, consequences, plus **`## Confirmation`** — how to verify in practice that the decision holds (command, query, inspection). This section closes the loop for agents. Lifecycle: `proposed → accepted → deprecated | superseded`.

Immutability rules, freed from the pressure that used to break them:

- An ADR carries **only the dated decision**. Resulting current state lives in a context chapter pointing back to the ADR. When operational state evolves, edit the chapter — leave the ADR untouched.
- **Mechanical amendment-vs-supersession rule:** once an ADR is `accepted`, only its YAML frontmatter and top `CURRENT TRUTH` callout (or legacy `VERDADE ATUAL`, ADR-0019) may change — matching exactly what `--check-adr-immutability` (§8, item 6) allows through. Any edit to the body — from fixing a typo or broken link to changing scope or criteria — requires a new ADR that supersedes it. There is no inline "critical hotfix" or "cosmetic tweak".
- A superseded ADR receives a maximum 3-line callout at the very top of its body — the sole substantive edit permitted:

```
> ⚠️ CURRENT TRUTH: <what still holds; what was revoked; current source ADR>
```

`docs-check` requires this callout **outside HTML comments** (the commented template example does not count) on every `superseded` ADR, and requires `superseded-by` (scalar, non-self) to resolve to another ADR. Never invent business decisions inside ADRs: unmade product or business choices go to the issue tracker — or, in trackerless repos, to `docs/BACKLOG.md` (outside `docs/context/`: a backlog tracks pending work, not imperative state). Never turn open business questions into ADRs.

### 5.2 Spec — behavior and delivery

Flow, contract, edge cases, and executable DoD defined **before** implementation. Lifecycle: `draft → accepted → implemented → deprecated`.

- **Arrives decided:** anything undecided goes under `## Open questions` as `- [ ]` and **blocks** implementation on that point — agents never improvise over open questions.
- **Edge cases** are preferably written in stack-agnostic EARS notation: "WHEN ⟨trigger⟩, THE SYSTEM SHALL ⟨response⟩". Recommended pattern, not a syntax lock-in.
- **Executable DoD is mandatory** (§7). Without it, a Spec cannot leave `draft`.
- **Atomic closure:** when transitioning to `implemented`, in the exact same commit: `implemented-by` lists the real repository paths (code, migrations, functions, tests); `## Verification` records concrete DoD evidence (commands run + results); non-inferable gotchas are added to `AGENTS.md`; changed current state is propagated to the relevant `docs/context/` chapter; and indices are regenerated. `docs-check` enforces the Spec side of closure (`implemented-by` populated and existing, `## Verification` free of template placeholders); propagating gotchas → `AGENTS.md` and state → chapters **cannot** be mechanized and relies on human PR review — the most delicate step in the cycle.
- **Incremental delivery splits the spec — or trims scope** (ADR-0012): each shippable slice becomes its own Spec with atomic closure, or deferred work moves explicitly to `## Out of scope` plus the issue tracker/backlog. Half-implemented umbrella specs — marked `implemented` with unfinished promises — do not exist: "what counts as done" is never a matter of interpretation. When splitting an already `accepted` Spec, mark the original `deprecated` (Specs do not use `superseded-by`, §6) and cite it in the new Specs' `builds-on`.
- **UI features** (ADR-0014): structural UI decisions — design system, tokens, mandatory global states (loading/empty/error) — belong in a single repo ADR inherited via `builds-on`; feature-specific visual behavior enters as ordinary EARS edge cases ("WHEN the list is empty, THE SYSTEM SHALL render an empty-state with CTA") governed by §7 — backed by **real repository commands** (component, visual regression, or a11y tests when available; never fictional sample commands). Mockups or Figma links go into `design-ref` (§6) as a **non-normative** reference: code and snapshots win on divergence, and visual polish belongs under `## Human review`, not the automated gate.
- Cross-spec shared conventions live in `docs/context/CONVENTIONS.md` (pointed to by the router) — never inside `docs/specs/README.md`.

---

## 6. Frontmatter — minimal and derived

**`id` and `title` do not exist in frontmatter — they are derived.** `id` comes from the layer folder + filename (`docs/adr/0032-dns.md` → `ADR-0032`); `title` comes from the first `# H1` in the document body. Deterministic, impossible to drift, fewer manual fields.

```yaml
---
status: accepted             # closed per-layer vocabulary (§5)
date: 2026-06-09
builds-on: [ADR-0005]        # upstream causal references
superseded-by: null          # ADRs only; scalar; points to the replacing ADR
implemented-by: []           # Specs: real repo paths, populated on close
---
```

Frontmatter accepts only the YAML subset shown above — scalars, inline lists, and block lists (`- item`). `docs-check` **rejects with an error** any other YAML construct or duplicate key rather than silently ignoring it.

The field vocabulary is **closed**: `status`, `date`, `builds-on`, `superseded-by`, `implemented-by`, `deciders`, `design-ref`. Any field outside this vocabulary emits a **warning** — extensions are allowed when deliberate: document the custom key in a repo ADR or remove it. Phantom fields (written in Markdown but dropped from the graph) do not exist. `design-ref` (scalar; URL or relative path) points to a **non-normative** UI design reference — code and snapshots take precedence on divergence (ADR-0014); it is exported to `docs/index.json` without format enforcement.

Folder `README.md` indices (`id | title | status`) and `docs/index.json` are **generated** by `docs-check --emit-index` — never edited by hand.

---

## 7. Executable Definition of Done

Every Spec (and the repository itself, via its router) defines its DoD as executable commands with binary pass criteria:

```markdown
## Definition of Done
​```bash
npm run typecheck          # exit 0
npm test -- --run dns      # 36/36 green
deno check supabase/functions/dns/
​```
```

Every line must run in the environment documented in `AGENTS.md`; success is determined by exit code or an explicit assertion in the trailing comment. Parameterized commands (e.g., `deno check functions/<fn>/`) must either state how to enumerate the parameter or be written as a shell loop — raw placeholders without an enumeration rule are rejected. Anything requiring human judgment goes under `## Human review` so agents know the exact boundary of their automated loop.

**A Spec's DoD closes the spec's own loop, not just the repo's** (ADR-0012): every numbered edge case must have a DoD command — or a test invoked by one — that exercises it; cite the case numbers in the command comment (`npm test -- --run dns   # cases 1–4`). A Spec DoD composed solely of generic repo-wide commands (a subset of the router's global DoD) signals a Spec without dedicated verification — letting CI stay green while the contract lies. Because mapping prose edge cases to test assertions cannot be mechanized reliably, reviewers verify case↔command coverage during **human PR review**, alongside close propagation (§5.2). Applies to all new and modified Specs.

---

## 8. docs-check — what CI validates

`scripts/docs-check` runs in the automated gate of every T1 repository (§3 — CI workflow or local pre-commit hook). **Errors exit 1 by default**; `--warn-only` prints all diagnostics and exits 0, reserved strictly for the initial adoption window (§10). To preserve zero breaking changes across CASA 1.0–1.10 adopters (ADR-0019), `docs-check` accepts both canonical English structural headings/markers and their legacy Brazilian Portuguese equivalents.

1. **Router integrity**: `AGENTS.md` exists, declares non-empty scalar `casa-repo-id`, `casa-tier`, `casa-version`, and `casa-standard-ref` inside a `yaml` block, contains `## How to validate (global repo DoD)` (or legacy `## Como validar (DoD global do repo)`) with at least one executable command line, and every `docs/context/*.md` pointer — whether backticked or a Markdown link target — resolves on disk. HTML comments never count as content (ignoring template instructions), matching H1 and `CURRENT TRUTH` rules. Placeholders in the global DoD, or a global DoD matching the legacy `npm` template sample, emit **warnings**. Declaring a **recognized** chapter in the Context map triggers its built-in content invariant — today `docs/context/TESTS.md` requires at least one canonical test command in a code block; placeholder commands emit warnings (closed registry, §4; extending requires a `casa-standard` ADR). Exceeding ~150 lines emits a warning to extract chapters. Divergence between `casa-version` and the installed toolchain's `CONTRACT_VERSION` emits a **warning** in both directions — a lagging declaration prompts reading `CHANGELOG.md` and bumping deliberately; a lagging toolchain prompts running `casa-init` from a newer snapshot (ADR-0010).
2. **Valid frontmatter**: syntax restricted to the supported YAML subset (§6 — unrecognized lines and duplicate keys are errors, never ignored), required scalar fields (`status`, `date`; empty values count as missing), valid `YYYY-MM-DD` calendar dates, valid per-layer `status`, and closed field vocabulary — unknown keys emit warnings (§6).
3. **Sound derivation**: filenames match `NNNN-kebab.md`, a real `# H1` exists in the body (after frontmatter, outside HTML comments), and derived IDs are unique.
4. **Graph integrity**: `builds-on` and `superseded-by` resolve locally (cross-repo `repo:ID` references emit warnings); no self-supersession (self-referential `builds-on` emits a warning); `superseded-by` appears only on ADRs and targets an ADR; every `superseded` ADR carries a real top `CURRENT TRUTH` (or `VERDADE ATUAL`) blockquote outside HTML comments.
5. **Spec consistency**: `accepted` and `implemented` Specs have `## Definition of Done` with at least one real command and no unquoted template placeholders (quoted/backticked literals like `-t "renders <Button>"` pass; bare `<scope>` fails), and zero unchecked `- [ ]` items under `## Open questions` (or `## Questões em aberto`); `implemented` Specs additionally require non-empty `implemented-by` without placeholders resolving to existing repo paths, plus `## Verification` (or `## Verificação`) populated with real evidence rather than `(fill in on close)` / `(preencher no fechamento)`.
6. **ADR immutability (CI)**: with `--check-adr-immutability --base-ref <ref>` (in GitHub Actions: PR target branch, merge-queue base SHA, or pre-push commit — emitting a workflow warning if no comparable base commit exists, such as on initial push or force-push), compares every `accepted`, `deprecated`, or `superseded` ADR at the **merge-base** against HEAD **by derived number** — renaming files cannot hide edits. Rejects **any body change** (making no distinction between typos and semantic edits), **deletion** of immutable ADRs, and **status regression** — status only moves forward: `accepted` → `deprecated` or `superseded`, `deprecated` → `superseded`. Frontmatter edits and updates to the first top `CURRENT TRUTH` / `VERDADE ATUAL` blockquote (before the first `## ` heading) remain allowed; blockquotes elsewhere count as body. Edited callouts must stay within 3 lines; pre-existing longer callouts in the base commit are tolerated with a warning until touched.
7. **Tree hygiene**: `.orig`, `conflicted copy`, and `.DS_Store` always; numbered sync duplicates (`x 2.md`, `x copy.md`, `x (1).md`) whenever the original file exists alongside them — across the **entire repository**: in git repos, inspected over tracked + non-ignored untracked files (`.gitignore`d files cannot enter commits and never fail the gate); outside git, walked on disk. Dependency and build directories (`node_modules`, `.venv`, `vendor`, `dist`, `build`, etc.) are skipped in both modes. Locally, `pre-commit` runs `docs-check --staged`, validating the **git index** (the exact tree `git write-tree` would commit) rather than unstaged working-tree edits. Misplaced backlogs — any case variant of `backlog.md` inside `docs/context/` — emit a **warning** pointing to `docs/BACKLOG.md` (§5.1; ADR-0011).
8. **Fresh indices**: compares generated `README.md` files (and `docs/index.json`, when present) against committed copies and **fails** on drift; `scripts/docs-check --emit-index` regenerates them.

---

## 9. Lifecycle of a delivery

1. A need arises; §3 triggers determine what to write.
2. Structural decision? Draft **ADR** (`proposed`) → review → `accepted`. Resulting operational state goes into a context chapter.
3. Observable contract? Draft **Spec** citing upstream ADRs, resolving or logging open questions, and defining an executable DoD → `accepted`.
4. The agent reads the router, loads chapters indicated by the Context map, traverses the causal ADR/Spec subgraph, and implements.
5. The agent runs the DoD until green.
6. Atomic close in a single commit: Spec `implemented` + `implemented-by` + `## Verification`; gotchas → router; updated state → context chapter; indices regenerated.
7. CI runs `docs-check`. Any drift blocks merge.

In T1 repositories, `casa-init` distributes this lifecycle as portable Agent Skills (ADR-0017): `casa-explore` (step 4), `casa-propose` (steps 1–3), `casa-apply` (steps 4–5), `casa-verify` (§7/§5.2 pre-close audit), and `casa-close` (step 6). Skills point back to this specification and toolchain without inventing parallel rules; `casa-verify` is **assistive, never a gate** — the gate remains `docs-check` + executable DoD, both deterministic.

---

## 10. Governance, versioning, and adoption

The standard's contract is versioned via `casa-version` in the router and chronicled in `CHANGELOG.md`. `casa-standard-ref` records the exact toolchain snapshot copied by `casa-init`; `casa-version` records which normative contract the adopting repository promises to uphold. **That promise belongs to the repository** (ADR-0010): `casa-init` stamps it on initial creation and never modifies it afterward — bumping `casa-version` is a deliberate act performed after reading `CHANGELOG.md` and confirming compliance; `docs-check` warns whenever declaration and toolchain diverge (§8, item 1). Backward-compatible evolutions bump the minor version; breaking changes require an ADR in `casa-standard`, migration guidance in this section, and an explicit transition window for adopters. Maintained by `atplus-digital/maicon`; normative changes arrive via reviewed PRs and update this document, §8, and `scripts/docs-check` in the same PR whenever validator behavior changes.

**Infrastructure arrives via tooling, not manual checklists**: `scripts/casa-init <target>` (from `casa-standard`) installs and updates the validator, templates, router (if missing), `CLAUDE.md` host shim (if missing; ADR-0009), T1 cycle skills (ADR-0017), §3 automated gate, and — for GitHub remotes — scheduled `casa-update-check` (ADR-0016: **out-of-gate** contract drift detection maintained as a single tracker issue) across repositories in any state — empty, greenfield, or legacy. Additive and idempotent: it never touches repository content, and re-running updates the toolchain (`casa-standard-ref` tracks snapshot provenance; `casa-version` tracks the contract). Without cloning: `curl -fsSL https://raw.githubusercontent.com/atplus-digital/casa-standard/main/install.sh | sh -s -- <target>` downloads the archive into a temporary directory and runs `casa-init` (pinnable via `… | CASA_REF=<tag|sha> sh -s -- <target>` — pass `CASA_REF` to `sh`; prefixing `curl` never reaches the installer). **Greenfield** projects finish right here: born green.

**Existing repositories**: `casa-init` lays down the plumbing and `docs-check` reports remaining gaps; **content** migration requires engineering judgment and proceeds incrementally in this order: (1) **clean the tree** — remove sync duplicates first, the cheapest gate with the highest signal; (2) fill in the `AGENTS.md` router (T0 stops here); (3) confirm tier; (4) extract timeless current state into `docs/context/` chapters (e.g., moving shared spec conventions into `CONVENTIONS.md`); (5) add minimal frontmatter to legacy docs as they are touched — migrating statuses according to **verified reality** (a Spec becomes `implemented` only if its behavior is live in production), moving stray templates into `docs/templates/`, registering or removing non-standard fields (§6), and adding `CURRENT TRUTH` callouts to previously amended ADRs without rewriting history; (6) use `docs-check --warn-only` during the adoption window — dropping the flag as soon as the repo passes cleanly so the already-installed CI or hook gate takes full effect.

The standard lives in a self-contained repository (`casa-standard`) housing this specification, official templates, and the zero-dependency reference scripts. Every evolution is a PR with conversation.

---

## Appendix A — Future extensions (adopt when the symptom appears)

**A.1 Granular tiers (T2/T3).** Mandatory peer sign-off on ADRs and CI-attached compliance artifacts. Symptom: production incident or external audit that T1 would not have prevented.

**A.2 Machine-readable `docs/index.json` entrypoint.** Full causal graph consumed directly by agents. Symptom: repository exceeding ~30 docs. `docs-check --emit-index` already emits this file.

**A.3 Cross-repo causal graph resolution.** Resolving `repo:ADR-0032` against remote or federated indices. Symptom: shared architectural decisions breaking silently across repositories on rename or supersession.

**A.4 Signed releases and alternative distribution channels.** Cryptographically signed tags, published release notes, and potentially a registry package (`create-casa`). Symptom: external open-source adoption or formal supply-chain audits.

**A.5 Adopter update cadence.** Detecting **absolute** upstream lag is intentionally outside any local gate check (ADR-0010: zero network calls inside the gate). For GitHub remotes, the "external-to-gate check" half is solved: `casa-init` installs scheduled `casa-update-check` (ADR-0016, SPEC-0008), maintaining a single `casa-update` tracker issue while behind. Remaining process surface: non-GitHub hosts without an adapter, and pre-1.8 adopters that have not re-run `casa-init` — symptom: adopters ≥2 minors behind incurring costly migrations or contract drift.

---

## Package contents

- `docs/templates/AGENTS.template.md` — router template with Context map
- `docs/templates/CLAUDE.template.md` — Claude Code host shim (§4; ADR-0009)
- `docs/templates/adr.template.md` — MADR 4.0 + Confirmation + CURRENT TRUTH
- `docs/templates/spec.template.md` — Spec with executable DoD, EARS edge cases, and Verification close
- `docs/templates/context.TESTS.template.md` — recognized context chapter template (TESTS; §4/§8)
- `docs/templates/skills/casa-*/SKILL.md` — §9 delivery cycle as portable Agent Skills (ADR-0017, SPEC-0010)
- `scripts/docs-check` — validates router, frontmatter, causal graph, and hygiene; emits indices (§8)
- `scripts/docs-reserve` — reserves `NNNN` and scaffolds ADRs/Specs from templates (§5; ADR-0013, SPEC-0007)
- `scripts/test-docs-check` — validator regression suite (SPEC-0003)
- `scripts/test-docs-reserve` — reservation ledger regression suite (SPEC-0007)
- `scripts/pre-commit` — local reference gate for repos without a CI adapter (§3)
- `scripts/casa-init` — installs/updates CASA infrastructure in adopting repos (§10; tested by `scripts/test-casa-init` in CI)
- `scripts/casa-update-check` — maintains the outdated-contract tracker issue (A.5; ADR-0016, SPEC-0008; tested by `scripts/test-update-check`)
- `install.sh` — zero-clone `curl | sh` bootstrap (§10; tested by `scripts/test-install` in CI)
- `docs/templates/docs-check.workflow.yml` — GitHub Actions CI gate distributed by `casa-init`
- `docs/templates/casa-update-check.workflow.yml` — scheduled drift-check workflow (ADR-0016)
- `scripts/build-site` — compiles the bilingual static documentation site from canonical sources (ADR-0018, ADR-0019, SPEC-0011, SPEC-0012; tested by `scripts/test-site` in CI)
