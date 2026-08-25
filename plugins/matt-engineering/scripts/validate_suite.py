#!/usr/bin/env python3
"""Deterministic static checks for the Matt Engineering plugin."""

from __future__ import annotations

import ast
import json
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / "skills"
EXPECTED_SKILLS = {
    "ask-matt",
    "code-review",
    "codebase-design",
    "diagnosing-bugs",
    "domain-modeling",
    "grill-with-docs",
    "handoff",
    "implement",
    "improve-codebase-architecture",
    "prototype",
    "research",
    "resolving-merge-conflicts",
    "setup-matt-pocock-skills",
    "tdd",
    "to-spec",
    "to-tickets",
    "triage",
    "wayfinder",
    "wizard",
}
EXPLICIT_ONLY = {"setup-matt-pocock-skills", "wayfinder"}
# v2.1 baseline before the v1.2 upstream sync (18 skills).
V21_DESCRIPTION_CHARS = 3236
DESCRIPTION_BUDGET_RATIO = 1.05
APPROVED_NEW_IMPLICIT_SKILLS = {"wizard"}
MAX_DESCRIPTION_CHARS = 220
ALLOWED_HISTORICAL = {
    ROOT / "references" / "migration-v1-to-v2.md",
}
ALLOWED_EXCLUSIONS = {
    ROOT / "references" / "routing-policy.md",
    ROOT / "references" / "upstream-sync.md",
}


class ValidationError(Exception):
    pass


def fail(message: str) -> None:
    raise ValidationError(message)


def unquote(value: str) -> str:
    value = value.strip()
    if value.startswith(("'", '"')):
        parsed = ast.literal_eval(value)
        if not isinstance(parsed, str):
            fail(f"Expected a string, got {value!r}")
        return parsed
    return value


def parse_frontmatter(path: Path) -> dict[str, str]:
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0] != "---":
        fail(f"{path.relative_to(ROOT)}: missing opening frontmatter delimiter")
    try:
        end = lines.index("---", 1)
    except ValueError as exc:
        raise ValidationError(
            f"{path.relative_to(ROOT)}: missing closing frontmatter delimiter"
        ) from exc

    values: dict[str, str] = {}
    for line in lines[1:end]:
        match = re.fullmatch(r"([a-z_]+):\s*(.+)", line)
        if not match:
            fail(f"{path.relative_to(ROOT)}: unsupported frontmatter line {line!r}")
        key, raw = match.groups()
        if key in values:
            fail(f"{path.relative_to(ROOT)}: duplicate frontmatter key {key}")
        values[key] = unquote(raw)

    if set(values) != {"name", "description"}:
        fail(
            f"{path.relative_to(ROOT)}: frontmatter keys must be exactly name and "
            f"description, found {sorted(values)}"
        )
    return values


def quoted_yaml_value(text: str, key: str, path: Path) -> str:
    match = re.search(rf"^\s+{re.escape(key)}:\s*(.+)$", text, re.MULTILINE)
    if not match:
        fail(f"{path.relative_to(ROOT)}: missing {key}")
    return unquote(match.group(1))


