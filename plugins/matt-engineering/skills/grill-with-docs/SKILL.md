---
name: grill-with-docs
description: Challenge and sharpen a plan against repository evidence, domain language, and ADRs. Use for a dependency-safe decision interview or when assumptions must be resolved before a spec or implementation.
---

# Grill with Docs

Interrogate a plan until the user and agent share a precise, evidence-backed understanding. This is a discussion and documentation workflow, not implementation authorization.

Read [quality-baseline.md](../../references/quality-baseline.md) before claiming the discussion or resulting documentation is complete.

## Operating loop

1. Build a decision tree from the goal, constraints, unknowns, prerequisites, and consequences.
2. Classify each unresolved unknown as a **fact** or a **decision**.
3. Resolve available facts with evidence before asking the user to decide anything downstream of them.
4. Compute the **frontier**: every decision whose prerequisites are settled and which can be answered without guessing at another open answer.
5. Ask one frontier **round** of 1–4 independent questions, then wait for the user's answers.
6. Recompute the tree and frontier after each round. Continue until no material branch remains silently assumed.

Use stable numbering and this compact shape for each question:

```markdown
❓ **Q1 — <title>**

<question and, when useful, concise options>

➡️ **Recommendation:** <recommended answer and main tradeoff>
```

Ask only one question in a round when its answer will reshape most of the tree, the decision is high-risk or unusually complex, the explanation is long, or the user asks for one-question-at-a-time interaction. Never ask a question in the current round if its answer depends on another question still open in that round.

Do not overwhelm the user with the whole decision tree or mechanically fill a four-question quota. Question count follows the frontier, not a target.

## Facts versus decisions

### Fact

A fact can be established from the repository, existing documentation, runtime evidence, or an authoritative external source. Examples include current behavior, an existing interface, a schema constraint, or whether an API supports a feature.

Investigate facts directly when access is available. Report the evidence and any remaining uncertainty. Do not ask the user to decide what the code already proves. Use the current agent by default; background or parallel investigation remains an optional enhancement that requires approval.

### Decision

A decision selects among viable futures and depends on product priorities, risk tolerance, ownership, or taste. Examples include compatibility policy, whether to support a use case, or which tradeoff matters most.

Present the decision, your recommendation, and the consequence of the main alternative. The user owns the decision; do not quietly convert your preference into an established fact.

If an unknown has both parts, establish the facts first and then ask the narrower decision.

## Repository and domain awareness

Read relevant repository guidance, `CONTEXT.md`, `CONTEXT-MAP.md`, and ADRs before challenging established language or architecture.

- Challenge glossary conflicts immediately.
- Sharpen vague or overloaded terms by proposing a canonical term.
- Stress-test relationships with concrete edge cases.
- Check claims about current behavior against code or executable evidence.
- Surface contradictions rather than choosing a side silently.

Most repositories use one context:

```text
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

A root `CONTEXT-MAP.md` indicates multiple contexts and should point to context-specific glossaries and ADRs.

## Documentation boundary

Before the first repository documentation write, confirm whether the session is discussion-only or should update `CONTEXT.md` and ADRs. If the user explicitly requested those documentation updates, the confirmation is already satisfied.

When documentation is in scope:

- Create files lazily, only when there is resolved content to preserve.
- Record resolved glossary terms in the appropriate `CONTEXT.md` using [CONTEXT-FORMAT.md](CONTEXT-FORMAT.md).
- Keep implementation details, plans, and scratch notes out of `CONTEXT.md`.
- Offer an ADR only when the decision is hard to reverse, surprising without context, and the result of a real tradeoff.
- Obtain separate approval before creating each ADR, using [ADR-FORMAT.md](ADR-FORMAT.md).

When documentation is not in scope, keep proposed glossary and ADR content in the conversation.

## Completion gate

Conclude with a compact summary containing:

- confirmed facts and their evidence;
- user-owned decisions and their rationale;
- unresolved questions or risks;
- proposed next step, if any.

Ask the user to confirm that this is the shared understanding. Do not start implementation, publish a spec, create tickets, or mutate an issue tracker until the user confirms or explicitly changes the request to authorize that next action.
