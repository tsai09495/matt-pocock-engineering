---
name: setup-matt-pocock-skills
description: Configure repository-wide Matt Engineering tracker, triage, domain-doc, and Wayfinding conventions. Use only when the user explicitly selects Setup to initialize Matt workflows.
---

# Setup Matt Pocock Skills

This explicit-only, normally one-time workflow configures the repository conventions consumed by Matt Engineering. Explore first, present a complete preview, and write only after approval.

## Outputs

- an `## Agent skills` block in the repository's existing `CLAUDE.md` or `AGENTS.md`;
- `docs/agents/issue-tracker.md`;
- `docs/agents/domain.md`;
- `docs/agents/triage-labels.md` only when `triage` is available.

Do not create application code, issues, labels, Wayfinder maps, or ADRs during setup.

## 1. Explore

Read without mutation:

- repository guidance and `git remote -v` / `.git/config`;
- existing `CLAUDE.md`, `AGENTS.md`, and any `## Agent skills` block;
- `CONTEXT.md`, `CONTEXT-MAP.md`, relevant `docs/adr/`, and `docs/agents/`;
- `.scratch/` and existing tracker conventions;
- whether `triage` is available;
- genuine monorepo signals such as workspace configuration or independently structured packages.

Default to a single context. Ask about multi-context only when the repository provides real monorepo or bounded-context evidence.

## 2. Resolve configuration one section at a time

Lead each question with a recommendation and one-line consequence.

### A. Issue tracker

Recommend the tracker already used by the repository:

- GitHub when a GitHub remote and `gh` workflow exist;
- GitLab when a GitLab remote and `glab` workflow exist;
- local Markdown under `.scratch/` for local or solo work;
- another tracker when the user describes its operations.

Explain that `to-spec`, `to-tickets`, `triage`, and explicit Wayfinder need read, publish, dependency, and claim conventions. The GitHub/GitLab templates keep external PR/MR triage disabled by default.

### B. Triage labels

Skip this section when `triage` is unavailable. Otherwise recommend the canonical labels and ask one question: keep defaults?

- `needs-triage`
- `needs-info`
- `ready-for-agent`
- `ready-for-human`
- `wontfix`

Collect overrides only when the repository already uses another vocabulary.

### C. Domain docs

Use one root `CONTEXT.md` and `docs/adr/` by default without interrupting the user. Offer a root `CONTEXT-MAP.md` with context-specific documents only when exploration found genuine multi-context signals.

## 3. Preview before writing

Show the exact proposed:

- target guidance file and `## Agent skills` block;
- `docs/agents/issue-tracker.md`, including external PR/MR and Wayfinding operations;
- `docs/agents/domain.md`;
- `docs/agents/triage-labels.md`, when applicable.

Wait for approval. Explicit invocation authorizes setup discussion, not repository writes.

## 4. Write the approved configuration

Target selection:

1. edit `CLAUDE.md` when it exists;
2. otherwise edit `AGENTS.md` when it exists;
3. if neither exists, ask which one to create.

Update an existing `## Agent skills` block in place and preserve surrounding user content. Never create the other guidance file just to duplicate configuration.

Use these approved templates as starting points:

- [issue-tracker-github.md](issue-tracker-github.md)
- [issue-tracker-gitlab.md](issue-tracker-gitlab.md)
- [issue-tracker-local.md](issue-tracker-local.md)
- [triage-labels.md](triage-labels.md)
- [domain.md](domain.md)

For another tracker, document equivalent read, create, comment, label/state, close, parent/child, blocking, frontier, claim, and resolve operations. Make the authorization boundary explicit.

Suggested guidance block:

```markdown
## Agent skills

### Issue tracker

<one-line location and policy>. See `docs/agents/issue-tracker.md`.

### Triage labels

<one-line label vocabulary>. See `docs/agents/triage-labels.md`.

### Domain docs

<single-context or multi-context summary>. See `docs/agents/domain.md`.
```

Omit the triage subsection and file when triage is unavailable.

## 5. Verify and hand off

- Re-read every written file and check links.
- Summarize what was configured and which skills consume it.
- Remind the user that `docs/agents/*.md` can be edited directly; rerun setup only to change conventions or restart configuration.
- Do not proceed into another Matt workflow unless the user asks.
