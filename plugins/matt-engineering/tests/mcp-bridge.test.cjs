"use strict";

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { EventEmitter } = require("node:events");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  HOT_ATTACH_MARKER,
  ROUTE_NAMES,
  TOOL_NAME,
  callTool,
  directMarkdownReferences,
  handleDecodedMessage,
  handleRpc,
  loadWorkflowBundle,
  MAX_RPC_BATCH_ITEMS,
  MAX_RPC_FRAME_BYTES,
  renderToolText,
  routeRequest,
  toolDefinitions,
  writeRpc,
} = require("../mcp/server.cjs");

const ROUTING_CASES = [
  ["Which Matt workflow should I use?", "ask-matt"],
  ["Review the uncommitted diff against the ticket.", "code-review"],
  ["Design a deep module and a clean test seam.", "codebase-design"],
  ["This flaky bug has an unknown cause.", "diagnosing-bugs"],
  ["Sharpen the domain model and glossary.", "domain-modeling"],
  ["Challenge this design one question at a time.", "grill-with-docs"],
  ["Create a handoff so I can continue in a new task.", "handoff"],
  ["The root cause is known; implement the bug fix.", "implement"],
  ["检查已有项目的产品架构和代码结构，找出重构候选。", "improve-codebase-architecture"],
  ["Build a throwaway prototype to compare UI variants.", "prototype"],
  ["Research this API from official primary sources.", "research"],
  ["Resolve the current rebase conflict.", "resolving-merge-conflicts"],
  ["Use setup-matt-pocock-skills to configure this repository.", "setup-matt-pocock-skills"],
  ["Implement this behavior test-first with TDD.", "tdd"],
  ["Turn this discussion into a spec.", "to-spec"],
  ["Split this plan into implementation tickets.", "to-tickets"],
  ["Triage this incoming external PR.", "triage"],
  ["Use Wayfinder for this multi-session destination.", "wayfinder"],
  ["Generate an interactive setup wizard for this manual third-party dashboard.", "wizard"],
];

test("routes representative intent to every Matt Engineering workflow", () => {
  for (const [request, expectedRoute] of ROUTING_CASES) {
    assert.equal(routeRequest(request).route, expectedRoute, request);
  }
});

test("honors explicit installed workflow names, including the plugin display-name prefix", () => {
  for (const route of ROUTE_NAMES) {
    const displayRoute = route.replaceAll("-", " ");
    const result = routeRequest(`Use Matt Pocock Engineering Next ${displayRoute} for this task.`);
    assert.equal(result.route, route, displayRoute);
    assert.equal(result.explicitlySelected, true, displayRoute);
  }

  const wizard = routeRequest("Use Matt Pocock Engineering Next Wizard in this existing task.");
  assert.equal(wizard.route, "wizard");
  assert.equal(wizard.explicitlySelected, true);
  assert.notEqual(routeRequest("Do not use Wizard; write a normal Bash script.").route, "wizard");
});

test("keeps Setup and Wayfinder explicit-only", () => {
  const setup = routeRequest("Configure Matt workflows across this repository.");
  assert.equal(setup.route, "ask-matt");
  assert.equal(setup.recommendedExplicitRoute, "setup-matt-pocock-skills");
  assert.equal(setup.requiresExplicitSelection, true);

  const wayfinder = routeRequest("Map this huge foggy multi-session destination.");
  assert.equal(wayfinder.route, "ask-matt");
  assert.equal(wayfinder.recommendedExplicitRoute, "wayfinder");
  assert.equal(wayfinder.requiresExplicitSelection, true);

  const wayfinderQuestion = routeRequest("Should I use Wayfinder for this project?");
  assert.equal(wayfinderQuestion.route, "ask-matt");
  assert.equal(wayfinderQuestion.recommendedExplicitRoute, "wayfinder");

  const setupQuestion = routeRequest("我是否应该使用 setup-matt-pocock-skills？");
  assert.equal(setupQuestion.route, "ask-matt");
  assert.equal(setupQuestion.recommendedExplicitRoute, "setup-matt-pocock-skills");
});

test("prioritizes a concrete requested discipline over incidental bug wording", () => {
  assert.equal(routeRequest("Review the diff for this flaky bug.").route, "code-review");
  assert.equal(routeRequest("Turn the resolved bug discussion into a spec.").route, "to-spec");
  assert.equal(routeRequest("Fix this regression test-first with TDD.").route, "tdd");
});

test("keeps Wizard discovery narrow and proposal-only", () => {
  assert.equal(
    routeRequest("Build a manual setup wizard for this human-only setup.").route,
    "wizard",
  );
  assert.notEqual(routeRequest("Add DATABASE_URL to .env.example.").route, "wizard");
  assert.notEqual(routeRequest("Write a normal Bash build script.").route, "wizard");
  assert.notEqual(routeRequest("Run the database migration with the CLI.").route, "wizard");

  const result = callTool(TOOL_NAME, {
    request: "Generate an interactive setup wizard for this manual third-party dashboard.",
  });
  assert.equal(result.route, "wizard");
  assert.match(result.execution_contract.join("\n"), /stage proposal only/i);
  assert.match(result.execution_contract.join("\n"), /explicit authorization/i);
});

