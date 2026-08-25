#!/usr/bin/env bash
#
# Matt Pocock Engineering Wizard library.
# Everything above the STAGES marker is fixed. Author only the stages below it.

set -euo pipefail

readonly WIZARD_PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
PATH="$WIZARD_PATH"
export PATH
readonly GITHUB_HOST="github.com"
GH_HOST="$GITHUB_HOST"
export GH_HOST
unset GH_ENTERPRISE_TOKEN GITHUB_ENTERPRISE_TOKEN

DRY_RUN=0
ROOT_ARG=""
while (( $# )); do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --root)
      shift
      [[ $# -gt 0 ]] || { printf 'Usage: %s --root /absolute/project/path [--dry-run]\n' "$0" >&2; exit 64; }
      ROOT_ARG="$1"
      ;;
    *) printf 'Usage: %s --root /absolute/project/path [--dry-run]\n' "$0" >&2; exit 64 ;;
  esac
  shift
done

[[ "$ROOT_ARG" == /* && -d "$ROOT_ARG" && ! "$ROOT_ARG" =~ [[:cntrl:]] ]] || {
  printf 'Error: --root must name the approved absolute project directory\n' >&2
  exit 64
}

if [[ -t 1 ]] && command -v tput >/dev/null 2>&1 && [[ "$(tput colors 2>/dev/null || echo 0)" -ge 8 ]]; then
  BOLD=$(tput bold); DIM=$(tput dim); RESET=$(tput sgr0)
  BLUE=$(tput setaf 4); GREEN=$(tput setaf 2); YELLOW=$(tput setaf 3); RED=$(tput setaf 1)
else
  BOLD=""; DIM=""; RESET=""; BLUE=""; GREEN=""; YELLOW=""; RED=""
fi

TOTAL_STAGES=0
_STAGE_INDEX=0
WORK_ROOT="$(cd "$ROOT_ARG" && pwd -P)"
[[ ! "$WORK_ROOT" =~ [[:cntrl:]] ]] || {
  printf 'Error: canonical project root contains terminal control characters\n' >&2
  exit 64
}
readonly WORK_ROOT
ENV_FILE="${ENV_FILE:-.env}"
GH_REPO="${GH_REPO:-}"
GH_BIN=""
WRITTEN_ENV=()
WRITTEN_SECRET=()
WRITTEN_VAR=()
SKIPPED=()
_CAPTURE_KEYS=()
_CAPTURE_VALUES=()
_CAPTURE_KINDS=()
_WIZARD_TMP=""

cleanup() {
  [[ -n "$_WIZARD_TMP" && -f "$_WIZARD_TMP" ]] && rm -f -- "$_WIZARD_TMP"
  return 0
}
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

die() {
  printf '  %sError:%s %s\n' "$RED" "$RESET" "$1" >&2
  exit 1
}

_clear() {
  [[ "$DRY_RUN" -eq 0 && -t 1 ]] || return 0
  if command -v tput >/dev/null 2>&1; then tput clear; else printf '\033[2J\033[3J\033[H'; fi
}

say()  { printf '  %s\n' "$1"; }
step() { printf '  %s•%s %s\n' "$BLUE" "$RESET" "$1"; }
note() { printf '  %s%s%s\n' "$DIM" "$1" "$RESET"; }
warn() { printf '  %s⚠ %s%s\n' "$YELLOW" "$1" "$RESET"; }

pause() {
  if [[ "$DRY_RUN" -eq 1 ]]; then note "dry-run checkpoint: ${1:-continue}"; return 0; fi
  printf '  %s%s%s ' "$DIM" "${1:-Press Enter to continue}" "$RESET"
  read -r _ || true
}

confirm() {
  if [[ "$DRY_RUN" -eq 1 ]]; then note "dry-run confirmation: $1"; return 0; fi
  local reply=""
  printf '  %s? %s [y/N] ' "$YELLOW" "$1"
  read -r reply || true
  [[ "$reply" =~ ^[Yy]$ ]]
}

banner() {
  _clear
  printf '\n%s%s  %s%s\n' "$BOLD" "$BLUE" "$1" "$RESET"
  printf '%s  %s stages%s\n' "$DIM" "$TOTAL_STAGES" "$RESET"
  [[ "$DRY_RUN" -eq 1 ]] && printf '%s  DRY RUN — no files, browser actions, or external mutations%s\n' "$YELLOW" "$RESET"
  printf '\n'
  pause "Ready to start?"
}

stage() {
  _clear
  _STAGE_INDEX=$((_STAGE_INDEX + 1))
  printf '\n%s%s▸ Stage %s/%s · %s%s\n' \
    "$BOLD" "$BLUE" "$_STAGE_INDEX" "$TOTAL_STAGES" "$1" "$RESET"
}

validate_name() {
  local name="$1"
  [[ ${#name} -le 128 && "$name" =~ ^[A-Z_][A-Z0-9_]*$ ]] || die "invalid variable name"
}

validate_single_line() {
  local value="$1"
  case "$value" in
    *$'\n'*|*$'\r'*) die "multiline values require a dedicated file or secret-store workflow" ;;
  esac
}

validate_display_text() {
  local value="$1"
  validate_single_line "$value"
  [[ ! "$value" =~ [[:cntrl:]] ]] || die "display text contains terminal control characters"
}

capture_index() {
  local key="$1" index
  for (( index=0; index<${#_CAPTURE_KEYS[@]}; index++ )); do
    if [[ "${_CAPTURE_KEYS[$index]}" == "$key" ]]; then printf '%s' "$index"; return 0; fi
  done
  return 1
}

capture_set() {
  local key="$1" value="$2" kind="$3" index
  validate_name "$key"
  if ! index=$(capture_index "$key"); then
    index=${#_CAPTURE_KEYS[@]}
    _CAPTURE_KEYS[$index]="$key"
  fi
  _CAPTURE_VALUES[$index]="$value"
  _CAPTURE_KINDS[$index]="$kind"
}

capture_get() {
  local key="$1" index
  validate_name "$key"
  index=$(capture_index "$key") || return 1
  printf '%s' "${_CAPTURE_VALUES[$index]}"
}

capture_kind() {
  local key="$1" index
  validate_name "$key"
  index=$(capture_index "$key") || return 1
  printf '%s' "${_CAPTURE_KINDS[$index]}"
}

validate_env_value() {
  local value="$1"
  validate_single_line "$value"
  [[ "$value" =~ ^[A-Za-z0-9_./:@%+=,-]*$ ]] || die "value is not safe for generic dotenv output; use a dedicated file or secret store"
}

resolve_env_file() {
  local candidate parent parent_real
  validate_display_text "$ENV_FILE"
  case "$ENV_FILE" in
    /*) candidate="$ENV_FILE" ;;
    *) candidate="$WORK_ROOT/$ENV_FILE" ;;
  esac
  parent=$(dirname -- "$candidate")
  [[ -d "$parent" ]] || die "ENV_FILE parent directory does not exist: $parent"
  parent_real=$(cd "$parent" && pwd -P)
  validate_display_text "$parent_real"
  case "$parent_real/" in
    "$WORK_ROOT/"*) ;;
    *) die "ENV_FILE must stay inside the project root: $WORK_ROOT" ;;
  esac
  ENV_FILE="$parent_real/$(basename -- "$candidate")"
  validate_display_text "$ENV_FILE"
  [[ ! -L "$ENV_FILE" ]] || die "refusing symlink ENV_FILE: $ENV_FILE"
  [[ ! -d "$ENV_FILE" ]] || die "ENV_FILE is a directory: $ENV_FILE"
}

open_url() {
  local url="$1" opener=""
  validate_display_text "$url"
  [[ "$url" =~ ^https:// ]] || die "only verified HTTPS URLs may be opened: $url"
  if [[ "$DRY_RUN" -eq 1 ]]; then note "would open: $url"; return 0; fi
  confirm "Open $url in your browser?" || { SKIPPED+=("browser target $url"); warn "skipped browser target $url"; return 0; }
  printf '  %s↗ opening%s %s\n' "$GREEN" "$RESET" "$url"
  for opener in wslview explorer.exe xdg-open open; do
    opener=$(command -v "$opener" 2>/dev/null || true)
    [[ "$opener" == /* && -x "$opener" ]] || continue
    "$opener" "$url" >/dev/null 2>&1 || warn "could not open a browser — visit manually: $url"
    return 0
  done
  warn "could not open a browser — visit manually: $url"
}

ask() {
  local key="$1" prompt="$2" input=""
  validate_name "$key"
  validate_display_text "$prompt"
  if [[ "$DRY_RUN" -eq 1 ]]; then note "would capture public value: $key"; capture_set "$key" '<DRY_RUN>' public; return 0; fi
  printf '  %s%s%s ' "$BOLD" "$prompt" "$RESET"
  read -r input || true
  validate_single_line "$input"
  capture_set "$key" "$input" public
}

ask_secret() {
  local key="$1" prompt="$2" input=""
  validate_name "$key"
  validate_display_text "$prompt"
  if [[ "$DRY_RUN" -eq 1 ]]; then note "would capture hidden secret: $key"; capture_set "$key" '<DRY_RUN>' secret; return 0; fi
  printf '  %s%s%s ' "$BOLD" "$prompt" "$RESET"
  read -rs input || true
  printf '\n'
  validate_single_line "$input"
  capture_set "$key" "$input" secret
}

write_env() {
  local key="$1" value="$2"
  validate_name "$key"
  resolve_env_file
  if [[ "$DRY_RUN" -eq 1 ]]; then note "would write key $key to $ENV_FILE"; return 0; fi
  validate_env_value "$value"
  confirm "Write key $key to $ENV_FILE?" || { SKIPPED+=("env key $key"); warn "skipped env key $key"; return 0; }
  umask 077
  _WIZARD_TMP=$(mktemp "${ENV_FILE}.wizard.XXXXXX")
  if [[ -f "$ENV_FILE" ]]; then
    if grep -vE -- "^${key}=" "$ENV_FILE" > "$_WIZARD_TMP"; then
      :
    else
      local grep_status=$?
      [[ "$grep_status" -eq 1 ]] || die "could not safely read ENV_FILE: $ENV_FILE"
    fi
  fi
  printf '%s=%s\n' "$key" "$value" >> "$_WIZARD_TMP"
  chmod 600 "$_WIZARD_TMP"
  mv -f -- "$_WIZARD_TMP" "$ENV_FILE"
  _WIZARD_TMP=""
  WRITTEN_ENV+=("$key")
  printf '  %s✓ wrote%s %s → %s\n' "$GREEN" "$RESET" "$key" "$ENV_FILE"
}

github_repo() {
  local repo=""
  resolve_gh || return 1
  if [[ -n "$GH_REPO" ]]; then repo="$GH_REPO"
  else
    repo=$(cd "$WORK_ROOT" && "$GH_BIN" repo view --json nameWithOwner,url --jq 'select(.url | startswith("https://github.com/")) | .nameWithOwner' 2>/dev/null) || return 1
  fi
  [[ "$repo" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || return 1
  printf '%s' "$repo"
}

resolve_gh() {
  local candidate=""
  if [[ -n "$GH_BIN" && -x "$GH_BIN" ]]; then return 0; fi
  candidate=$(command -v gh 2>/dev/null) || return 1
  [[ "$candidate" == /* && -x "$candidate" ]] || return 1
  case "$candidate" in
    "$WORK_ROOT"|"$WORK_ROOT"/*) return 1 ;;
  esac
  GH_BIN="$candidate"
}

set_secret() {
  local name="$1" value="$2" repo="" target=""
  validate_name "$name"
  validate_single_line "$value"
  if [[ "$DRY_RUN" -eq 1 ]]; then note "would set GitHub secret: $name (target resolved at run time)"; return 0; fi
  resolve_gh && "$GH_BIN" auth status --hostname "$GITHUB_HOST" >/dev/null 2>&1 || { SKIPPED+=("GitHub secret $name"); warn "skipped GitHub secret $name — gh is unavailable or unauthenticated"; return 0; }
  repo=$(github_repo) || { SKIPPED+=("GitHub secret $name"); warn "skipped GitHub secret $name — repository target is unresolved"; return 0; }
  target="$GITHUB_HOST/$repo"
  confirm "Set GitHub secret $name on $target?" || { SKIPPED+=("GitHub secret $name"); warn "skipped GitHub secret $name"; return 0; }
  if printf '%s' "$value" | "$GH_BIN" secret set "$name" --repo "$target" >/dev/null 2>&1; then
    WRITTEN_SECRET+=("$name")
    printf '  %s✓ set%s GitHub secret %s on %s\n' "$GREEN" "$RESET" "$name" "$target"
  else
    SKIPPED+=("GitHub secret $name")
    warn "failed to set GitHub secret $name on $target"
  fi
}

set_var() {
  local name="$1" value="$2" repo="" target=""
  validate_name "$name"
  validate_display_text "$value"
  if [[ "$DRY_RUN" -eq 1 ]]; then note "would set GitHub variable: $name (target resolved at run time)"; return 0; fi
  resolve_gh && "$GH_BIN" auth status --hostname "$GITHUB_HOST" >/dev/null 2>&1 || { SKIPPED+=("GitHub variable $name"); warn "skipped GitHub variable $name — gh is unavailable or unauthenticated"; return 0; }
  repo=$(github_repo) || { SKIPPED+=("GitHub variable $name"); warn "skipped GitHub variable $name — repository target is unresolved"; return 0; }
  target="$GITHUB_HOST/$repo"
  confirm "Set GitHub variable $name on $target?" || { SKIPPED+=("GitHub variable $name"); warn "skipped GitHub variable $name"; return 0; }
  if "$GH_BIN" variable set "$name" --repo "$target" --body "$value" >/dev/null 2>&1; then
    WRITTEN_VAR+=("$name")
    printf '  %s✓ set%s GitHub variable %s on %s\n' "$GREEN" "$RESET" "$name" "$target"
  else
    SKIPPED+=("GitHub variable $name")
    warn "failed to set GitHub variable $name on $target"
  fi
}

finish() {
  _clear
  printf '\n%s%s  ✓ Wizard complete%s\n' "$BOLD" "$GREEN" "$RESET"
  (( ${#WRITTEN_ENV[@]} ))    && note "wrote env keys: ${WRITTEN_ENV[*]}"
  (( ${#WRITTEN_SECRET[@]} )) && note "set GitHub secrets: ${WRITTEN_SECRET[*]}"
  (( ${#WRITTEN_VAR[@]} ))    && note "set GitHub variables: ${WRITTEN_VAR[*]}"
  if (( ${#SKIPPED[@]} )); then
    warn "skipped actions:"
    local item
    for item in "${SKIPPED[@]}"; do note "- $item"; done
  fi
  printf '\n'
}

run_stages() {
  local line active=0 closed=0 op a b extra value
  while IFS= read -r line <&3; do
    case "$line" in
      '#|BEGIN') active=1; continue ;;
      '#|END') [[ "$active" -eq 1 ]] || continue; closed=1; break ;;
    esac
    [[ "$active" -eq 1 ]] || continue
    [[ "$line" == '#|'* ]] || die "stage manifest contains executable text"
    validate_display_text "${line//$'\t'/}"
    IFS=$'\t' read -r op a b extra <<< "${line#\#|}"
    [[ -n "$op" && -z "$extra" ]] || die "invalid stage manifest record"
    case "$op" in
      total) [[ "$a" =~ ^[1-9][0-9]*$ && -z "$b" ]] || die "invalid total stage count"; TOTAL_STAGES="$a" ;;
      banner) [[ -n "$a" && -z "$b" ]] || die "invalid banner record"; validate_display_text "$a"; banner "$a" ;;
      stage) [[ -n "$a" && -z "$b" ]] || die "invalid stage record"; validate_display_text "$a"; stage "$a" ;;
      open_url) [[ -n "$a" && -z "$b" ]] || die "invalid open_url record"; open_url "$a" ;;
      ask|ask_secret)
        validate_name "$a"; [[ -n "$b" ]] || die "invalid $op record"; "$op" "$a" "$b"
        ;;
      write_env)
        validate_name "$a"; [[ -z "$b" ]] || die "invalid $op record"
        value=$(capture_get "$a") || die "missing captured value: $a"
        write_env "$a" "$value"
        ;;
      set_secret)
        validate_name "$a"; [[ -z "$b" ]] || die "invalid $op record"
        [[ "$(capture_kind "$a" || true)" == secret ]] || die "set_secret requires an ask_secret capture"
        value=$(capture_get "$a") || die "missing captured value: $a"
        set_secret "$a" "$value"
        ;;
      set_var) validate_name "$a"; [[ -n "$b" ]] || die "invalid set_var record"; set_var "$a" "$b" ;;
      finish) [[ -z "$a$b" ]] || die "invalid finish record"; finish ;;
      *) die "unsupported stage operation" ;;
    esac
  done 3< "$0"
  [[ "$closed" -eq 1 ]] || die "stage manifest is missing #|END"
  [[ "$TOTAL_STAGES" -eq "$_STAGE_INDEX" ]] || die "declared $TOTAL_STAGES stages but ran $_STAGE_INDEX"
}

# ──────────────────────────────────────────────────────────────────────────
# STAGES — replace only the #| records below with the reviewed procedure.
# Records are inert comments parsed by the fixed allowlisted runner above.
# ──────────────────────────────────────────────────────────────────────────

run_stages
exit 0

#|BEGIN
#|unsupported	no stages authored; replace the STAGES records before use
#|END
