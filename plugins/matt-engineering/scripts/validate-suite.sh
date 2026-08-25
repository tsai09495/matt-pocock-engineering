#!/usr/bin/env bash
set -euo pipefail

PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
PYTHON="${PYTHON:-python3}"
QUICK_VALIDATE="$CODEX_HOME/skills/.system/skill-creator/scripts/quick_validate.py"
PLUGIN_VALIDATE="$CODEX_HOME/skills/.system/plugin-creator/scripts/validate_plugin.py"

"$PYTHON" "$PLUGIN_ROOT/scripts/validate_suite.py"
node --check "$PLUGIN_ROOT/mcp/server.cjs"
bash -n "$PLUGIN_ROOT/skills/diagnosing-bugs/scripts/hitl-loop.template.sh"
bash -n "$PLUGIN_ROOT/skills/wizard/template.sh"

if command -v shellcheck >/dev/null 2>&1; then
  shellcheck \
    "$PLUGIN_ROOT/skills/diagnosing-bugs/scripts/hitl-loop.template.sh" \
    "$PLUGIN_ROOT/skills/wizard/template.sh"
fi

node --test \
  "$PLUGIN_ROOT/tests/mcp-bridge.test.cjs" \
  "$PLUGIN_ROOT/tests/wizard-template.test.cjs"

if [[ ! -f "$QUICK_VALIDATE" ]]; then
  printf 'Missing official skill validator: %s\n' "$QUICK_VALIDATE" >&2
  exit 1
fi

if [[ ! -f "$PLUGIN_VALIDATE" ]]; then
  printf 'Missing official plugin validator: %s\n' "$PLUGIN_VALIDATE" >&2
  exit 1
fi

while IFS= read -r skill_dir; do
  "$PYTHON" "$QUICK_VALIDATE" "$skill_dir"
done < <(find "$PLUGIN_ROOT/skills" -mindepth 1 -maxdepth 1 -type d -exec test -f '{}/SKILL.md' \; -print | sort)

"$PYTHON" "$PLUGIN_VALIDATE" "$PLUGIN_ROOT"
printf 'PASS: Matt Engineering suite validation complete\n'
