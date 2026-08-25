---
name: prototype
description: "Build an explicitly throwaway prototype after the user asks for one or agrees it is useful: one self-contained HTML file for logic/state questions, or several UI variations toggleable from one route."
---

# Prototype

A prototype is **throwaway code that answers a question**. The question decides the shape.

## Pick an artifact

Identify which question is being answered — from the user's prompt, the surrounding code, or by asking if the user is around:

- **"Does this logic / state model feel right?"** → [LOGIC.md](LOGIC.md). Build one self-contained HTML file that exposes the state, free-play controls, and guided walkthroughs for difficult cases.
- **"What should this look like?"** → [UI.md](UI.md). Generate several radically different UI variations on a single route, switchable via a URL search param and a floating bottom bar.

The two branches produce very different artifacts — getting this wrong wastes the whole prototype. If the question is genuinely ambiguous and the user isn't reachable, default to whichever branch better matches the surrounding code (a backend module → logic; a page or component → UI) and state the assumption at the top of the prototype.

## Rules that apply to both

1. **Throwaway from day one, and clearly marked as such.** Before creating files, state the intended prototype location and what question it answers; ask if the location is ambiguous. A standalone logic artifact normally belongs in the OS temp directory. Use a clearly named repository scratch location only when it must reuse project code or runtime conventions. For throwaway UI routes, obey the existing routing convention. Never create a branch or worktree automatically.
2. **One obvious way to run.** A logic prototype opens directly by double-clicking its HTML file. A project-hosted prototype uses one existing task-runner command or one shareable route. Do not add a package manager, server, or build step solely for the prototype.
3. **No persistence by default.** State lives in memory. Persistence is the thing the prototype is _checking_, not something it should depend on. If the question explicitly involves a database, hit a scratch DB or a local file with a clear "PROTOTYPE — wipe me" name.
4. **Skip the polish.** No tests, no error handling beyond what makes the prototype _runnable_, no abstractions. The point is to learn something fast and then delete it.
5. **Surface the state.** After every action (logic) or on every variant switch (UI), print or render the full relevant state so the user can see what changed.
6. **Choose the outcome when done.** Present four choices: delete the prototype, retain it temporarily with its throwaway status clear, absorb the validated decision into production work, or preserve it as explicitly approved durable evidence. Ask before deleting files, creating a branch/worktree, writing durable notes, creating an ADR/issue/commit, or modifying production code unless the current request explicitly authorizes that exact outcome.

## When done

The _answer_ is the only thing worth keeping from a prototype. Summarize the answer, evidence, and remaining uncertainty in the conversation first. If the user chooses durable capture, write it to the approved destination—a spec, ADR, issue, commit message, or prototype note—then perform only the approved cleanup or production follow-up.
