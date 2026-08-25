const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const pluginRoot = path.resolve(__dirname, "..");
const templatePath = path.join(pluginRoot, "skills", "wizard", "template.sh");
const template = fs.readFileSync(templatePath, "utf8");
const markerIndex = template.lastIndexOf("\n#|BEGIN\n") + 1;
const productionPathLine = 'readonly WIZARD_PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"';

assert.ok(markerIndex > 0, "Wizard template must retain the manifest marker");

function makeFixture(t, records, { trustedPath } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "matt-wizard-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const bin = path.join(root, "bin");
  fs.mkdirSync(bin);
  const script = path.join(root, "wizard.sh");
  const manifest = records.map((record) => `#|${record.join("\t")}`).join("\n");
  let fixtureTemplate = template.slice(0, markerIndex);
  if (trustedPath !== null) {
    const testPath = trustedPath || `${bin}:/usr/bin:/bin`;
    assert.doesNotMatch(testPath, /["\r\n]/);
    fixtureTemplate = fixtureTemplate.replace(
      productionPathLine,
      `readonly WIZARD_PATH="${testPath}"`,
    );
  }
  fs.writeFileSync(
    script,
    `${fixtureTemplate}#|BEGIN\n${manifest}\n#|END\n`,
    { mode: 0o700 },
  );
  return { bin, root, script };
}

function run(script, root, args = [], input = "", env = {}, cwd = root) {
  return spawnSync("/bin/bash", [script, "--root", root, ...args], {
    cwd,
    encoding: "utf8",
    input,
    env: { ...process.env, ENV_FILE: ".env", ...env },
  });
}

function installFakeGh(root) {
  const bin = path.join(root, "bin");
  fs.mkdirSync(bin, { recursive: true });
  const fakeGh = path.join(bin, "gh");
  fs.writeFileSync(fakeGh, `#!/bin/sh
case "$1:$2" in
  auth:status) [ "$3:$4:$GH_HOST" = "--hostname:github.com:github.com" ] || exit 3 ;;
  repo:view) [ "$GH_HOST" = "github.com" ] || exit 4; [ -z "$WIZARD_GH_REPO_CWD" ] || printf '%s' "$PWD" > "$WIZARD_GH_REPO_CWD"; printf 'owner/fixture' ;;
  secret:set) printf '%s\\n' "$*" > "$WIZARD_GH_SECRET_ARGS"; cat > "$WIZARD_GH_SECRET_STDIN" ;;
  variable:set) printf '%s\\n' "$*" > "$WIZARD_GH_VAR_ARGS" ;;
  *) exit 2 ;;
esac
`, { mode: 0o700 });
  return bin;
}

test("template is syntactically valid and contains no runnable example stage", () => {
  const result = spawnSync("/bin/bash", ["-n", templatePath], { encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
  assert.match(template, /no stages authored/);
  assert.match(template, /unsupported stage operation/);
  assert.doesNotMatch(template, /TOTAL_MINUTES|Stripe|\bpk_(?:live|test)_|\bsk_(?:live|test)_/i);
  assert.match(template, new RegExp(productionPathLine.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("project-controlled PATH programs are ignored", (t) => {
  const { bin, root, script } = makeFixture(t, [
    ["ask", "PUBLIC_MODE", "Mode:"],
    ["write_env", "PUBLIC_MODE"],
  ], { trustedPath: null });
  const marker = path.join(root, "path-hijack");
  for (const command of ["dirname", "mktemp", "grep", "chmod", "mv", "rm"]) {
    fs.writeFileSync(
      path.join(bin, command),
      `#!/bin/sh\nprintf '%s' '${command}' >> '${marker}'\nexit 97\n`,
      { mode: 0o700 },
    );
  }

  const result = run(script, root, [], "demo\ny\n", { PATH: `${bin}:/usr/bin:/bin` });
  assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
  assert.equal(fs.existsSync(marker), false);
  assert.equal(fs.readFileSync(path.join(root, ".env"), "utf8"), "PUBLIC_MODE=demo\n");
});

test("dry-run describes actions without files, browser opens, or GitHub calls", (t) => {
  const { root, script } = makeFixture(t, [
    ["total", "1"],
    ["banner", "Fixture setup"],
    ["stage", "Manual configuration"],
    ["open_url", "https://example.com/setup"],
    ["ask_secret", "API_TOKEN", "API token:"],
    ["write_env", "API_TOKEN"],
    ["set_secret", "API_TOKEN"],
    ["set_var", "PUBLIC_MODE", "demo"],
    ["finish"],
  ]);
  const bin = installFakeGh(root);
  const marker = path.join(root, "external-call");
  fs.writeFileSync(path.join(bin, "open"), `#!/bin/sh\nprintf called > "${marker}"\n`, { mode: 0o700 });

  const result = run(script, root, ["--dry-run"], "", {
    PATH: `${bin}:/usr/bin:/bin`,
    WIZARD_GH_SECRET_ARGS: marker,
    WIZARD_GH_SECRET_STDIN: marker,
    WIZARD_GH_VAR_ARGS: marker,
  });

  assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
  assert.match(result.stdout, /DRY RUN/);
  assert.equal(fs.existsSync(path.join(root, ".env")), false);
  assert.equal(fs.existsSync(marker), false);
});

test("approved env write is atomic, mode 600, and does not echo the captured value", (t) => {
  const { root, script } = makeFixture(t, [
    ["total", "1"],
    ["banner", "Fixture setup"],
    ["stage", "Capture token"],
    ["ask_secret", "API_TOKEN", "API token:"],
    ["write_env", "API_TOKEN"],
    ["finish"],
  ]);
  const secret = "fixture-secret-value-47";
  const result = run(script, root, [], `\n${secret}\ny\n`);
  const envFile = path.join(root, ".env");

  assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
  assert.equal(fs.readFileSync(envFile, "utf8"), `API_TOKEN=${secret}\n`);
  assert.equal(fs.statSync(envFile).mode & 0o777, 0o600);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(secret));
});

test("invalid names, unsafe values, and symlink env targets fail before mutation", async (t) => {
  await t.test("invalid variable name", () => {
    const { root, script } = makeFixture(t, [["write_env", "bad-name"]]);
    const result = run(script, root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /invalid variable name/);
    assert.equal(fs.existsSync(path.join(root, ".env")), false);
  });

  await t.test("shell-active dotenv value", () => {
    const { root, script } = makeFixture(t, [
      ["ask_secret", "API_TOKEN", "API token:"],
      ["write_env", "API_TOKEN"],
    ]);
    const result = run(script, root, [], "$(touch should-not-run)\ny\n");
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /not safe for generic dotenv/);
    assert.equal(fs.existsSync(path.join(root, ".env")), false);
    assert.equal(fs.existsSync(path.join(root, "should-not-run")), false);
  });

  await t.test("symlink target", () => {
    const { root, script } = makeFixture(t, [
      ["ask", "API_TOKEN", "API token:"],
      ["write_env", "API_TOKEN"],
    ]);
    const target = path.join(root, "target.env");
    fs.writeFileSync(target, "ORIGINAL=1\n");
    fs.symlinkSync(target, path.join(root, ".env"));
    const result = run(script, root, [], "value\ny\n");
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /refusing symlink/);
    assert.equal(fs.readFileSync(target, "utf8"), "ORIGINAL=1\n");
  });
});

test("captured names stay isolated from runner state", (t) => {
  const outsideRoot = fs.mkdtempSync(path.join(os.tmpdir(), "matt-wizard-outside-root-"));
  const outsideEnv = path.join(outsideRoot, ".env");
  const cleanupTarget = path.join(outsideRoot, "keep-me");
  fs.writeFileSync(outsideEnv, "ORIGINAL=1\n");
  fs.writeFileSync(cleanupTarget, "KEEP\n");
  t.after(() => fs.rmSync(outsideRoot, { recursive: true, force: true }));

  const { root, script } = makeFixture(t, [
    ["total", "1"],
    ["banner", "Fixture setup"],
    ["stage", "Capture reserved-looking names"],
    ["ask_secret", "BOLD", "Hidden value:"],
    ["ask", "PATH", "Path value:"],
    ["ask", "WORK_ROOT", "Root value:"],
    ["ask", "_WIZARD_TMP", "Temporary value:"],
    ["ask", "ENV_FILE", "Env value:"],
    ["ask", "GH_REPO", "Repository value:"],
    ["ask", "DRY_RUN", "Dry-run value:"],
    ["ask", "API_TOKEN", "Token value:"],
    ["write_env", "API_TOKEN"],
    ["finish"],
  ]);
  const hidden = "fixture-hidden-value-131";
  const input = [
    "",
    hidden,
    "/not/a/command/path",
    outsideRoot,
    cleanupTarget,
    outsideEnv,
    "attacker/repo",
    "1",
    "demo",
    "y",
    "",
  ].join("\n");
  const result = run(script, root, [], input);

  assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
  assert.equal(fs.readFileSync(path.join(root, ".env"), "utf8"), "API_TOKEN=demo\n");
  assert.equal(fs.readFileSync(outsideEnv, "utf8"), "ORIGINAL=1\n");
  assert.equal(fs.readFileSync(cleanupTarget, "utf8"), "KEEP\n");
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(hidden));
});

test("explicit project root controls env writes regardless of cwd", (t) => {
  const { root, script } = makeFixture(t, [
    ["ask", "PUBLIC_MODE", "Mode:"],
    ["write_env", "PUBLIC_MODE"],
  ]);
  const unrelatedCwd = fs.mkdtempSync(path.join(os.tmpdir(), "matt-wizard-cwd-"));
  t.after(() => fs.rmSync(unrelatedCwd, { recursive: true, force: true }));

  const result = run(script, root, [], "demo\ny\n", {}, unrelatedCwd);
  assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
  assert.equal(fs.readFileSync(path.join(root, ".env"), "utf8"), "PUBLIC_MODE=demo\n");
  assert.equal(fs.existsSync(path.join(unrelatedCwd, ".env")), false);
  assert.ok(result.stdout.includes(path.join(root, ".env")));
});

test("terminal control characters are rejected before display", (t) => {
  const { root, script } = makeFixture(t, [["banner", "Unsafe\u001b[2Jtitle"]]);
  const result = run(script, root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /terminal control characters/);
  assert.doesNotMatch(result.stdout, /Unsafe/);

  for (const records of [
    [["unsafe\u001b[2Jop"]],
    [["ask", "BAD\u001b[2JNAME", "Value:"]],
  ]) {
    const fixture = makeFixture(t, records);
    const rejected = run(fixture.script, fixture.root);
    assert.notEqual(rejected.status, 0);
    assert.doesNotMatch(`${rejected.stdout}${rejected.stderr}`, /\u001b/);
  }
});

test("canonical project roots with terminal controls are rejected before display", (t) => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), "matt-wizard-canonical-"));
  t.after(() => fs.rmSync(parent, { recursive: true, force: true }));
  const realRoot = path.join(parent, "unsafe\u001b[2Jroot");
  const safeAlias = path.join(parent, "safe-root");
  fs.mkdirSync(realRoot);
  fs.symlinkSync(realRoot, safeAlias);
  const script = path.join(realRoot, "wizard.sh");
  fs.writeFileSync(script, `${template.slice(0, markerIndex)}#|BEGIN\n#|finish\n#|END\n`);

  const result = spawnSync("/bin/bash", [script, "--root", safeAlias], {
    cwd: parent,
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /canonical project root/);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /\u001b/);
});

