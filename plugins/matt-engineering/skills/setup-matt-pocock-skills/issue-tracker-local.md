# Issue tracker: Local Markdown

Specs and tickets for this repo live as Markdown files in `.scratch/`.

Read operations may run during exploration. Mutating operations such as creating files, appending comments, or changing triage status require the calling skill's approval step first.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## Wayfinding operations

Wayfinder is explicit-only. Draft and obtain authorization before any operation below.

- **Map:** `.scratch/<effort>/map.md`, containing Notes, Decisions so far, and Fog.
- **Child:** `.scratch/<effort>/issues/<NN>-<slug>.md` with `Type: research|prototype|grilling|task` and `Status: open|claimed|resolved`.
- **Blocking:** `Blocked by: <NN>, <NN>`; a child is unblocked when each referenced file is resolved.
- **Frontier:** open, unclaimed files with no unresolved blockers, in numeric order.
- **Claim:** change `Status` to `claimed`; this is the session's first file write and requires authorization.
- **Resolve:** append an `## Answer`, mark the file resolved, and add a durable context pointer to the map.