def validate_skill_metadata(skill_dir: Path) -> int:
    skill_path = skill_dir / "SKILL.md"
    values = parse_frontmatter(skill_path)
    if values["name"] != skill_dir.name:
        fail(
            f"{skill_path.relative_to(ROOT)}: name {values['name']!r} does not "
            f"match folder {skill_dir.name!r}"
        )
    description_length = len(values["description"])
    if description_length > MAX_DESCRIPTION_CHARS:
        fail(
            f"{skill_path.relative_to(ROOT)}: description is {description_length} "
            f"characters; maximum is {MAX_DESCRIPTION_CHARS}"
        )

    yaml_path = skill_dir / "agents" / "openai.yaml"
    if not yaml_path.is_file():
        fail(f"{yaml_path.relative_to(ROOT)}: missing")
    text = yaml_path.read_text(encoding="utf-8")
    if not re.search(r"^interface:\s*$", text, re.MULTILINE):
        fail(f"{yaml_path.relative_to(ROOT)}: missing interface block")
    display_name = quoted_yaml_value(text, "display_name", yaml_path)
    short_description = quoted_yaml_value(text, "short_description", yaml_path)
    if not display_name.strip():
        fail(f"{yaml_path.relative_to(ROOT)}: empty display_name")
    if not 25 <= len(short_description) <= 64:
        fail(
            f"{yaml_path.relative_to(ROOT)}: short_description length must be "
            f"25-64, got {len(short_description)}"
        )

    policy_matches = re.findall(
        r"^\s+allow_implicit_invocation:\s*(true|false)\s*$", text, re.MULTILINE
    )
    if skill_dir.name in EXPLICIT_ONLY:
        if policy_matches != ["false"]:
            fail(
                f"{yaml_path.relative_to(ROOT)}: explicit-only skill must set "
                "allow_implicit_invocation: false"
            )
    elif policy_matches:
        fail(f"{yaml_path.relative_to(ROOT)}: unexpected allow_implicit_invocation policy")
    return description_length