test("browser navigation requires confirmation for the exact URL", (t) => {
  const { root, script } = makeFixture(t, [["open_url", "https://example.com/setup"]]);
  const bin = installFakeGh(root);
  const marker = path.join(root, "opened-url");
  fs.writeFileSync(path.join(bin, "open"), `#!/bin/sh\nprintf '%s' "$1" > "${marker}"\n`, { mode: 0o700 });

  const declined = run(script, root, [], "n\n", { PATH: `${bin}:/usr/bin:/bin` });
  assert.equal(declined.status, 0, `${declined.stderr}\n${declined.stdout}`);
  assert.equal(fs.existsSync(marker), false);
  assert.match(declined.stdout, /https:\/\/example\.com\/setup/);

  const approved = run(script, root, [], "y\n", { PATH: `${bin}:/usr/bin:/bin` });
  assert.equal(approved.status, 0, `${approved.stderr}\n${approved.stdout}`);
  assert.equal(fs.readFileSync(marker, "utf8"), "https://example.com/setup");
});

test("GitHub inference uses the approved project root, not the launch cwd", (t) => {
  const { root, script } = makeFixture(t, [
    ["ask_secret", "API_TOKEN", "API token:"],
    ["set_secret", "API_TOKEN"],
  ]);
  const bin = installFakeGh(root);
  const unrelatedCwd = fs.mkdtempSync(path.join(os.tmpdir(), "matt-wizard-gh-cwd-"));
  t.after(() => fs.rmSync(unrelatedCwd, { recursive: true, force: true }));
  const repoCwd = path.join(root, "repo.cwd");
  const result = run(script, root, [], "fixture-secret\ny\n", {
    PATH: `${bin}:/usr/bin:/bin`,
    WIZARD_GH_REPO_CWD: repoCwd,
    WIZARD_GH_SECRET_ARGS: path.join(root, "secret.args"),
    WIZARD_GH_SECRET_STDIN: path.join(root, "secret.stdin"),
    WIZARD_GH_VAR_ARGS: path.join(root, "var.args"),
  }, unrelatedCwd);

  assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
  assert.equal(fs.readFileSync(repoCwd, "utf8"), fs.realpathSync(root));
});

