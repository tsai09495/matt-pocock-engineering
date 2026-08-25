# Migrating Matt Engineering v1 to v2

Matt Engineering v2 adopts the Matt v1.1 workflow vocabulary while preserving the plugin's conservative Codex safety layer.

## Renamed skills

| v1 name | v2 name | Plain-language compatibility |
|---|---|---|
| `to-prd` | `to-spec` | Requests mentioning PRD, product requirements, or a spec route to `to-spec`. |
| `to-issues` | `to-tickets` | Requests mentioning issues, tickets, or task breakdown route to `to-tickets`. |

The old names are not retained as alias skills. Duplicate aliases would increase routing competition and skill metadata without adding capability.

## New skills

- `code-review` — separate Standards and Spec passes for working-tree, branch, commit, or PR changes.
- `research` — bounded, primary-source research with an optional durable Markdown artifact.
- `wayfinder` — explicit-only decision mapping for efforts too foggy and large for one session.

## Invocation changes

- Normal work remains reachable through plain-language intent.
- `wayfinder` and `setup-matt-pocock-skills` require explicit selection.
- Skill selection never authorizes commits, tracker writes, durable repository documentation, subagents, worktrees, or branches.

## Workflow changes

The default clarification-to-delivery path is:

```text
grill-with-docs
  → optional prototype
  → to-spec
  → optional to-tickets
  → implement
  → code-review
```

Small, already-clear requests can enter directly at the appropriate stage. Wayfinder is not a mandatory front door.

## Upgrade and rollback

1. Validate and install `matt-engineering-next` as a temporary canary.
2. Test all 18 namespaced skills in a new thread.
3. Promote to `matt-engineering` only after static, routing, behavior, and smoke gates pass.
4. If promotion blocks normal work, restore plugin source from v1 baseline commit `dc44dcc4aa17fc4d8fa48a99986b6b3d200cf5dd`, generate a new cachebuster, reinstall, and verify in a new thread.

Do not remove duplicate standalone skills during promotion; that is a separate, explicitly approved cleanup after v2 proves stable.