def validate_wizard_template() -> None:
    path = SKILLS / "wizard" / "template.sh"
    text = path.read_text(encoding="utf-8")
    required = [
        "DRY_RUN=0",
        "validate_name()",
        "validate_single_line()",
        "validate_env_value()",
        "resolve_env_file()",
        "validate_display_text()",
        "capture_set()",
        "capture_kind()",
        "run_stages()",
        "--root",
        'readonly WIZARD_PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"',
        'readonly GITHUB_HOST="github.com"',
        '(cd "$WORK_ROOT" && "$GH_BIN" repo view',
        'auth status --hostname "$GITHUB_HOST"',
        'confirm "Open $url in your browser?"',
        "set_secret requires an ask_secret capture",
        "#|BEGIN",
        "refusing symlink ENV_FILE",
        '"$GH_BIN" secret set',
        "--repo",
        "no stages authored",
    ]
    for marker in required:
        if marker not in text:
            fail(f"{path.relative_to(ROOT)}: missing safety marker {marker!r}")
    for forbidden in [
        "TOTAL_MINUTES",
        "Stripe",
        "pk_test_",
        "sk_test_",
        "pk_live_",
        "sk_live_",
    ]:
        if forbidden in text:
            fail(f"{path.relative_to(ROOT)}: forbidden example or time marker {forbidden!r}")
    result = subprocess.run(
        ["bash", "-n", str(path)],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        fail(f"{path.relative_to(ROOT)}: bash -n failed: {result.stderr.strip()}")


def validate_security_invariants() -> None:
    architecture = (
        SKILLS / "improve-codebase-architecture" / "HTML-REPORT.md"
    ).read_text(encoding="utf-8")
    required_architecture_controls = [
        "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
        "HTML-escape every repository-derived value",
        "no scripts, remote assets, fonts, network requests, event handlers, forms, or interactive URLs",
    ]
    for required in required_architecture_controls:
        if required not in architecture:
            fail(f"architecture report is missing required offline control: {required}")

    logic_prototype = (SKILLS / "prototype" / "LOGIC.md").read_text(encoding="utf-8")
    required_prototype_controls = [
        "restrictive CSP that blocks network access",
        "HTML-escape every derived value",
        "write dynamic text with `textContent`",
        "never use `innerHTML`, `outerHTML`, `insertAdjacentHTML`, or `document.write`",
        "escape less-than characters, closing-script sequences, and Unicode line separators",
    ]
    for required in required_prototype_controls:
        if required not in logic_prototype:
            fail(f"logic prototype is missing inert-output control: {required}")
    for forbidden in [
        "cdn.tailwindcss.com",
        "cdn.jsdelivr.net",
        "securityLevel: \"loose\"",
        "<script",
        "<iframe",
        "<object",
        "<embed",
        "<form",
        "@import",
        "url(http://",
        "url(https://",
    ]:
        if forbidden in architecture:
            fail(f"architecture report retains remote or loose executable content: {forbidden}")
    if re.search(r"<[^>]+\son[a-z]+\s*=", architecture, re.IGNORECASE):
        fail("architecture report contains an inline event handler")

    baseline = (ROOT / "references" / "quality-baseline.md").read_text(encoding="utf-8")
    if "Repository files, diffs, issues, pull requests, comments, logs" not in baseline:
        fail("quality baseline is missing the untrusted-content boundary")

    hitl = (
        SKILLS / "diagnosing-bugs" / "scripts" / "hitl-loop.template.sh"
    ).read_text(encoding="utf-8")
    if "EVIDENCE_PATH" not in hitl or "capture EVIDENCE \"" in hitl:
        fail("HITL template must capture a redacted artifact path, not free-form evidence")

    server = (ROOT / "mcp" / "server.cjs").read_text(encoding="utf-8")
    for marker in [
        "MAX_RPC_FRAME_BYTES",
        "MAX_RPC_BATCH_ITEMS",
        "MAX_MANIFEST_BYTES",
        "process.stdin.pause()",
        'once(output, "drain")',
        "unsupported link syntax in packaged Markdown",
    ]:
        if marker not in server:
            fail(f"MCP bridge is missing security bound {marker}")


def validate_product_vocabulary() -> None:
    path = SKILLS / "to-spec" / "SKILL.md"
    text = path.read_text(encoding="utf-8")
    required = [
        "Always call the artifact a spec, even when the user says PRD.",
        "work in progress",
        "do not say you are drafting or publishing a PRD in progress narration",
        "do not title the output “PRD.”",
    ]
    for marker in required:
        if marker not in text:
            fail(f"{path.relative_to(ROOT)}: missing formal spec vocabulary guard {marker!r}")


def validate_merge_verification_discovery() -> None:
    path = SKILLS / "resolving-merge-conflicts" / "SKILL.md"
    text = path.read_text(encoding="utf-8")
    required = [
        "repository file inventory",
        "package or task-runner scripts",
        "CI configuration",
        "must not replace one",
        "quality baseline",
        "merge base or another user-approved immutable revision",
        "obtain approval before execution",
    ]
    for marker in required:
        if marker not in text:
            fail(f"{path.relative_to(ROOT)}: missing verification discovery guard {marker!r}")


def validate_ticket_independence_guard() -> None:
    path = SKILLS / "to-tickets" / "SKILL.md"
    text = path.read_text(encoding="utf-8")
    required = [
        "Do not split tests, metrics, documentation, or other supporting work",
        "merely to create parallelism",
        "acceptance criteria require behavior introduced by another ticket",
        "model that edge explicitly or redraw the slice",
        "one concrete observable trace",
        "mutually exclusive success, exhaustion, decline, cancellation",
        "work continues after a terminal outcome",
    ]
    for marker in required:
        if marker not in text:
            fail(f"{path.relative_to(ROOT)}: missing ticket independence guard {marker!r}")


def is_escaped(text: str, index: int) -> bool:
    slashes = 0
    index -= 1
    while index >= 0 and text[index] == "\\":
        slashes += 1
        index -= 1
    return slashes % 2 == 1


def strip_inline_code(line: str) -> str:
    output: list[str] = []
    cursor = 0
    while cursor < len(line):
        if line[cursor] != "`" or is_escaped(line, cursor):
            output.append(line[cursor])
            cursor += 1
            continue
        opening_end = cursor
        while opening_end < len(line) and line[opening_end] == "`":
            opening_end += 1
        delimiter_length = opening_end - cursor
        search = opening_end
        closing_start = -1
        while search < len(line):
            candidate = line.find("`", search)
            if candidate < 0:
                break
            candidate_end = candidate
            while candidate_end < len(line) and line[candidate_end] == "`":
                candidate_end += 1
            if not is_escaped(line, candidate) and candidate_end - candidate == delimiter_length:
                closing_start = candidate
                break
            search = candidate_end
        if closing_start < 0:
            output.append(line[cursor:])
            break
        output.append(" " * (closing_start + delimiter_length - cursor))
        cursor = closing_start + delimiter_length
    return "".join(output)


def markdown_prose(text: str) -> str:
    prose: list[str] = []
    fence_character: str | None = None
    fence_length = 0
    for line in text.splitlines():
        if fence_character is None:
            fence = re.match(r"^ {0,3}(`{3,}|~{3,})(.*)$", line)
            if fence and not (fence.group(1)[0] == "`" and "`" in fence.group(2)):
                character = fence.group(1)[0]
                fence_character = character
                fence_length = len(fence.group(1))
                continue
            prose.append(strip_inline_code(line))
        else:
            closing_fence = re.match(r"^ {0,3}(`+|~+)[ \t]*$", line)
            if (
                closing_fence
                and closing_fence.group(1)[0] == fence_character
                and len(closing_fence.group(1)) >= fence_length
            ):
                fence_character = None
                fence_length = 0
    return "\n".join(prose)


def validate_links() -> None:
    link_pattern = re.compile(r"\[([^\]\n]+)\]\(([^)\n]+)\)")
    reference_definition = re.compile(r"^[ \t]{0,3}\[[^\n]+\]:", re.MULTILINE)
    unsupported_html = re.compile(r"<[^>]*>", re.DOTALL)
    unsupported_image = re.compile(r"!\s*\[")
    unsupported_link_remainder = re.compile(r"\]\s*(?:\(|\[)")
    canonical_root = ROOT.resolve()
    for path in ROOT.rglob("*.md"):
        text = path.read_text(encoding="utf-8")
        prose = markdown_prose(text)
        remainder = link_pattern.sub("", prose)
        if (
            reference_definition.search(prose)
            or unsupported_html.search(prose)
            or unsupported_image.search(prose)
            or unsupported_link_remainder.search(remainder)
        ):
            fail(
                f"{path.relative_to(ROOT)}: unsupported link syntax; use inline Markdown links"
            )
        for _, target in link_pattern.findall(prose):
            clean = target.strip()
            if clean.startswith("<") and clean.endswith(">"):
                clean = clean[1:-1]
            clean = clean.split("#", 1)[0].split("?", 1)[0].strip()
            if not clean:
                continue
            if re.search(r"[\\&\x00-\x20]", clean):
                fail(f"{path.relative_to(ROOT)}: ambiguous link target {target!r}")
            scheme = re.match(r"^([a-z][a-z0-9+.-]*):", clean, re.I)
            if scheme:
                if scheme.group(1).lower() != "https":
                    fail(f"{path.relative_to(ROOT)}: unsafe external link {target!r}")
                continue
            if clean.startswith("/"):
                fail(f"{path.relative_to(ROOT)}: absolute filesystem link {target!r}")
            resolved = (path.parent / clean).resolve()
            if not resolved.is_relative_to(canonical_root):
                fail(f"{path.relative_to(ROOT)}: relative link escapes plugin {target!r}")
            if not resolved.exists():
                fail(
                    f"{path.relative_to(ROOT)}: broken relative link {target!r}"
                )

    if not reference_definition.search("[guide]: ./guide.md"):
        fail("reference-link guard self-check failed")
    if not unsupported_html.search('<iframe src="https://example.com">'):
        fail("raw HTML guard self-check failed")
    if not unsupported_link_remainder.search("[nested [label]](https://example.com)"):
        fail("nested-link guard self-check failed")


def validate_stale_references() -> None:
    checks = {
        "to-prd": re.compile(r"\bto-prd\b"),
        "to-issues": re.compile(r"\bto-issues\b"),
        "/review": re.compile(r"(?<!code-)/review\b"),
    }
    deprecated = {
        "qa": re.compile(r"(?<![A-Za-z0-9_-])qa(?![A-Za-z0-9_-])", re.I),
        "zoom-out": re.compile(r"\bzoom-out\b", re.I),
    }
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix not in {".md", ".yaml", ".json", ".sh", ".cjs"}:
            continue
        if "docs" in path.relative_to(ROOT).parts or path in ALLOWED_HISTORICAL:
            continue
        text = path.read_text(encoding="utf-8")
        for label, pattern in checks.items():
            if pattern.search(text):
                fail(f"{path.relative_to(ROOT)}: stale reference {label!r}")
        if path not in ALLOWED_EXCLUSIONS:
            for label, pattern in deprecated.items():
                if pattern.search(text):
                    fail(f"{path.relative_to(ROOT)}: deprecated reference {label!r}")


def validate_manifest() -> None:
    path = ROOT / ".codex-plugin" / "plugin.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("name") != ROOT.name:
        fail(
            f"{path.relative_to(ROOT)}: plugin name {data.get('name')!r} does not "
            f"match folder {ROOT.name!r}"
        )
    version = data.get("version", "")
    pattern = re.compile(
        r"^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?\+codex\.[0-9A-Za-z.-]+$"
    )
    if not pattern.fullmatch(version):
        fail(f"{path.relative_to(ROOT)}: invalid version {version!r}")
    if data.get("mcpServers") != "./.mcp.json":
        fail(f"{path.relative_to(ROOT)}: mcpServers must be './.mcp.json'")
    mcp_path = ROOT / ".mcp.json"
    mcp_data = json.loads(mcp_path.read_text(encoding="utf-8"))
    servers = mcp_data.get("mcpServers")
    if not isinstance(servers, dict) or set(servers) != {"mattEngineeringCompatibilityBridge"}:
        fail(f"{mcp_path.relative_to(ROOT)}: unexpected MCP server set")
    server = servers["mattEngineeringCompatibilityBridge"]
    expected_server = {
        "title": "Matt Pocock Engineering Compatibility Bridge",
        "description": "Load the installed Matt Pocock Engineering workflow into an existing task when native skills are unavailable.",
        "cwd": ".",
        "command": "node",
        "args": ["./mcp/server.cjs", "--stdio"],
    }
    if server != expected_server:
        fail(f"{mcp_path.relative_to(ROOT)}: unexpected bridge launch record")
    launch_cwd = (ROOT / server["cwd"]).resolve()
    launch_target = (launch_cwd / server["args"][0]).resolve()
    expected_target = (ROOT / "mcp" / "server.cjs").resolve()
    if launch_cwd != ROOT.resolve() or launch_target != expected_target or not launch_target.is_file():
        fail(f"{mcp_path.relative_to(ROOT)}: bridge launch path escapes canonical plugin root")
    prompts = data.get("interface", {}).get("defaultPrompt", [])
    if not isinstance(prompts, list) or not 1 <= len(prompts) <= 3:
        fail(
            f"{path.relative_to(ROOT)}: interface.defaultPrompt must contain 1-3 prompts"
        )
    for index, prompt in enumerate(prompts):
        if not isinstance(prompt, str) or len(prompt) > 128:
            fail(
                f"{path.relative_to(ROOT)}: defaultPrompt[{index}] must be a string "
                "of at most 128 characters"
            )


def repository_root() -> Path:
    output = subprocess.check_output(
        ["git", "rev-parse", "--show-toplevel"], cwd=ROOT, text=True
    ).strip()
    return Path(output).resolve()


def validate_marketplace() -> None:
    repo = repository_root()
    path = repo / ".agents" / "plugins" / "marketplace.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    expected = {
        "name": "matt-pocock-engineering",
        "interface": {"displayName": "Matt Pocock Engineering"},
        "plugins": [
            {
                "name": "matt-engineering",
                "source": {
                    "source": "local",
                    "path": "./plugins/matt-engineering",
                },
                "policy": {
                    "installation": "AVAILABLE",
                    "authentication": "ON_INSTALL",
                },
                "category": "Productivity",
            }
        ],
    }
    if data != expected:
        fail(f"{path.relative_to(repo)}: marketplace contract changed")
    source_path = (repo / data["plugins"][0]["source"]["path"]).resolve()
    if source_path != ROOT.resolve():
        fail(f"{path.relative_to(repo)}: marketplace source escapes canonical plugin root")


