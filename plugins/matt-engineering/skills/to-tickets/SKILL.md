---
name: to-tickets
description: Break a plan, spec, or established conversation into implementable tracer-bullet tickets with explicit blocking edges. Use when the user asks to split work into tickets, issues, or independently executable slices.
---

# To Tickets

Turn an established plan into thin, independently understandable implementation tickets. Selecting this skill does not authorize tracker or repository writes.

Read the configured issue-tracker convention in `docs/agents/issue-tracker.md` when present.

## Process

### 1. Gather source context

Read the complete referenced spec, issue, plan, comments, repository guidance, glossary, and relevant ADRs. Explore enough code to understand existing seams and integration paths. Do not reopen already-settled product decisions.

### 2. Draft tracer-bullet slices

Each normal ticket must:

- deliver a narrow but complete path through every affected layer;
- be independently demoable or verifiable;
- fit in one fresh implementation context;
- state acceptance criteria in observable terms;
- use project domain language;
- avoid speculative cleanup and horizontal “all schema,” “all API,” or “all UI” phases.

Write each acceptance criterion as one concrete observable trace. Keep mutually exclusive success, exhaustion, decline, cancellation, and other terminal paths in separate criteria; never compress them into wording that implies work continues after a terminal outcome.

Do not split tests, metrics, documentation, or other supporting work into a standalone ticket merely to create parallelism. Keep support work with the behavior it proves or observes unless it delivers an independently usable and verifiable outcome before any downstream behavior exists. A ticket with `Blocked by: None` is not independent when its own acceptance criteria require behavior introduced by another ticket; model that edge explicitly or redraw the slice.

Prefactoring that makes the change safe may be its own ticket when it has independent verification and genuinely blocks later behavior.

### 3. Model blocking edges and frontier

For every ticket, list only the tickets that must finish before it can start. Tickets with no unresolved blockers form the **frontier** and can be selected independently. Do not convert mere preference into a dependency.

### 4. Handle wide refactors

A mechanical change with a codebase-wide blast radius may use **expand–migrate–contract** instead of vertical slices:

1. expand by adding the new form alongside the old;
2. migrate callers in bounded, verifiable batches;
3. contract by deleting the old form after every migration is complete.

When individual batches cannot stay green, propose an integration branch plus a final integrate-and-verify ticket as an optional enhancement; do not create the branch automatically.

### 5. Review the decomposition

Present a numbered draft containing:

- title;
- what it delivers;
- source outcomes covered, only when the source has stable identifiers or clearly named outcomes;
- acceptance criteria;
- blocked by;
- HITL only when a human decision or manual action is genuinely required.

Also show the initial frontier and a compact dependency view. Ask whether the granularity, blocking edges, and HITL classification are correct. Revise until approved.

### 6. Confirm final bodies and publish

Render final ticket titles, bodies, labels, parent links, and dependency relationships. Show them before publishing unless the current request already authorizes those exact mutations.

- Local tracker: one file per ticket, normally `.scratch/<feature>/issues/<NN>-<slug>.md`, in dependency order.
- Real tracker: one issue per ticket, blockers first; prefer native sub-issue and blocking relationships, with a textual `Blocked by` fallback.
- Apply `ready-for-agent` only where configured.
- Pass generated tracker content as inert structured data or reviewed payload files. Never interpolate it into a shell command or unquoted heredoc.
- Never close or modify a parent issue automatically.
- Identify parallel frontier opportunities, but do not start parallel implementations or subagents without approval.

## Ticket body

```markdown
## Parent

<Reference when applicable>

## What to build

<End-to-end behavior from the user's perspective>

## Source outcomes covered

<Stable identifiers or named outcomes from the source spec. Omit this section when the source has no useful identifiers; do not invent or mechanically force user-story mappings.>

## Acceptance criteria

- [ ] Observable criterion
- [ ] Verification or failure-path criterion

## Blocked by

<Ticket references, or “None — can start immediately”>
```

Avoid volatile file paths and implementation snippets. A compact prototype-derived state machine, schema, reducer, or type shape is allowed when it preserves an established decision.
