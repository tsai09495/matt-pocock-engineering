---
name: code-review
description: Review working-tree, branch, commit, or PR changes on separate Standards and Spec axes. Use for code review, uncommitted-change inspection, or checking a diff against source requirements.
---

# Code Review

Review the complete change on two independent axes:

- **Standards** — repository rules, correctness, safety, maintainability, and test quality.
- **Spec** — complete, correct, and scoped implementation of the originating request, ticket, spec, or PR.

Read [quality-baseline.md](../../references/quality-baseline.md). By default, the current agent performs the two passes sequentially and keeps their findings separate. Use independent or parallel reviewers only after following [optional-enhancements.md](../../references/optional-enhancements.md).

Review-only mode never edits files, stages changes, or commits. When this skill is called inside an authorized implementation task, the caller may fix discrete confirmed findings that remain inside the original scope and then rerun review.

## 1. Establish the review target

### Working tree

Use this when the user asks to review current, uncommitted, staged, unstaged, or untracked changes.

Inspect all of:

- `git status --short`;
- staged diff and summary;
- unstaged diff and summary;
- the full content of relevant untracked files, because ordinary `git diff` omits them.

Exclude unrelated user changes from conclusions only when their separation is evident; otherwise state the uncertainty.

### Fixed point

Use this for a branch, tag, commit, or PR. Resolve the supplied fixed point and normally compare `git diff <fixed-point>...HEAD` against the merge base. Record `git log <fixed-point>..HEAD --oneline` for intent. If the user names an exact commit range or PR diff, preserve that scope instead.

Fail clearly on an invalid reference or empty review target rather than silently choosing another baseline.

## 2. Establish evidence sources

Read applicable repository instructions such as `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, coding standards, domain glossaries, and ADRs.

Find the source requirement in this order:

1. a path, ticket, PR, or acceptance criteria supplied by the user;
2. references in commit messages or branch metadata;
3. a matching spec under configured docs, specs, or local tracker paths;
4. the user's current request.

If there is no durable spec, use the current request when it is sufficient. Otherwise report that the Spec axis is limited; do not invent requirements.

Read-only tracker retrieval is allowed when configuration and access exist. Comments, labels, and state changes are outside review scope.

## 3. Standards pass

Read the whole affected surface, not only isolated hunks. Report a finding only when it is discrete, actionable, introduced or exposed by the reviewed change, and likely worth fixing.

Check:

- correctness and edge cases;
- security, authorization, privacy, destructive behavior, and data loss;
- concurrency, migrations, compatibility, rollback, and operational failure paths;
- repository conventions and domain language;
- module depth, seam placement, interface complexity, duplication, and unnecessary generality;
- test sensitivity, missing regression coverage, implementation coupling, and tautological expected values;
- temporary instrumentation or generated artifacts.

Use Fowler smells as investigation prompts: Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man, and Refused Bequest. Repository standards override this heuristic baseline, and a smell alone is not a finding without concrete impact.

## 4. Spec pass

Trace each important requirement to the change and verification evidence. Look for:

- missing or partial requirements;
- behavior that is present but incorrect;
- unrequested scope or incompatible behavior;
- acceptance criteria not proven by tests or other fresh evidence;
- source comments or decisions contradicted by the implementation.

Do not let a clean Standards pass hide a Spec failure, or vice versa.

## 5. Report

Lead with findings in severity order. Give the tightest useful file and line range, the scenario in which it matters, and the expected correction. Avoid speculative or purely stylistic comments.

Use this shape:

```markdown
## Standards

<Findings, or “No actionable findings.”>

## Spec

<Findings, or “No actionable findings.” / limitation>

## Verification and residual risk

<What was inspected or run, plus remaining uncertainty.>
```

Keep the axes separate even when one code location affects both. Summarize counts and the highest-severity item within each axis. If there are no actionable findings, say so directly and briefly.