test("loads the exact installed skill plus the packaged Markdown reference closure", () => {
  for (const route of ROUTE_NAMES) {
    const bundle = loadWorkflowBundle(route);
    const paths = bundle.documents.map((document) => document.path);
    assert.equal(paths[0], `skills/${route}/SKILL.md`);
    assert.ok(paths.includes("references/routing-policy.md"));
    assert.ok(paths.includes("references/quality-baseline.md"));
    assert.ok(paths.includes("references/optional-enhancements.md"));
    assert.ok(bundle.totalBytes > 0);
    assert.ok(bundle.totalBytes <= 48 * 1024);
  }

  const architecture = loadWorkflowBundle("improve-codebase-architecture");
  const architecturePaths = architecture.documents.map((document) => document.path);
  assert.ok(architecturePaths.includes("skills/improve-codebase-architecture/LANGUAGE.md"));
  assert.ok(architecturePaths.includes("skills/improve-codebase-architecture/INTERFACE-DESIGN.md"));
  assert.ok(architecturePaths.includes("skills/improve-codebase-architecture/DEEPENING.md"));
});

test("rejects unsupported Markdown link syntax before publication or bundling", () => {
  for (const markdown of [
    "[guide]: ./guide.md",
    "<https://example.com>",
    "<ftp://example.com/file>",
    '<a href="https://example.com">guide</a>',
    '<img src="https://example.com/icon.png">',
    '<iframe src="https://example.com"></iframe>',
    '<meta http-equiv="refresh" content="0; url=https://example.com">',
    "![nested [image]](https://example.com/icon.png)",
    "[nested [label]](https://example.com)",
    "[escaped \\]](https://example.com)",
    "`<iframe src=\"https://example.com\">``",
    "```bad`info\n<iframe src=\"https://example.com\">\n```",
    "[encoded scheme](java&#x73;cript:alert)",
    "[escaped scheme](java\\script:alert)",
  ]) {
    assert.throws(
      () => directMarkdownReferences("skills/example/SKILL.md", markdown),
      /unsupported link (?:syntax|target)/,
    );
  }

  assert.deepEqual(
    directMarkdownReferences(
      "skills/example/SKILL.md",
      "`<iframe src=\"https://example.com\">`\n~~~html\n<img src=\"https://example.com\">\n~~~",
    ),
    [],
  );
});

test("packaged MCP launch record resolves to the audited bridge", () => {
  const pluginRoot = path.resolve(__dirname, "..");
  const config = JSON.parse(fs.readFileSync(path.join(pluginRoot, ".mcp.json"), "utf8"));
  const server = config.mcpServers.mattEngineeringCompatibilityBridge;
  assert.deepEqual(Object.keys(server).sort(), ["args", "command", "cwd", "description", "title"]);
  assert.equal(server.cwd, ".");
  assert.equal(fs.realpathSync(path.resolve(pluginRoot, server.cwd)), pluginRoot);
  assert.equal(
    fs.realpathSync(path.resolve(pluginRoot, server.cwd, server.args[0])),
    fs.realpathSync(path.join(pluginRoot, "mcp", "server.cjs")),
  );
});

test("returns a read-only bridge contract without disabling host-agent execution", () => {
  const result = callTool(TOOL_NAME, {
    request: "检查已有项目的产品架构和代码结构。",
  });
  assert.equal(result.hot_attach_marker, HOT_ATTACH_MARKER);
  assert.equal(result.route, "improve-codebase-architecture");
  assert.match(result.execution_contract.join("\n"), /host agent may use/i);
  assert.match(result.execution_contract.join("\n"), /bridge itself is read-only/i);
  assert.match(renderToolText(result), /Packaged source: skills\/improve-codebase-architecture\/SKILL\.md/);
});

test("exposes one deferred-compatible read-only tool", () => {
  const tools = toolDefinitions();
  assert.equal(tools.length, 1);
  assert.equal(tools[0].name, TOOL_NAME);
  assert.equal(tools[0].annotations.readOnlyHint, true);
  assert.equal(tools[0].annotations.destructiveHint, false);
  assert.equal(tools[0].inputSchema.additionalProperties, false);
  assert.equal(tools[0].inputSchema.properties.request.maxLength, 20_000);
});

test("supports MCP initialize, list, and call", async () => {
  const initialized = await handleRpc({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2024-11-05" },
  });
  assert.equal(initialized.result.serverInfo.name, "matt-engineering-compatibility-bridge");

  const listed = await handleRpc({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  assert.equal(listed.result.tools[0].name, TOOL_NAME);

  const called = await handleRpc({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: { name: TOOL_NAME, arguments: { request: "Review the uncommitted diff." } },
  });
  assert.equal(called.result.structuredContent.route, "code-review");
  assert.equal(called.result.isError, false);
});

test("bounds JSON-RPC batches and raw stdio frames", async () => {
  const oversizedBatch = Array.from({ length: MAX_RPC_BATCH_ITEMS + 1 }, () => ({
    jsonrpc: "2.0",
    id: 1,
    method: "ping",
  }));
  const batchResult = await handleDecodedMessage(oversizedBatch);
  assert.equal(batchResult.error.code, -32600);

  const serverPath = path.join(__dirname, "..", "mcp", "server.cjs");
  const frameResult = spawnSync(process.execPath, [serverPath], {
    encoding: "utf8",
    input: `${"x".repeat(MAX_RPC_FRAME_BYTES + 1)}\n`,
  });
  assert.equal(frameResult.status, 0, frameResult.stderr);
  assert.equal(JSON.parse(frameResult.stdout).error.code, -32600);
});

test("waits for stdout drain before completing a response write", async () => {
  const output = new EventEmitter();
  output.write = () => false;
  let settled = false;
  const pending = writeRpc({ jsonrpc: "2.0", id: 1, result: {} }, output).then(() => {
    settled = true;
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(settled, false);
  output.emit("drain");
  await pending;
  assert.equal(settled, true);
});
