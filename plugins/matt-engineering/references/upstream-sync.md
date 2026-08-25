# Upstream synchronization ledger

This plugin selectively adapts Matt Pocock's engineering skills instead of mirroring them verbatim.

## Locked sources

- Repository: `mattpocock/skills`
- Source tree: `skills/engineering`
- Previous release baseline: `v1.1.0` at `0ac3f3fbf1c35b913ae1b7f5fcd303a4fb2e2dba`
- Current release baseline: `v1.2.0` at `2ffb184ffbb752faa664c0b204f3c9241b1428e9`
- Reviewed post-release source snapshot: `84fdeffd12f2ee307994d1eb6feb48173b6e0502`
- Local product line: Matt Pocock Engineering v2.2

The release tag defines the published semantic baseline. The reviewed post-release commit supplies the exact Engineering source templates used by this iteration. Future synchronization work must compare from these fixed commits before considering a newer `main`; never overwrite local safety rules simply because upstream changed.

## Status vocabulary

- **adapted** — upstream semantics are used, with Codex-specific routing or safety changes.
- **synced** — the local copy follows the locked upstream behavior with only naming or link adjustments.
- **local-only** — maintained by this plugin and not sourced from upstream engineering.
- **reviewed-excluded** — evaluated from the release or adjacent upstream collection but intentionally kept outside this plugin.

## Skill ledger

| Skill | Status | Upstream source | Local invariants |
|---|---|---|---|
| `ask-matt` | adapted | `ask-matt/` | Plain-language routing; one primary recommendation; no catalog dump or automatic workflow expansion. |
| `code-review` | adapted | `code-review/` | Current agent performs two review passes by default; review-only never edits; independent reviewers are opt-in. |
| `codebase-design` | adapted | `codebase-design/` | Shared deep-module vocabulary; parallel interface design requires approval. |
| `diagnosing-bugs` | adapted | `diagnosing-bugs/` | Build a real feedback loop before theorizing; use fresh evidence before claiming a fix; redact credential-bearing evidence and never echo login tokens through capture helpers. |
| `domain-modeling` | adapted | `domain-modeling/` | First durable documentation write and every ADR require user intent or confirmation. |
| `grill-with-docs` | adapted | `grill-with-docs/` | Self-contained, dependency-safe frontier rounds of one to four questions; one-question fallback remains available; do not implement before shared-understanding confirmation. |
| `handoff` | local-only | — | Reserved for portable context transfer across tasks, worktrees, harnesses, or collaborators—not routine context management. |
| `implement` | adapted | `implement/` | No automatic commit; unknown-cause bugs route through diagnosis; use the local quality and review baseline. |
| `improve-codebase-architecture` | adapted | `improve-codebase-architecture/` | User-named scope first; otherwise use recent Git hotspots with a no-Git fallback; single-agent exploration by default. |
| `prototype` | adapted | `prototype/` | Logic prototypes are self-contained HTML with no CDN/build/server; UI variants remain supported; no automatic durable capture or cleanup. |
| `research` | adapted | `research/` | Current agent and primary sources by default; background agents are optional; durable output only when requested or needed. |
| `resolving-merge-conflicts` | adapted | `resolving-merge-conflicts/` | Resolve by intent; staging, continuation, finishing, and commits remain authorization-sensitive. |
| `setup-matt-pocock-skills` | adapted | `setup-matt-pocock-skills/` | Explicit-only; preview all repository configuration before writing; no obsolete `qa` references. |
| `tdd` | adapted | `tdd/` | Hard RED/GREEN loop; one vertical slice at a time; micro-refactor only while GREEN; reject tautological tests. |
| `to-spec` | adapted | `to-spec/` | Synthesize existing context; complete but not mechanically long; show the draft before publishing. |
| `to-tickets` | adapted | `to-tickets/` | Model blocking edges and frontier; show final bodies before publishing; parallel implementation remains opt-in. |
| `triage` | adapted | `triage/` | Read-only discovery is allowed; exact comments, labels, state, closure, and file writes require authorization. |
| `wayfinder` | adapted | `wayfinder/` | Explicit-only; draft map and tickets first; tracker writes, claims, and parallel research require authorization. |
| `wizard` | adapted | `wizard/` from reviewed `main` | Narrow implicit discovery is proposal-only; script creation and execution are separate approvals; secret values are never discovered or exposed; every mutation has an exact target and confirmation. |

## Reviewed exclusions

| Capability | Status | Reason |
|---|---|---|
| `wait-what` | reviewed-excluded | Corrects one message rather than strengthening the engineering workflow; the user can request a plain-language restatement directly. |
| `to-questionnaire` | reviewed-excluded | Cross-person productivity workflow with default document writes; outside the conservative Engineering routing boundary. |
| `writing-for-agents` | reviewed-excluded | Broad model-invoked routing overlaps Codex system skill/plugin authoring capabilities. Non-routing writing principles may still inform maintenance. |

## Safety clauses that synchronization must preserve

1. Selecting a skill is not authorization for a side effect.
2. Do not commit, push, merge, publish, mutate a tracker, or create persistent repository docs unless the current request authorizes it or the skill obtains confirmation.
3. Do not start subagents, background research, worktrees, or throwaway branches by default.
4. Do not silently expand a small request into the full Matt lifecycle.
5. `wayfinder` and `setup-matt-pocock-skills` remain explicit-only.
6. `zoom-out`, `qa`, `grill-me`, `wait-what`, `to-questionnaire`, and `writing-for-agents` remain excluded; `teach` remains external.
7. `handoff` remains local and independent from the upstream taxonomy.
8. Wizard implicit discovery is proposal-only. Creating or executing its script, opening a browser, reading secret values, writing local configuration, and mutating GitHub each remain authorization-sensitive.

## Synchronization checklist

For each upstream refresh:

1. Record the old and new upstream commits.
2. Diff each source skill independently.
3. Classify each upstream change as semantic improvement, formatting, routing policy, or side-effect policy.
4. Adopt semantic improvements selectively.
5. Reapply every local invariant above.
6. Run static, routing, behavior, and new-thread smoke tests before promotion.
