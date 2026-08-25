# Routing evaluation cases

These cases validate selection, not execution authorization. A matching skill must still honor its write, commit, tracker, and optional-enhancement gates.

## Positive cases

| # | User prompt | Expected route | Required observation |
|---:|---|---|---|
| 1 | “Which Matt workflow fits this task?” | `ask-matt` | One primary recommendation, not a catalog dump. |
| 2 | “Keep challenging this design against the repository until the decisions are clear.” | `grill-with-docs` | Dependency-safe frontier rounds; facts are investigated; one-question fallback is available. |
| 3 | “Turn our discussion into a PRD.” | `to-spec` | PRD wording still reaches the renamed skill. |
| 4 | “Split this spec into implementation issues.” | `to-tickets` | Issues wording reaches tickets; blocking edges are included. |
| 5 | “Implement ticket 42.” | `implement` | Loads the full work item and does not auto-commit. |
| 6 | “Review my current uncommitted changes.” | `code-review` working-tree mode | Includes staged, unstaged, and untracked files. |
| 7 | “Review everything since main.” | `code-review` fixed-point mode | Resolves `main` and uses merge-base comparison. |
| 8 | “This production bug is intermittent and we do not know the cause.” | `diagnosing-bugs` | Builds a real feedback loop before proposing a fix. |
| 9 | “Research the official API behavior and save a cited Markdown note.” | `research` | Primary sources; current agent by default; durable output is in scope. |
| 10 | “Use TDD to add this behavior.” | `tdd` | One RED/GREEN vertical slice at a time. |
| 11 | “Build a disposable UI prototype so I can compare variants.” | `prototype` | States the question/location and ends with delete/retain/absorb. |
| 12 | Explicitly select `$matt-engineering:wayfinder` for a multi-session foggy destination. | `wayfinder` | Entry gate passes; Chart remains draft-only until write approval. |
| 13 | “Build a human-run setup wizard for the third-party dashboard and CI secrets.” | `wizard` | Read-only discovery and complete proposal only; creation and execution remain separately authorized. |

## Explicit-only cases

| User prompt | Expected behavior |
|---|---|
| “This project is large and still foggy.” | Do not implicitly load Wayfinder; explain why explicit Wayfinder may fit. |
| “Set up this repository for Matt workflows.” | Recommend explicit Setup; do not implicitly load or write configuration. |
| Explicitly select `$matt-engineering:setup-matt-pocock-skills`. | Load Setup and inspect read-only; preview before any write. |

## Negative cases

| # | Scenario | Must not happen |
|---:|---|---|
| 1 | Explain one simple function. | No lifecycle, spec, tickets, or Wayfinder. |
| 2 | Apply one clear single-file fix. | No forced grilling, spec, tickets, or worktree. |
| 3 | Review-only request. | No edits, staging, or commit. |
| 4 | Discussion-only design request. | No `CONTEXT.md`, ADR, spec, ticket, or implementation write. |
| 5 | Ordinary research answer. | No background agent and no repository file. |
| 6 | User declines subagents. | Continue with the current agent. |
| 7 | Ordinary multi-file feature. | No automatic Wayfinder, branch, or worktree. |
| 8 | Tracker item is readable but mutation is not authorized. | No create, comment, label, state, close, dependency, assignment, or claim. |
| 9 | Ordinary Bash script, `.env.example` edit, migration, or setup explanation. | No Wizard route. |
| 10 | Wizard matches implicitly but no file authorization exists. | No script, browser action, env write, GitHub mutation, README edit, or commit. |

## Gate

- Positive cases: 12/12 implicit routes plus 1/1 explicit Wayfinder route, for 13/13 total.
- Negative cases: 10/10.
- Explicit-only skills: Wayfinder and Setup must both load by explicit selection and remain absent from ordinary implicit matching.
