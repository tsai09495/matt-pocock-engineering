# Optional enhancements

Matt Engineering is self-contained by default. Suggest a heavier capability only when it has a specific payoff. Explain the benefit and cost, wait for approval, and continue with the current agent if it is declined or unavailable.

## Worktree or dedicated branch

Suggest one when the current branch is protected or shared, unrelated changes are present, the work is long-running, or the user wants competing implementation paths.

Benefit: isolation and easier rollback. Cost: setup, branch management, and later integration. Never create one automatically.

## Independent or parallel review

Suggest an independent reviewer when the diff touches authentication, authorization, payments, migrations, concurrency, data deletion, security-sensitive paths, several architectural seams, or a subtle/flaky failure. Parallel Standards and Spec reviewers can reduce elapsed time on a large diff.

Benefit: a fresh context may catch blind spots. Cost: extra tokens, latency, and reconciliation. The current agent's two-axis review remains mandatory and sufficient by default.

## Background or parallel research

Suggest background research when a bounded question requires substantial reading and the user can productively continue other work. In Wayfinder, independent research tickets may be offered when they do not share unresolved assumptions.

Benefit: less elapsed time and a fresh evidence pass. Cost: more context, coordination, and the risk of duplicated or diverging conclusions. Default to research in the current agent.

## Prototype isolation

Suggest a throwaway branch or worktree when a prototype would otherwise mix extensive generated or experimental code with valuable work.

Benefit: easy deletion and clean comparison. Cost: extra branch/worktree management. A small prototype can stay in a clearly named local scratch location with the user's agreement.

## Per-ticket fresh context

Suggest a new thread—and, when code isolation is useful, a worktree—for independently implementable tickets or work that spans several sessions.

Benefit: focused context and less cross-ticket contamination. Cost: handoff overhead and duplicated repository orientation. Use the existing thread for small, tightly coupled slices.

## Detailed plan or Wayfinder

Suggest a detailed execution plan when dependencies make ordering important. Suggest explicit Wayfinder only when the destination contains multiple dependent unknowns and cannot be held reliably in one session.

Benefit: visible dependencies and durable progress. Cost: planning overhead and tracker noise. A large but already clear feature normally needs `to-spec` or `to-tickets`, not Wayfinder.

## Branch finishing menu

Offer commit, push, pull request, merge, or leave-local choices when implementation is complete and multiple end states are plausible. Do not infer authorization from completion alone.