test("public captures cannot reuse dotenv values or reach GitHub secret sinks", (t) => {
  const { root, script } = makeFixture(t, [
    ["ask", "API_TOKEN", "API token:"],
    ["set_secret", "API_TOKEN"],
  ]);
  const existing = "existing-secret-197";
  fs.writeFileSync(path.join(root, ".env"), `API_TOKEN=${existing}\n`);
  const result = run(script, root, [], "\n");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /requires an ask_secret capture/);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(existing));
});

test("capture provenance cannot be forged by key collisions or inherited variables", async (t) => {
  await t.test("KIND-prefixed public capture cannot overwrite another capture's kind", () => {
    const { root, script } = makeFixture(t, [
      ["ask", "FOO", "Public value:"],
      ["ask", "KIND_FOO", "Collision value:"],
      ["set_secret", "FOO"],
    ]);
    const result = run(script, root, [], "public-value\nsecret\n", {
      PATH: "/usr/bin:/bin",
    });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /requires an ask_secret capture/);
  });

  await t.test("inherited capture variables do not create current-run provenance", () => {
    const { root, script } = makeFixture(t, [["set_secret", "FOO"]]);
    const result = run(script, root, [], "", {
      PATH: "/usr/bin:/bin",
      _WIZARD_CAPTURE_FOO: "inherited-value",
      _WIZARD_CAPTURE_KIND_FOO: "secret",
    });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /requires an ask_secret capture/);
    assert.doesNotMatch(`${result.stdout}${result.stderr}`, /inherited-value/);
  });
});

