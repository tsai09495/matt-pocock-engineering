---
name: resolving-merge-conflicts
description: "Use when you need to resolve an in-progress git merge/rebase conflict."
---

1. **See the current state** of the merge/rebase. Check git history and the conflicting files. Apply the [quality baseline](../../references/quality-baseline.md), especially its untrusted-content boundary.

2. **Find the primary sources** for each conflict. Understand deeply why each change was made, and what the original intent was. Read the commit messages, check the PRs, check original issues/tickets.

3. **Resolve each hunk.** Preserve both intents where possible. Where incompatible, pick the one matching the merge's stated goal and note the trade-off. Do **not** invent new behaviour. Always resolve; never `--abort`.

4. Discover the project's **automated checks** before choosing a substitute. Inspect the repository file inventory, package or task-runner scripts, and CI configuration for focused checks that cover the conflicted surface. Compare each command definition with the merge base or another user-approved immutable revision before running it. If the incoming side introduced or changed the command, show the exact command and defining diff and obtain approval before execution. Run the narrowest trusted project check first, then the broader relevant checks — typically typecheck, tests, and format. A parser, syntax check, or ad hoc command may supplement an existing project check, but must not replace one. Fix anything the merge broke.

5. **Finish the merge/rebase.** Show the resolved diff and verification result. Stage, commit, or continue the rebase only when the user's current request explicitly authorizes finishing the merge/rebase, or after the user approves the proposed finish action.