def validate_git_scope() -> None:
    repo = repository_root()
    commands = [
        ["git", "ls-files", "--full-name"],
        ["git", "diff", "--cached", "--name-only"],
    ]
    for command in commands:
        output = subprocess.check_output(command, cwd=repo, text=True)
        offenders = [
            line for line in output.splitlines() if line.startswith("dynamic-workflow-runner/")
        ]
        if offenders:
            fail(f"unrelated dynamic-workflow-runner paths are tracked/staged: {offenders}")


def main() -> int:
    skill_dirs = sorted(
        path for path in SKILLS.iterdir() if path.is_dir() and (path / "SKILL.md").is_file()
    )
    names = {path.name for path in skill_dirs}
    if names != EXPECTED_SKILLS:
        fail(
            "skill set mismatch: "
            f"missing={sorted(EXPECTED_SKILLS - names)}, extra={sorted(names - EXPECTED_SKILLS)}"
        )

    description_lengths = {path.name: validate_skill_metadata(path) for path in skill_dirs}
    unknown_approved = APPROVED_NEW_IMPLICIT_SKILLS - names
    if unknown_approved:
        fail(f"approved new implicit skills are missing: {sorted(unknown_approved)}")
    explicit_approved = APPROVED_NEW_IMPLICIT_SKILLS & EXPLICIT_ONLY
    if explicit_approved:
        fail(f"approved new implicit skills cannot be explicit-only: {sorted(explicit_approved)}")
    existing_description_chars = sum(
        length for name, length in description_lengths.items()
        if name not in APPROVED_NEW_IMPLICIT_SKILLS
    )
    existing_budget = int(V21_DESCRIPTION_CHARS * DESCRIPTION_BUDGET_RATIO)
    if existing_description_chars > existing_budget:
        fail(
            f"existing-skill description metadata is {existing_description_chars} characters; "
            f"budget is {existing_budget} (v2.1 baseline {V21_DESCRIPTION_CHARS} +5%)"
        )
    total_description_chars = sum(description_lengths.values())
    total_budget = existing_budget + MAX_DESCRIPTION_CHARS * len(APPROVED_NEW_IMPLICIT_SKILLS)
    if total_description_chars > total_budget:
        fail(f"description metadata is {total_description_chars} characters; budget is {total_budget}")
    validate_links()
    validate_stale_references()
    validate_wizard_template()
    validate_security_invariants()
    validate_product_vocabulary()
    validate_merge_verification_discovery()
    validate_ticket_independence_guard()
    validate_manifest()
    validate_marketplace()
    validate_git_scope()

    print(f"PASS: {len(skill_dirs)} skills")
    print(f"PASS: explicit-only skills = {sorted(EXPLICIT_ONLY)}")
    delta = (existing_description_chars - V21_DESCRIPTION_CHARS) / V21_DESCRIPTION_CHARS
    print(
        f"PASS: existing description metadata = {existing_description_chars} characters "
        f"({delta:+.1%} vs v2.1 baseline {V21_DESCRIPTION_CHARS}, budget {existing_budget}); "
        f"total with approved new skills = {total_description_chars}/{total_budget}"
    )
    print("PASS: frontmatter, openai.yaml, links, stale references, Wizard safety, manifest, marketplace, git scope")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ValidationError as error:
        print(f"FAIL: {error}", file=sys.stderr)
        raise SystemExit(1)
