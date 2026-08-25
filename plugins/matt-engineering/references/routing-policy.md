# Routing policy

Use Matt Engineering as a conservative, intent-driven workflow. Skill selection identifies a useful process; it never grants permission for commits, tracker mutations, durable docs, subagents, worktrees, or other side effects.

## Plain-language routing

The user does not need to remember exact skill names. Match a skill only when the current intent is narrow enough:

- “Which Matt workflow fits?” → `ask-matt`
- “Challenge this design against the repo” → `grill-with-docs`
- “Turn this discussion into a spec” → `to-spec`
- “Split this plan into issues/tickets” → `to-tickets`
- “Implement this defined ticket/spec” → `implement`
- “Review uncommitted/branch/PR changes” → `code-review`
- “Diagnose this unclear, flaky, or performance bug” → `diagnosing-bugs`
- “Triage incoming issues or external PRs” → `triage`
- “Research official sources and preserve findings” → `research`
- “Make a throwaway runnable exploration” → `prototype`
- “Turn human-only dashboard or credential setup into a reviewed interactive script” → `wizard`
- “Use TDD/test-first development” → `tdd`
- “Find architecture improvement opportunities” → `improve-codebase-architecture`
- “Model or sharpen domain language” → `domain-modeling`
- “Design module shape or test seams” → `codebase-design`
- “Resolve merge/rebase conflicts” → `resolving-merge-conflicts`
- “Preserve this session for a new thread” → `handoff`

Two rare, scope-expanding entrances are explicit-only:

- Repository-wide Matt configuration → recommend explicit `setup-matt-pocock-skills`.
- A huge, foggy, multi-session destination with dependent unknowns → recommend explicit `wayfinder`.

Do not imply that ordinary natural language directly invoked those two skills. Explain why they fit and let the user select them explicitly.

## Flow selection

### Small and already clear

Route directly to `implement`, `code-review`, `tdd`, or the requested supporting discipline. Do not force a lifecycle.

### Needs clarification but fits one session

`grill-with-docs` → optional `prototype` → `to-spec` → optional `to-tickets` → `implement` → `code-review`.

Skip any phase that does not reduce uncertainty or delivery risk.

### Huge and foggy

Recommend explicit `wayfinder`. When the map becomes clear, hand off to `to-spec`, then `to-tickets`, `implement`, and `code-review`. Wayfinder maps decisions; it does not build the destination.

### Bugs

Unknown cause, unstable reproduction, or performance regression → `diagnosing-bugs`. Known cause and bounded fix → `implement` with regression evidence.

### Incoming work and codebase health

- Raw external issues or PRs → `triage`.
- Architecture health survey → `improve-codebase-architecture`, then take a selected candidate through normal clarification and delivery.

### Human-only manual procedures

Route to `wizard` only when a person must operate a third-party dashboard, authenticate, retrieve credentials, approve access, or drive a manual cutover. An implicit match permits read-only discovery and a stage proposal only. Creating or running the script, opening a browser, changing permissions, writing local configuration, mutating GitHub, editing docs, or committing requires the applicable explicit authorization.

Do not route ordinary Bash authoring, `.env.example` edits, agent-executable CLI work, application migrations, or explanation-only requests to Wizard.

## Guardrails

- Never silently expand a small request into the complete lifecycle.
- Give one primary route and, at most, one relevant optional enhancement.
- Default to the current agent; heavier abilities follow [optional-enhancements.md](optional-enhancements.md).
- `zoom-out`, `qa`, `grill-me`, `wait-what`, `to-questionnaire`, `writing-great-skills`, and its successor `writing-for-agents` are intentionally excluded.
- `teach` remains an independent external skill.
