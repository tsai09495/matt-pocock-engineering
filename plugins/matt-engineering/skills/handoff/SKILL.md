---
name: handoff
description: Carry essential working context to another task, directory or worktree, harness, collaborator, or mid-phase side fork in a portable Markdown handoff.
---

Write a portable handoff document only when context must travel to another task, directory or worktree, harness, collaborator, or a side task forked mid-phase. Staying in the same task is preferable while the current conversation remains useful; routine context management alone does not require a handoff.

Save the handoff to the operating system's temporary directory, not the current workspace.

Include a "suggested skills" section in the document, which suggests skills that the agent should invoke.

Do not duplicate content already captured in other artifacts (specs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.
