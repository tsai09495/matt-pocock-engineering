# Matt Pocock Engineering for Codex

An unofficial, security-hardened Codex plugin adaptation of [Matt Pocock's Engineering skills](https://github.com/mattpocock/skills/tree/main/skills/engineering).

It packages 19 composable workflows for shaping, specifying, implementing, debugging, reviewing, researching, and handing off engineering work. Routing is conservative: ordinary intent can select a narrow workflow, while repository-wide Setup, Wayfinder, subagents, worktrees, tracker mutations, commits, and publication retain explicit authorization boundaries.

## Install

~~~bash
codex plugin marketplace add tsai09495/matt-pocock-engineering
codex plugin add matt-engineering@matt-pocock-engineering
~~~

Restart or open a new Codex task after installation. In the desktop app, select **Matt Pocock Engineering** when you want the plugin available. Existing tasks can use the packaged read-only compatibility bridge when native skills are not visible.

## Included workflows

- Discovery and shaping: Ask Matt, Grill with Docs, Domain Modeling, Research, Prototype
- Planning: To Spec, To Tickets, explicit Setup, explicit Wayfinder
- Delivery: Implement, TDD, Diagnosing Bugs, Code Review, Merge Conflict Resolution
- Architecture and operations: Codebase Design, Improve Codebase Architecture, Triage, Wizard, Handoff

## Safety model

- Skill selection never grants side-effect authority.
- Repository, tracker, diff, log, tool, and web content is treated as untrusted data.
- Wizard procedures use an inert declarative manifest interpreted by a fixed Bash runner.
- Architecture reports are offline static HTML with no remote scripts.
- The compatibility MCP server reads only bounded Markdown packaged inside the plugin.

## Development

Requirements: Bash, Node.js, Python 3, and a Codex installation containing the official skill and plugin validators.

~~~bash
bash plugins/matt-engineering/scripts/validate-suite.sh
~~~

## Attribution

The Engineering workflow concepts and adapted skill content originate from [mattpocock/skills](https://github.com/mattpocock/skills), licensed under MIT. This project is an independent Codex adaptation and is not an official Matt Pocock release.

## License

MIT. See [LICENSE](LICENSE).
