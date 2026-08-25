---
name: to-spec
description: Turn established context into a durable spec draft. Use to document an already-discussed feature, synthesize requirements, or publish a reviewed spec. Always call the artifact a spec, even when the user says PRD.
---

# To Spec

Synthesize what is already known into a buildable specification. Do not restart grilling or invent missing product decisions.

Treat legacy user wording such as “PRD” or “requirements document” as an entrance to this workflow, not as the formal artifact name. Unless the repository explicitly mandates different terminology, call the work in progress, draft, headings, destination preview, and published artifact a **spec**; do not say you are drafting or publishing a PRD in progress narration, and do not title the output “PRD.”

The issue-tracker convention may be configured in `docs/agents/issue-tracker.md`. Read it when present. Selecting this skill does not authorize publishing.

## Process

1. Gather the current conversation, referenced plans or tickets, repository instructions, relevant domain glossary, ADRs, and code facts.
2. Separate confirmed decisions from unresolved items. If an unresolved item would materially change the spec, ask one narrow question or mark it clearly; do not silently choose.
3. Identify the highest practical seams for verifying the feature. Prefer established public seams. Ask for confirmation only when a new, ambiguous, or expensive seam is proposed.
4. Draft the spec using the structure below.
5. Show the complete draft and summarize unresolved risks.
6. Publish to the configured tracker or write a repository file only after the user approves the draft or explicitly requested that exact write in the current request.

The spec should be complete enough to cover important behavior, boundaries, failure paths, and verification without mechanically generating a long list of low-value stories.

## Spec template

### Problem

Describe the user's problem, current limitation, and why it matters.

### Solution

Describe the intended behavior from the user's perspective and the boundaries of the solution.

### User stories or behavioral outcomes

Include only distinct outcomes that clarify behavior. Use “As a … I want … so that …” when it improves precision; do not force every technical constraint into a story.

### Implementation decisions

Record established module, interface, schema, API, compatibility, failure-handling, and interaction decisions. Avoid brittle file paths or large code listings. A short prototype-derived state machine, schema, reducer, or type shape may be included when it communicates a decision more precisely than prose.

### Testing decisions

Identify observable behaviors, test seams, relevant prior art, failure paths, and any manual verification. Tests should exercise behavior through public interfaces rather than implementation trivia.

### Out of scope

State nearby behavior that this effort deliberately excludes.

### Open questions and risks

List unresolved facts, user decisions, migration risks, or validation gaps. Omit this section only when none remain.

### Further notes

Include source links, prototypes, ADR references, rollout constraints, or other durable context.

## Publishing

- For a real tracker, create one spec issue and apply `ready-for-agent` only if the configured workflow calls for it.
- For a local tracker, use its configured spec path.
- Show the exact title, body, labels, and destination before publishing unless the current request already authorizes them.
- Pass generated tracker content as inert structured data or a reviewed payload file. Never interpolate it into a shell command or unquoted heredoc.
- Do not close or modify a parent issue unless explicitly requested.
