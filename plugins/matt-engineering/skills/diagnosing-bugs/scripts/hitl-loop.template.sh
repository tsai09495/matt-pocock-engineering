#!/usr/bin/env bash
# Human-in-the-loop reproduction loop template.
# Copy this file, replace the example steps, and run the copy.

set -euo pipefail

# `capture` prints shell-escaped status or file-path values back to the terminal.
# Keep login, credential entry, evidence contents, and other secret handling
# inside a `step` performed directly by the human.

step() {
  printf '\n>>> %s\n' "$1"
  read -r -p "    [Enter when done] " _
}

capture() {
  local var="$1" question="$2" answer
  printf '\n>>> %s\n' "$question"
  read -r -p "    > " answer
  printf -v "$var" '%s' "$answer"
}

# Replace this example with the smallest manual reproduction sequence.
step "Open the application at the reproduction starting point."
capture REPRODUCED "Perform the trigger. Did the exact symptom occur? (y/n)"
capture EVIDENCE_PATH "Save reviewed, redacted evidence to a file and enter its path:"

printf '\n--- Captured ---\n'
printf 'REPRODUCED=%q\n' "$REPRODUCED"
printf 'EVIDENCE_PATH=%q\n' "$EVIDENCE_PATH"
