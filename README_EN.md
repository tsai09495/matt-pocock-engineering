# Matt Pocock Engineering for Codex

[中文](./README.md) · [English](./README_EN.md)

> A Codex plugin that turns complex software-engineering work into composable workflows that can be applied one stage at a time.

## What it is

<img src="plugins/matt-engineering/assets/readme-banner.jpg" alt="Matt Pocock Engineering">

Matt Pocock Engineering is an engineering-workflow plugin for Codex, adapted from [Matt Pocock's Engineering skills](https://github.com/mattpocock/skills/tree/main/skills/engineering).

It is not a single “mega prompt” that tries to do everything. It separates software engineering into 19 focused workflows for shaping ideas, modeling domains, researching questions, testing prototypes, producing specs, slicing tickets, implementing changes, testing, diagnosing, reviewing, improving architecture, triaging work, and handing context off. The user describes the current goal; the plugin selects or recommends the workflow that best matches the current stage.

The combination works for both greenfield projects and existing codebases or tasks already in progress.

## Quick Start

Requirement: a Codex CLI or Codex desktop version with plugin support.

```bash
codex plugin marketplace add tsai09495/matt-pocock-engineering
codex plugin add matt-engineering@matt-pocock-engineering
```

Restart Codex or open a new task after installation. In the desktop app, select **Matt Pocock Engineering**, then describe the goal directly:

```text
Review this project's code structure and find the highest-leverage improvement.
```

For all 19 skills, including when to use them, outputs, boundaries, workflow combinations, and copyable examples, see the [complete capability guide and user manual (Chinese)](docs/MATT-POCOCK-ENGINEERING-GUIDE.zh-CN.md).

## Core concepts

### 1. Compose focused workflows instead of running one giant process

Different engineering stages require different modes of thought. Exploration should not rush into implementation. Diagnosis should not begin with a guessed fix. Specification and ticket slicing should not collapse into one undifferentiated output.

Each skill therefore owns one clear stage and hands useful context to the next. Use a single skill when that is enough, or compose several into a delivery path.

### 2. Route from task state instead of making users memorize commands

Users normally know what they want to achieve, but not necessarily which skill should run. Ask Matt and narrow plain-language routing recommend the smallest useful workflow for the current intent.

Wayfinder is an explicit entry point for broader product and architecture navigation. Setup is an explicit entry point for establishing repository-wide working conventions.

### 3. Carry context through engineering artifacts

Conversations, specs, tickets, implementation evidence, review conclusions, and handoffs are not isolated outputs. Together they carry context forward so later stages do not have to rediscover constraints that were already settled.

The goal is not more documentation. The goal is to preserve decision-relevant information when work becomes long-running, changes hands, or crosses a context-window boundary.

### 4. End each stage with observable evidence

Implementation needs verification. Diagnosis needs root-cause evidence. Code review needs to check both engineering standards and the source requirement. Architecture recommendations need to point back to the real code structure.

The plugin emphasizes what changed, how it was proven, and what remains uncertain—not merely an answer that looks complete.

### 5. Stay lightweight by default and add heavier capabilities only when useful

The current agent is the default. Subagents, worktrees, independent reviewers, background research, and other heavier capabilities remain optional enhancements, added when they materially reduce risk or shorten the critical path.

## Ideas it borrows and combines

The plugin primarily inherits and combines these ideas from Matt Pocock's Engineering skills:

- **Grill before build:** expose vague assumptions through questions, documentation, and evidence before implementation.
- **Domain language first:** establish stable vocabulary, states, and rules before drawing code boundaries.
- **Spec as a decision artifact:** record settled behavior and constraints instead of collecting wishes.
- **Tracer-bullet tickets:** slice work into independently verifiable vertical behavior rather than horizontal technical layers.
- **Evidence-driven implementation:** close implementation, TDD, diagnosis, and review loops around observable behavior.
- **Deep modules and narrow interfaces:** improve architecture through information hiding, interface depth, and high-leverage seams rather than mechanical layering.
- **Explicit context handoff:** carry only the working state that the next task, agent, or context window actually needs.

This project adds a Codex-specific composition layer: native skills, plain-language routing, an existing-task compatibility bridge, conservative default intervention, and explicit optional enhancements.

## What it can achieve

| Stage | Workflows | Typical result |
| --- | --- | --- |
| Navigation | Ask Matt, Wayfinder | Choose the next step or create a product, architecture, and delivery path. |
| Exploration | Grill with Docs, Domain Modeling, Research, Prototype | Clarify the problem, align language, gather evidence, and test key assumptions. |
| Formalization | To Spec, To Tickets | Produce a reviewable spec and independently deliverable work items. |
| Delivery | Implement, TDD | Deliver a bounded change with fresh verification evidence. |
| Diagnosis and review | Diagnosing Bugs, Code Review, Resolving Merge Conflicts | Establish root cause, find defects, verify requirement coverage, and resolve conflicts safely. |
| Architecture | Codebase Design, Improve Codebase Architecture | Design deeper modules and interfaces and identify high-leverage refactoring opportunities. |
| Operations and continuity | Triage, Wizard, Setup, Handoff | Route work, generate setup guides, establish repository conventions, and preserve context. |

A typical composed path looks like this:

```text
Fuzzy idea
  → Grill with Docs / Domain Modeling / Research / Prototype
  → To Spec
  → To Tickets
  → Implement / TDD
  → Code Review
  → Handoff
```

Bug work usually begins with Diagnosing Bugs. Existing-codebase architecture work usually begins with Improve Codebase Architecture or Codebase Design. Most tasks do not need the entire chain.

## How to use it

### Describe the goal directly

```text
Use Matt Pocock Engineering to review this project's code structure and find the highest-leverage improvement.

Challenge this product idea, then turn the settled context into a spec and deliverable tickets.

Implement issue #42, run the relevant verification, and review the final diff.

Diagnose this regression, but do not start fixing it until the root cause is established.
```

### When you are unsure which workflow fits

```text
Use Ask Matt to recommend the smallest workflow combination for this task.
```

### Use explicit entry points

```text
Use Wayfinder to turn the current product direction into an architecture map and delivery path.

Use Setup to prepare a preview of the Matt Engineering conventions for this repository.
```

### Attach to an existing task

New tasks use native skills first. If a task was already open before installation, or the Matt skills are temporarily absent from its skill list, explicitly select **Matt Pocock Engineering**. The compatibility bridge loads the same workflow, and the current agent continues the task.

## Tradeoffs

- **It optimizes for engineering quality and context continuity, not the fewest possible steps.** A trivial one-off edit may be faster without a full workflow.
- **Nineteen focused workflows improve precision but introduce routing cost.** Use Ask Matt instead of learning every skill before starting.
- **Conservative routing reduces unwanted intervention but sometimes requires an explicit selection.** Setup, Wayfinder, and heavier enhancements do not start from ordinary wording.
- **Engineering artifacts reduce rediscovery but can become maintenance overhead.** Keep specs, tickets, ADRs, and context documents only when later work will consume them.
- **The existing-task bridge adds one loading step and a small token cost.** Native skills in a new task remain the more direct path.
- **A single-agent default is easier to control but does not maximize parallelism automatically.** Add subagents or an independent reviewer when work can be divided safely and the payoff is clear.
- **Upstream sync is reviewed, not automatic.** New Matt Pocock skills are compared semantically before adoption so this plugin's composition and Codex-specific behavior remain coherent.

## Development and validation

Requirements: Bash, Node.js, Python 3, and a Codex installation containing the official skill and plugin validators.

```bash
git clone https://github.com/tsai09495/matt-pocock-engineering.git
cd matt-pocock-engineering
bash plugins/matt-engineering/scripts/validate-suite.sh
```

## Attribution and license

The Engineering workflow concepts and adapted content originate from [mattpocock/skills](https://github.com/mattpocock/skills). This project is independently adapted and maintained by Yewang Tsai. It is not an official Matt Pocock release and does not imply Matt Pocock's endorsement.

This project is available under the [MIT License](LICENSE).
