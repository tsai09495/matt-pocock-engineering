---
name: wayfinder
description: Map a huge, foggy engineering effort into durable decision tickets. Use only when the user explicitly selects Wayfinder for a multi-session destination with dependent unknowns.
---

# Wayfinder

Wayfinder pushes back the fog around a destination by resolving decisions, not by building deliverables. It is explicit-only because it creates a heavier, durable cross-session workflow.

Read:

- [routing-policy.md](../../references/routing-policy.md) for entry and exit routing;
- [quality-baseline.md](../../references/quality-baseline.md) for side-effect boundaries;
- the configured `docs/agents/issue-tracker.md` for tracker-specific map, dependency, frontier, claim, and resolve operations.

Use the current agent by default. Parallel research and ticket workers follow [optional-enhancements.md](../../references/optional-enhancements.md).

## Entry gate

Wayfinder fits only when all or most are true:

- the destination cannot be planned reliably within one agent session;
- several unknowns depend on one another;
- the work is greenfield, a huge feature, or long-range restructuring;
- ordinary grilling would consume the context before a buildable spec emerged;
- a durable map is needed across sessions or participants.

### No-fog early exit

Exit before creating a map when the destination is already clear enough to specify or split. Recommend:

- `grill-with-docs` for a manageable set of decisions;
- `to-spec` for an already-understood destination;
- `to-tickets` for an already-approved plan;
- `implement` for one bounded work item.

Being large is not enough. Wayfinder requires decision fog.

## Core model

- **Destination** — the outcome the user wants, described without pretending the route is known.
- **Map** — a durable index of destination, notes, decisions so far, fog, ticket links, and current frontier.
- **Fog** — important unknowns or decisions that prevent a trustworthy specification.
- **Decision ticket** — one bounded question whose answer removes fog. It produces an answer, not a product feature.
- **Blocking edge** — another ticket whose answer is required first.
- **Frontier** — open, unclaimed tickets whose blockers are resolved.

The map is an index, not a giant document. Put detailed evidence and conclusions in ticket answers or durable linked artifacts.

Refer to maps and tickets by their human-readable names in narration and summaries. Keep an ID or URL inside the named link instead of presenting walls of bare issue numbers.

## Ticket types

- **Research** — establish an external or repository fact from evidence. Resolve it with the current agent by default; parallel research or a `research/*` branch is an optional enhancement that requires approval.
- **Prototype** — build a throwaway artifact that answers a concrete design question.
- **Grilling** — obtain a user-owned product, policy, or tradeoff decision.
- **Task** — perform bounded non-product work needed to expose the next decision, such as inventorying a migration surface.

Do not disguise implementation deliverables as decision tickets. Once fog is gone, leave Wayfinder and write the spec.

## Chart phase

### 1. Establish the destination

Capture:

- desired outcome;
- success indicators;
- known constraints;
- explicit out of scope;
- why the effort exceeds one reliable session.

Do not force premature implementation detail.

### 2. Explore the terrain

Read repository guidance, domain docs, ADRs, relevant code, existing plans, and tracker configuration. Resolve cheap code facts directly. Ask the user only for decisions that evidence cannot answer.

### 3. Identify fog

List unknowns that materially block the route. For each, state:

- why the answer matters;
- ticket type;
- expected evidence or decision owner;
- blockers;
- what downstream choice it unlocks.

Merge duplicates and remove questions that do not change the route.

### 4. Draft the map and tickets

Prepare the complete map, child ticket bodies, labels/status, parent/child links, blocking edges, and proposed initial frontier in conversation first.

Use this map shape:

```markdown
# Wayfinder map: <destination>

## Destination
## Success indicators
## Constraints
## Out of scope
## Notes
## Decisions so far
## Fog
## Tickets and blocking edges
## Current frontier
## Exit condition
```

Each ticket should contain:

```markdown
## Question
## Why it matters
## Type
## Evidence or decision owner
## Blocked by
## Answer shape
## Unlocks
```

### 5. Authorization gate

Show the exact tracker or local-file writes and wait for approval unless the current request explicitly authorized those exact writes. Explicitly selecting Wayfinder does not by itself authorize issue creation, labels, dependencies, assignments, comments, closure, or `.scratch/` files.

After approval, create blockers before dependents, establish parent/child and blocking relationships, then re-read the resulting map to verify links and frontier.

## Work phase

One session normally resolves one frontier ticket.

### 1. Load without writing

Read the map, relevant decisions, ticket body, blockers, and linked artifacts. Recompute whether the ticket is actually open and unblocked.

### 2. Claim boundary

Claiming by assignment or file status is the session's first external or repository write. Perform it only when the user's current request authorizes working that ticket or after confirmation. Never claim several tickets preemptively.

### 3. Resolve the question

Use the ticket's mode:

- research with primary evidence;
- prototype with explicit throwaway location and cleanup choice;
- grilling one dependency-safe frontier round at a time;
- bounded task with fresh verification.

Do not build the destination. If resolving the ticket reveals new fog, draft amendments and obtain authorization before creating new tickets or dependencies.

### 4. Record and close

Present the proposed answer, map update, comments, status/closure, and any new edges. After authorization:

- preserve the decision and evidence in the ticket or linked artifact;
- update the map's Decisions so far and Fog index;
- resolve/close the ticket;
- recompute the frontier.

Stop after the ticket unless the user explicitly asks to continue.

## Exit from Wayfinder

The map is clear when remaining work is implementation detail rather than dependent product or architecture decisions. Produce a handoff summary containing destination, decisions, constraints, unresolved non-blocking risks, and sources.

Then route:

`to-spec` → optional `to-tickets` → `implement` → `code-review`

Do not jump directly from a large decision map into implementation unless the effort genuinely collapsed into one small, fully specified work item.

## Invariants

- No automatic tracker or local-file writes.
- No automatic subagents, background research, worktrees, or branches.
- No implementation of the destination inside Wayfinder.
- No more than one claimed ticket by default.
- No stale frontier: recompute after every resolved or added edge.
- No invented user decisions; facts come from evidence, decisions from the owner.
