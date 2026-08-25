---
name: improve-codebase-architecture
description: Find high-leverage deepening opportunities in a codebase. Use for architecture health, refactoring candidates, tightly coupled modules, testability, or AI navigability.
---

# Improve Codebase Architecture

Surface architectural friction and propose **deepening opportunities** — refactors that turn shallow modules into deep ones. The aim is testability and AI-navigability.

## Glossary

Use these terms exactly in every suggestion. Consistent language is the point — don't drift into "component," "service," "API," or "boundary." Full definitions in [LANGUAGE.md](LANGUAGE.md).

- **Module** — anything with an interface and an implementation (function, class, package, slice).
- **Interface** — everything a caller must know to use the module: types, invariants, error modes, ordering, config. Not just the type signature.
- **Implementation** — the code inside.
- **Depth** — leverage at the interface: a lot of behaviour behind a small interface. **Deep** = high leverage. **Shallow** = interface nearly as complex as the implementation.
- **Seam** — where an interface lives; a place behaviour can be altered without editing in place. (Use this, not "boundary.")
- **Adapter** — a concrete thing satisfying an interface at a seam.
- **Leverage** — what callers get from depth.
- **Locality** — what maintainers get from depth: change, bugs, knowledge concentrated in one place.

Key principles (see [LANGUAGE.md](LANGUAGE.md) for the full list):

- **Deletion test**: imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.
- **The interface is the test surface.**
- **One adapter = hypothetical seam. Two adapters = real seam.**

This skill is _informed_ by the project's domain model. The domain language gives names to good seams; ADRs record decisions the skill should not re-litigate.

## Process

### 1. Explore

Scope the scan before reading broadly. Deepening pays off where future changes will cash in the leverage:

- If the user names a module, subsystem, or pain point, use that as the primary scope.
- Otherwise, in a Git repository, inspect a recent stretch of commit history and the paths it repeatedly changes. Start with those active areas. Treat roughly 20 commits as an initial observation window, not a fixed rule; widen or narrow it for the repository's activity.
- If recent changes are scattered, history is too short, or the directory is not a Git repository, scope from the current task, executable entry points, test friction, and repository guidance instead.
- State why the selected paths deserve attention and which areas were not surveyed. Do not present an unscanned repository as a complete architecture audit.

Read the project's domain glossary and any ADRs in the selected area first.

Then walk the codebase. For a small or medium codebase, explore directly. For a large or unfamiliar codebase, you may suggest an explorer subagent as an optional enhancement; use it only when the environment supports it and the user agrees. Don't follow rigid heuristics — explore organically and note where you experience friction:

- Where does understanding one concept require bouncing between many small modules?
- Where are modules **shallow** — interface nearly as complex as the implementation?
- Where have pure functions been extracted just for testability, but the real bugs hide in how they're called (no **locality**)?
- Where do tightly-coupled modules leak across their seams?
- Which parts of the codebase are untested, or hard to test through their current interface?

Apply the **deletion test** to anything you suspect is shallow: would deleting it concentrate complexity, or just move it? A "yes, concentrates" is the signal you want.

### 2. Present candidates as an HTML report

Write a self-contained HTML file to the OS temp directory so nothing lands in the repo. Resolve the temp dir from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows), and write to `<tmpdir>/architecture-review-<timestamp>.html` so each run gets a fresh file. If the environment permits opening local files, open it for the user — `xdg-open <path>` on Linux, `open <path>` on macOS, `start <path>` on Windows. Otherwise, tell them the absolute path and do not block on opening it.

The report is fully offline: inline CSS plus inert HTML only, with a restrictive CSP and no scripts, remote assets, event handlers, forms, or network requests. HTML-escape every repository-derived value. Use escaped text maps and hand-built HTML/CSS boxes for graphs, sequences, mass diagrams, and cross-sections. Each candidate gets a **before/after visualisation**. Be visual.

For each candidate, the same template as before, but rendered as a card:

- **Files** — which files/modules are involved
- **Problem** — why the current architecture is causing friction
- **Solution** — plain English description of what would change
- **Benefits** — explained in terms of locality and leverage, and how tests would improve
- **Before / After diagram** — side-by-side, custom-drawn, illustrating the shallowness and the deepening
- **Recommendation strength** — one of `Strong`, `Worth exploring`, `Speculative`, rendered as a badge

End the report with a **Top recommendation** section: which candidate you'd tackle first and why.

**Use CONTEXT.md vocabulary for the domain, and [LANGUAGE.md](LANGUAGE.md) vocabulary for the architecture.** If `CONTEXT.md` defines "Order," talk about "the Order intake module" — not "the FooBarHandler," and not "the Order service."

**ADR conflicts**: if a candidate contradicts an existing ADR, only surface it when the friction is real enough to warrant revisiting the ADR. Mark it clearly in the card (e.g. a warning callout: _"contradicts ADR-0007 — but worth reopening because…"_). Don't list every theoretical refactor an ADR forbids.

See [HTML-REPORT.md](HTML-REPORT.md) for the full HTML scaffold, diagram patterns, and styling guidance.

Do NOT propose interfaces yet. After the file is written, ask the user: "Which of these would you like to explore?"

### 3. Grilling loop

Once the user picks a candidate, drop into a grilling conversation. Walk the design tree with them — constraints, dependencies, the shape of the deepened module, what sits behind the seam, what tests survive.

Side effects happen inline as decisions crystallize:

- **Before the first repository docs write**, confirm whether this architecture session should update `CONTEXT.md` and ADR files or stay discussion-only. If the user explicitly asked to update docs, that confirmation is already satisfied.
- **Naming a deepened module after a concept not in `CONTEXT.md`?** If docs updates are in scope, add the term to `CONTEXT.md` — same discipline as `/grill-with-docs` (see [CONTEXT-FORMAT.md](../grill-with-docs/CONTEXT-FORMAT.md)). Create the file lazily if it doesn't exist. Otherwise, keep a proposed glossary patch in the conversation.
- **Sharpening a fuzzy term during the conversation?** If docs updates are in scope, update `CONTEXT.md` right there.
- **User rejects the candidate with a load-bearing reason?** Offer an ADR, framed as: _"Want me to record this as an ADR so future architecture reviews don't re-suggest it?"_ Only offer when the reason would actually be needed by a future explorer to avoid re-suggesting the same thing — skip ephemeral reasons ("not worth it right now") and self-evident ones. See [ADR-FORMAT.md](../grill-with-docs/ADR-FORMAT.md).
- **Want to explore alternative interfaces for the deepened module?** See [INTERFACE-DESIGN.md](INTERFACE-DESIGN.md).
