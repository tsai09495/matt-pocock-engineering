---
name: ask-matt
description: Recommend the smallest Matt Pocock Engineering flow that fits the current task. Use when the user asks which workflow to use, where to start, or whether a heavier engineering process is warranted.
---

# Ask Matt

Choose the smallest workflow that materially reduces risk or rework. Read [routing-policy.md](../../references/routing-policy.md) as the source of truth and consult [optional-enhancements.md](../../references/optional-enhancements.md) only when a heavier capability has a concrete payoff.

## Response contract

Return:

1. one primary next skill or short flow;
2. why it fits the user's present uncertainty and scope;
3. what input or authorization it needs;
4. at most one optional enhancement, only when clearly useful.

Do not dump the entire catalog. Do not run the recommended skill unless the user also asked to proceed.

## Main delivery flow

For work that needs clarification:

`grill-with-docs` → optional `prototype` → `to-spec` → optional `to-tickets` → `implement` → `code-review`

Skip unnecessary phases:

- clear, single-session work can go directly to `implement`;
- an already-defined behavior can use `tdd` directly;
- review-only requests go directly to `code-review`;
- a durable spec does not need tickets when one implementation context can hold the work.

## On-ramps

- Unknown-cause, flaky, or performance bug → `diagnosing-bugs`, then implementation and review after evidence identifies the fix.
- Raw incoming issue or external PR → `triage`; tickets produced by `to-tickets` are already shaped and should not be triaged again.
- Huge, foggy destination with dependent unknowns → recommend explicit `wayfinder`. Do not recommend it for a merely large but already clear feature.

## Supporting disciplines

- `research` for a bounded evidence question, preferably using primary sources.
- `prototype` when a runnable artifact will answer a design question better than prose.
- `domain-modeling` when project language is the problem.
- `codebase-design` when module interfaces, depth, or seams are the problem.
- `improve-codebase-architecture` for a survey of high-leverage structural opportunities.
- `resolving-merge-conflicts` for an in-progress merge or rebase.
- `handoff` only when context must travel to another task, directory or worktree, harness, collaborator, or mid-phase side fork.

## Phase boundaries

Choose what happens to context at a natural boundary between phases:

1. **Continue** when the current conversation remains useful. This preserves the conversation as the primary source and is the first option to rule out.
2. **Start fresh** when the next phase is self-contained and does not need the current reasoning. Use a new task or clean context rather than carrying irrelevant history.
3. **Handoff** when necessary context must travel to another task, directory or worktree, harness, collaborator, or a side task forked mid-phase. Portability is its specific benefit; it is not routine compaction.
4. **Optional subagent** when a task is tightly bounded, can run independently, and the user agrees to the added cost and coordination.
5. **Compaction** only when the host or user needs it and continuing would degrade the work. Do not hard-code a model-specific token threshold or assume a particular slash command exists.

Make this decision at a phase boundary. Mid-phase, prefer continuing unless an independently scoped side task has a concrete reason to split.

Repository setup is a rare precondition, not a default first step. When configuration is genuinely missing and blocks a requested workflow, explain the gap and recommend explicit `setup-matt-pocock-skills`.
