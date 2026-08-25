---
name: wizard
description: Generate a reviewed interactive Bash wizard for manual steps only a human can perform. Use for third-party dashboard setup, credential capture, CI secrets, or a human-driven cutover—not ordinary agent-executable work.
---

# Wizard

Turn a tedious human-only procedure into a deterministic, reviewable Bash journey. The generated script may open the right pages, explain what to click, capture values without exposing secrets, write approved local configuration, and set approved GitHub Actions secrets or variables.

Implicit invocation authorizes only read-only discovery and an in-chat proposal. It does not authorize creating or running a script, opening a browser, changing permissions, reading existing secret values, writing `.env`, mutating GitHub, performing a cutover, editing documentation, or committing.

Read [quality-baseline.md](../../references/quality-baseline.md) before any write and use [template.sh](template.sh) as the fixed library for an approved script.

## Fit gate

Use Wizard only when at least one required step cannot safely be performed by the agent in the current authorization scope:

- a person must use an unfamiliar third-party dashboard;
- a person must authenticate, approve access, or retrieve a credential;
- a human-controlled migration or cutover has manual checkpoints;
- the same manual procedure needs a deterministic, repeatable handoff.

Do not use Wizard for ordinary shell scripts, application code, a simple `.env.example` edit, a migration the agent is already authorized to run, or an explanation that does not need an executable journey. Work the agent can safely do remains in the normal implementation flow.

## 1. Discover without secrets

Read repository guidance and public configuration. For setup, inspect `.env.example`, documentation, framework config, Docker/compose files, and variable names referenced by CI workflows.

If real `.env*` files exist, discover key names and structure without loading or displaying values. Never copy existing values into context, commands, generated source, a proposal, a test record, or a durable artifact. Prefer examples and `secrets.*` / `vars.*` references over real secret-bearing files.

For a transition, establish current state, target state, manual checkpoints, rollback, and irreversible actions. Verify third-party UI paths and commands against current official documentation; do not invent dashboard steps.

## 2. Present the complete proposal

Before creating a file, show:

- target script path and whether it is ephemeral or repeatable;
- ordered stage names;
- the human action in each stage;
- every captured value by variable name only;
- where each value comes from and where it will go;
- whether it is secret or public;
- every local or external mutation;
- confirmations, verification, rollback, and remaining manual work.

Wait for approval of the complete proposal. Approval to discuss or invoke Wizard is not approval to write the script. Approval to create the script is not approval to run it.

## 3. Author only the approved manifest

Copy [template.sh](template.sh) to the approved target and replace only the inert `#|` records between `#|BEGIN` and `#|END`. Do not edit the fixed runner. Never add executable Bash, substitutions, redirections, pipelines, function definitions, or commands to the generated region; the runner rejects non-record text and unknown operations.

Use only these tab-delimited record operations:

- `total`, `banner`, and `stage` for the journey;
- `open_url` for a verified public HTTPS URL, with immediate target confirmation before opening;
- `ask` for public single-line values and `ask_secret` for hidden single-line secrets;
- `write_env <NAME>` for an approved local dotenv key captured earlier;
- `set_secret <NAME>` for a matching `ask_secret` capture, and `set_var <NAME> <VALUE>` for an approved GitHub repository target;
- `finish` for the summary.

Declare the stage count with `#|total<TAB>N` exactly. Keep one focused human task per stage. Never embed a credential or production value. `write_env` is confined to the project root and accepts only a conservative, shell-inert dotenv value; use a dedicated file or secret store for multiline or richer values. Existing secret values are never loaded automatically.

## 4. Verify without executing the procedure

After the final edit:

1. run `bash -n <script>`;
2. run `shellcheck <script>` when available;
3. run `<script> --root <approved-absolute-project-path> --dry-run` and confirm it creates no files, opens no browser, and calls no external mutation command;
4. confirm every generated line is an allowlisted `#|` record and statically trace every captured name to its approved destination;
5. confirm every external mutation has a target display and human confirmation;
6. confirm no example stage, placeholder, secret value, or unapproved destination remains.

Do not run the real journey end-to-end. It is intentionally human-driven and may handle credentials or irreversible checkpoints.

## 5. Hand off at the authorization boundary

Give the user the absolute path, dry-run command, real run command, approved absolute project root, expected mutations, and rollback notes. Both commands must pass that root through `--root`; the user decides whether and when to run them.

- Do not `chmod +x` unless the approved request includes it; `bash <script>` remains a valid run path.
- Do not link it from a README, commit it, or convert an ephemeral wizard into a permanent setup path without separate authorization.
- Do not delete it after use without approval.
- Treat script output as sensitive evidence and redact it before bringing any excerpt back into the conversation.

## Completion gate

- Proposal approved before file creation.
- Script matches the approved stages and destinations exactly.
- Syntax, optional shellcheck, dry-run, and static data-flow checks pass after the final edit.
- No secret value appears in source, logs, transcript, or test evidence.
- No real procedure, browser action, env write, GitHub mutation, documentation edit, or commit was performed by the agent without exact authorization.