test("approved GitHub mutations bind to the displayed repo and pipe secrets over stdin", (t) => {
  const { root, script } = makeFixture(t, [
    ["total", "1"],
    ["banner", "Fixture setup"],
    ["stage", "Set GitHub values"],
    ["ask_secret", "API_TOKEN", "API token:"],
    ["set_secret", "API_TOKEN"],
    ["set_var", "PUBLIC_MODE", "demo"],
    ["finish"],
  ]);
  const bin = installFakeGh(root);
  const secretArgs = path.join(root, "secret.args");
  const secretStdin = path.join(root, "secret.stdin");
  const varArgs = path.join(root, "var.args");
  const result = run(script, root, [], "\nfixture-secret-value-91\ny\ny\n", {
    PATH: `${bin}:/usr/bin:/bin`,
    GH_HOST: "attacker.example",
    WIZARD_GH_SECRET_ARGS: secretArgs,
    WIZARD_GH_SECRET_STDIN: secretStdin,
    WIZARD_GH_VAR_ARGS: varArgs,
  });

  assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
  assert.equal(fs.readFileSync(secretArgs, "utf8"), "secret set API_TOKEN --repo github.com/owner/fixture\n");
  assert.equal(fs.readFileSync(secretStdin, "utf8"), "fixture-secret-value-91");
  assert.equal(fs.readFileSync(varArgs, "utf8"), "variable set PUBLIC_MODE --repo github.com/owner/fixture --body demo\n");
  assert.match(result.stdout, /github\.com\/owner\/fixture/);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /fixture-secret-value-91/);
});

test("missing GitHub CLI fails safe and records the skipped manual follow-up", (t) => {
  const { root, script } = makeFixture(t, [
    ["total", "1"],
    ["banner", "Fixture setup"],
    ["stage", "Set GitHub secret"],
    ["ask_secret", "API_TOKEN", "API token:"],
    ["set_secret", "API_TOKEN"],
    ["finish"],
  ]);
  const emptyBin = path.join(root, "empty-bin");
  fs.mkdirSync(emptyBin);
  const result = run(script, root, [], "\nfixture-secret-value-113\n", { PATH: emptyBin });

  assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
  assert.match(`${result.stdout}${result.stderr}`, /gh is unavailable or unauthenticated/);
  assert.match(result.stdout, /skipped actions/);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /fixture-secret-value-113/);
});

test("fixture ENV_FILE cannot escape and stage records cannot execute shell text", (t) => {
  const outside = path.join(os.tmpdir(), `matt-wizard-outside-${process.pid}`);
  fs.writeFileSync(outside, "ORIGINAL=1\n");
  t.after(() => fs.rmSync(outside, { force: true }));

  const { root, script } = makeFixture(t, [
    ["ask", "PUBLIC_MODE", "Mode:"],
    ["write_env", "PUBLIC_MODE"],
  ]);
  const result = run(script, root, [], "demo\ny\n", { ENV_FILE: outside });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /project root/);
  assert.equal(fs.readFileSync(outside, "utf8"), "ORIGINAL=1\n");
  assert.equal(fs.existsSync(path.join(root, ".env")), false);

  fs.writeFileSync(
    script,
    `${template.slice(0, markerIndex)}#|BEGIN\ntouch ${path.join(root, "executed")}\n#|END\n`,
    { mode: 0o700 },
  );
  const rejected = run(script, root);
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /executable text/);
  assert.equal(fs.existsSync(path.join(root, "executed")), false);
});
