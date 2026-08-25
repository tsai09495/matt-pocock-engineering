#!/usr/bin/env node

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { once } = require("node:events");

const PLUGIN_ROOT = fs.realpathSync(path.resolve(__dirname, ".."));
const SERVER_NAME = "matt-engineering-compatibility-bridge";
const TOOL_NAME = "route_matt_engineering";
const HOT_ATTACH_MARKER = "MATT_ENGINEERING_FORMAL_BRIDGE_2_2";
const MAX_BUNDLE_BYTES = 48 * 1024;
const MAX_BUNDLE_DOCUMENTS = 24;
const MAX_REQUEST_CHARS = 20_000;
const MAX_MANIFEST_BYTES = 16 * 1024;
const MAX_RPC_FRAME_BYTES = 256 * 1024;
const MAX_RPC_BATCH_ITEMS = 16;

const GLOBAL_POLICY_PATHS = [
  "references/routing-policy.md",
  "references/quality-baseline.md",
  "references/optional-enhancements.md",
];

const ROUTE_NAMES = [
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
];

const SERVER_INSTRUCTIONS = [
  "This server is the read-only compatibility layer for the Matt Pocock Engineering plugin.",
  "Use its single tool only when the user explicitly selected Matt Pocock Engineering in an existing task and the normal matt-engineering skills are unavailable.",
  "The tool reads only Markdown packaged inside this plugin, routes the request, and returns the exact installed workflow and policy references.",
  "After it returns, treat the loaded workflow as active instructions and continue the user's original request with the host agent's normal tools.",
  "The bridge itself grants no side-effect authority; user intent, system permissions, and the loaded workflow still control edits, commands, Git, trackers, subagents, branches, and worktrees.",
].join(" ");

const ASK_MATT_TERMS = [
  "which matt workflow",
  "which workflow",
  "where should i start",
  "which skill",
  "哪个 matt 工作流",
  "哪个工作流",
  "从哪里开始",
  "应该用哪个 skill",
];

const SETUP_RECOMMENDATION_TERMS = [
  "repository-wide matt configuration",
  "configure matt workflows",
  "configure issue tracker",
  "配置整个仓库的 matt",
  "配置 matt 工作流",
  "配置 issue tracker",
  "初始化 matt 工作流",
];

const WAYFINDER_RECOMMENDATION_TERMS = [
  "huge foggy multi-session",
  "dependent unknowns",
  "multi-session destination",
  "大型模糊工作",
  "多任务迷雾",
  "多会话目标",
  "相互依赖的未知项",
];

const EXPLICIT_ROUTE_QUESTION_PATTERNS = [
  {
    route: "setup-matt-pocock-skills",
    patterns: [
      /\bshould i use\s+(?:the\s+)?setup-matt-pocock-skills\b/i,
      /\bdo i need\s+(?:the\s+)?setup-matt-pocock-skills\b/i,
      /(?:是否|要不要|需不需要).*setup-matt-pocock-skills/i,
    ],
  },
  {
    route: "wayfinder",
    patterns: [
      /\bshould i use\s+(?:the\s+)?wayfinder\b/i,
      /\bdo i need\s+(?:the\s+)?wayfinder\b/i,
      /(?:是否|要不要|需不需要).*wayfinder/i,
    ],
  },
];

const ROUTE_RULES = [
  {
    route: "resolving-merge-conflicts",
    terms: ["merge conflict", "rebase conflict", "conflict marker", "合并冲突", "变基冲突", "冲突标记"],
  },
  {
    route: "code-review",
    terms: ["code review", "review the diff", "review uncommitted", "review the uncommitted", "review this branch", "review this pr", "代码审查", "审查改动", "审查未提交", "审查分支", "审查 pr"],
  },
  {
    route: "triage",
    terms: ["triage", "incoming issue", "external pr", "label this issue", "close this issue", "分诊", "外部 issue", "外部 pr", "给 issue 打标签", "关闭 issue"],
  },
  {
    route: "grill-with-docs",
    terms: ["challenge this design", "challenge this plan", "grill this", "frontier round", "decision round", "one question at a time", "质疑这个设计", "挑战这个计划", "决策轮次", "逐个问题澄清", "一问一答"],
  },
  {
    route: "to-tickets",
    terms: ["split into tickets", "break into tickets", "implementation tickets", "implementation issues", "拆分为 tickets", "拆分成工单", "拆分任务", "实施 issues"],
  },
  {
    route: "to-spec",
    terms: ["turn this into a spec", "turn this discussion into a spec", "into a spec", "write a spec", "write a prd", "requirements document", "转成 spec", "把讨论转成 spec", "写成 prd", "整理为需求文档", "形成规格"],
  },
  {
    route: "prototype",
    terms: ["throwaway prototype", "build a prototype", "runnable exploration", "compare ui variants", "抛弃式原型", "构建原型", "可运行探索", "对比 ui 方案"],
  },
  {
    route: "wizard",
    terms: ["interactive setup wizard", "manual setup wizard", "human-only setup", "manual third-party dashboard", "human-driven cutover", "人工配置向导", "人工设置向导", "第三方控制台向导", "人工切换向导"],
  },
  {
    route: "tdd",
    terms: ["test driven", "test-driven", "test first", "test-first", "red green refactor", "tdd", "测试驱动", "测试先行", "红绿重构"],
  },
  {
    route: "research",
    terms: ["primary-source research", "primary sources", "official primary sources", "research official", "research this api", "technical research", "一手资料研究", "调研官方资料", "技术调研", "研究这个 api"],
  },
  {
    route: "codebase-design",
    terms: ["deep module", "interface design", "test seam", "module boundary", "深模块", "接口设计", "测试接缝", "模块边界"],
  },
  {
    route: "domain-modeling",
    terms: ["domain model", "domain language", "ubiquitous language", "glossary", "领域模型", "领域语言", "统一语言", "术语表"],
  },
  {
    route: "improve-codebase-architecture",
    terms: ["architecture health", "architecture review", "product architecture", "code structure", "refactoring candidates", "coupling", "maintainability", "架构健康", "架构审查", "产品架构", "代码结构", "重构候选", "耦合", "可维护性"],
  },
  {
    route: "handoff",
    terms: ["handoff", "continue in a new task", "continue in a new thread", "交接", "移交", "新任务继续", "新线程继续"],
  },
  {
    route: "implement",
    terms: ["implement this ticket", "implement this spec", "build this issue", "make this change", "实现这个 ticket", "实现这个 spec", "开发这个 issue", "完成这个改动"],
  },
];

const BUG_TERMS = [
  "bug",
  "regression",
  "flaky",
  "intermittent failure",
  "performance problem",
  "故障",
  "回归",
  "不稳定",
  "间歇性失败",
  "性能问题",
];

const UNKNOWN_CAUSE_TERMS = [
  "unknown cause",
  "cause is unclear",
  "cannot reproduce",
  "not reproduced",
  "flaky",
  "根因不明",
  "原因不清楚",
  "无法复现",
  "尚未复现",
  "尚未定位",
  "不稳定",
];

const KNOWN_CAUSE_TERMS = [
  "known cause",
  "root cause is",
  "cause identified",
  "fix is clear",
  "根因已知",
  "已定位根因",
  "原因明确",
  "修复方案明确",
];

const IMPLEMENT_TERMS = [
  "implement",
  "fix",
  "build",
  "change",
  "实现",
  "修复",
  "开发",
  "修改",
];

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizedRequest(request) {
  return request.toLowerCase().replace(/\s+/g, " ").trim();
}

function matchedTerms(normalized, terms) {
  return terms.filter((term) => normalized.includes(term.toLowerCase()));
}

function decision(route, terms = [], extra = {}) {
  return { route, matchedTerms: terms, ...extra };
}

function routeNamePattern(route) {
  return route
    .split("-")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[\\s:-]+");
}

function explicitlyRequestedRoute(request) {
  for (const route of ROUTE_NAMES) {
    const routePattern = routeNamePattern(route);
    const pluginPrefix = "(?:matt(?:\\s+pocock)?\\s+engineering(?:\\s+next)?(?:\\s+|:))?";
    const patterns = [
      new RegExp(
        `(?:^|[.!?]\\s+)(?:please\\s+)?(?:use|run|invoke|select|load)\\s+(?:the\\s+)?${pluginPrefix}${routePattern}(?=\\s|[.:,;!?]|$)`,
        "i",
      ),
      new RegExp(
        `(?:^|[。！？]\\s*)(?:请)?(?:使用|运行|调用|选择|加载)\\s*${pluginPrefix}${routePattern}(?=\\s|[。！？，、：；]|$)`,
        "i",
      ),
      new RegExp(`^/?${routePattern}\\s*:`, "i"),
    ];

    if (patterns.some((pattern) => pattern.test(request))) {
      return decision(route, [route], { explicitlySelected: true });
    }
  }
  return null;
}

function routeRequest(request) {
  const normalized = normalizedRequest(request);

  const askTerms = matchedTerms(normalized, ASK_MATT_TERMS);
  if (askTerms.length > 0) return decision("ask-matt", askTerms);

  for (const question of EXPLICIT_ROUTE_QUESTION_PATTERNS) {
    if (question.patterns.some((pattern) => pattern.test(request))) {
      return decision("ask-matt", [question.route], {
        recommendedExplicitRoute: question.route,
        requiresExplicitSelection: true,
      });
    }
  }

  const explicitRoute = explicitlyRequestedRoute(request);
  if (explicitRoute) return explicitRoute;

  const setupTerms = matchedTerms(normalized, SETUP_RECOMMENDATION_TERMS);
  if (setupTerms.length > 0) {
    return decision("ask-matt", setupTerms, {
      recommendedExplicitRoute: "setup-matt-pocock-skills",
      requiresExplicitSelection: true,
    });
  }

  const wayfinderTerms = matchedTerms(normalized, WAYFINDER_RECOMMENDATION_TERMS);
  if (wayfinderTerms.length > 0) {
    return decision("ask-matt", wayfinderTerms, {
      recommendedExplicitRoute: "wayfinder",
      requiresExplicitSelection: true,
    });
  }

  for (const rule of ROUTE_RULES.filter((candidate) => candidate.route !== "implement")) {
    const terms = matchedTerms(normalized, rule.terms);
    if (terms.length > 0) return decision(rule.route, terms);
  }

  const bugTerms = matchedTerms(normalized, BUG_TERMS);
  if (bugTerms.length > 0) {
    const knownTerms = matchedTerms(normalized, KNOWN_CAUSE_TERMS);
    const implementationTerms = matchedTerms(normalized, IMPLEMENT_TERMS);
    if (knownTerms.length > 0 && implementationTerms.length > 0) {
      return decision("implement", [...bugTerms, ...knownTerms, ...implementationTerms]);
    }
    const unknownTerms = matchedTerms(normalized, UNKNOWN_CAUSE_TERMS);
    return decision("diagnosing-bugs", [...bugTerms, ...unknownTerms]);
  }

  const implementRule = ROUTE_RULES.find((candidate) => candidate.route === "implement");
  const implementRuleTerms = matchedTerms(normalized, implementRule.terms);
  if (implementRuleTerms.length > 0) return decision("implement", implementRuleTerms);

  return decision("ask-matt");
}

function pluginVersion() {
  const candidate = path.join(PLUGIN_ROOT, ".codex-plugin", "plugin.json");
  const manifestPath = fs.realpathSync(candidate);
  const stat = fs.statSync(manifestPath);
  if (!isInsidePlugin(manifestPath) || !stat.isFile() || stat.size > MAX_MANIFEST_BYTES) {
    throw new Error("refusing invalid packaged manifest");
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (typeof manifest.version !== "string" || manifest.version.length > 64) {
    throw new Error("packaged manifest has an invalid version");
  }
  return manifest.version;
}

function isInsidePlugin(candidate) {
  const relative = path.relative(PLUGIN_ROOT, candidate);
  return relative !== "" && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

function readPackagedMarkdown(relativePath, maxBytes = MAX_BUNDLE_BYTES) {
  const candidate = path.resolve(PLUGIN_ROOT, relativePath);
  if (!isInsidePlugin(candidate) || path.extname(candidate).toLowerCase() !== ".md") {
    throw new Error(`refusing non-plugin Markdown path: ${relativePath}`);
  }
  const realPath = fs.realpathSync(candidate);
  if (!isInsidePlugin(realPath)) {
    throw new Error(`refusing Markdown symlink outside plugin: ${relativePath}`);
  }
  const stat = fs.statSync(realPath);
  if (!stat.isFile() || stat.size > maxBytes) {
    throw new Error(`packaged Markdown exceeds remaining bundle budget: ${relativePath}`);
  }
  return fs.readFileSync(realPath, "utf8");
}

function isEscaped(text, index) {
  let slashes = 0;
  for (let cursor = index - 1; cursor >= 0 && text[cursor] === "\\"; cursor -= 1) slashes += 1;
  return slashes % 2 === 1;
}

function stripInlineCode(line) {
  let output = "";
  let cursor = 0;
  while (cursor < line.length) {
    if (line[cursor] !== "`" || isEscaped(line, cursor)) {
      output += line[cursor];
      cursor += 1;
      continue;
    }
    let openingEnd = cursor;
    while (line[openingEnd] === "`") openingEnd += 1;
    const delimiterLength = openingEnd - cursor;
    let search = openingEnd;
    let closingStart = -1;
    while (search < line.length) {
      const candidate = line.indexOf("`", search);
      if (candidate < 0) break;
      let candidateEnd = candidate;
      while (line[candidateEnd] === "`") candidateEnd += 1;
      if (!isEscaped(line, candidate) && candidateEnd - candidate === delimiterLength) {
        closingStart = candidate;
        break;
      }
      search = candidateEnd;
    }
    if (closingStart < 0) {
      output += line.slice(cursor);
      break;
    }
    output += " ".repeat(closingStart + delimiterLength - cursor);
    cursor = closingStart + delimiterLength;
  }
  return output;
}

function markdownProse(markdown) {
  const prose = [];
  let fenceCharacter = null;
  let fenceLength = 0;
  for (const line of markdown.split("\n")) {
    if (fenceCharacter === null) {
      const fence = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (fence && !(fence[1][0] === "`" && fence[2].includes("`"))) {
        const character = fence[1][0];
        fenceCharacter = character;
        fenceLength = fence[1].length;
        continue;
      }
      prose.push(stripInlineCode(line));
    } else {
      const closingFence = line.match(/^ {0,3}(`+|~+)[ \t]*$/);
      if (
        closingFence
        && closingFence[1][0] === fenceCharacter
        && closingFence[1].length >= fenceLength
      ) {
        fenceCharacter = null;
        fenceLength = 0;
      }
    }
  }
  return prose.join("\n");
}

function directMarkdownReferences(sourceRelativePath, markdown) {
  const sourceAbsolutePath = path.resolve(PLUGIN_ROOT, sourceRelativePath);
  const links = [];
  const prose = markdownProse(markdown);
  const pattern = /\[([^\]\n]+)\]\(([^)\n]+)\)/g;
  const unsupportedRemainder = prose.replace(pattern, "");
  if (
    /^[ \t]{0,3}\[[^\n]+\]:/m.test(prose)
    || /<[^>]*>/.test(prose)
    || /!\s*\[/.test(prose)
    || /\]\s*(?:\(|\[)/.test(unsupportedRemainder)
  ) {
    throw new Error(`unsupported link syntax in packaged Markdown: ${sourceRelativePath}`);
  }
  let match;
  while ((match = pattern.exec(prose)) !== null) {
    let target = match[2].trim();
    if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
    target = target.split("#", 1)[0].split("?", 1)[0].trim();
    if (/[\\&\u0000-\u0020]/.test(target)) {
      throw new Error(`unsupported link target in packaged Markdown: ${sourceRelativePath}`);
    }
    const scheme = target.match(/^([a-z][a-z0-9+.-]*):/i);
    if (scheme) {
      if (scheme[1].toLowerCase() !== "https") {
        throw new Error(`unsupported link target in packaged Markdown: ${sourceRelativePath}`);
      }
      continue;
    }
    if (!target) continue;
    if (path.isAbsolute(target)) {
      throw new Error(`unsupported link target in packaged Markdown: ${sourceRelativePath}`);
    }
    const absoluteTarget = path.resolve(path.dirname(sourceAbsolutePath), target);
    if (!isInsidePlugin(absoluteTarget)) {
      throw new Error(`unsupported link target in packaged Markdown: ${sourceRelativePath}`);
    }
    if (!fs.existsSync(absoluteTarget) || !fs.statSync(absoluteTarget).isFile()) {
      throw new Error(`broken Markdown link in packaged source: ${sourceRelativePath}`);
    }
    if (path.extname(absoluteTarget).toLowerCase() !== ".md") continue;
    links.push(path.relative(PLUGIN_ROOT, absoluteTarget));
  }
  return links;
}

function loadWorkflowBundle(route) {
  if (!ROUTE_NAMES.includes(route)) throw new Error(`unknown Matt Engineering route: ${route}`);

  const skillPath = `skills/${route}/SKILL.md`;
  const queue = [
    skillPath,
    ...GLOBAL_POLICY_PATHS,
  ];
  const seen = new Set();
  const documents = [];
  let totalBytes = 0;

  while (queue.length > 0) {
    const relativePath = queue.shift();
    if (seen.has(relativePath)) continue;
    seen.add(relativePath);

    if (documents.length >= MAX_BUNDLE_DOCUMENTS) {
      throw new Error(`workflow bundle exceeds ${MAX_BUNDLE_DOCUMENTS} Markdown documents`);
    }
    const markdown = readPackagedMarkdown(relativePath, MAX_BUNDLE_BYTES - totalBytes);
    totalBytes += Buffer.byteLength(markdown, "utf8");
    if (totalBytes > MAX_BUNDLE_BYTES) {
      throw new Error(`workflow bundle is ${totalBytes} bytes; maximum is ${MAX_BUNDLE_BYTES}`);
    }
    documents.push({ path: relativePath, markdown });

    for (const linkedPath of directMarkdownReferences(relativePath, markdown)) {
      if (!seen.has(linkedPath)) queue.push(linkedPath);
    }
  }

  return { documents, totalBytes };
}

function callTool(name, args) {
  if (name !== TOOL_NAME) throw new Error(`unknown tool: ${name}`);
  const request = typeof args.request === "string" ? args.request.trim() : "";
  if (!request) throw new Error("request must be a non-empty string");
  if (request.length > MAX_REQUEST_CHARS) {
    throw new Error(`request must be at most ${MAX_REQUEST_CHARS} characters`);
  }

  const routeDecision = routeRequest(request);
  const workflow = loadWorkflowBundle(routeDecision.route);
  return {
    ok: true,
    hot_attach_marker: HOT_ATTACH_MARKER,
    plugin_version: pluginVersion(),
    route: routeDecision.route,
    matched_terms: routeDecision.matchedTerms,
    explicitly_selected: routeDecision.explicitlySelected || false,
    recommended_explicit_route: routeDecision.recommendedExplicitRoute || null,
    requires_explicit_selection: routeDecision.requiresExplicitSelection || false,
    source_documents: workflow.documents,
    bundle_bytes: workflow.totalBytes,
    execution_contract: [
      "Treat the loaded SKILL.md and references as active Matt Pocock Engineering instructions, then continue the user's original request instead of stopping at a route announcement.",
      "The bridge itself is read-only and reads only packaged workflow Markdown.",
      "The host agent may use its existing file, shell, edit, Git, tracker, subagent, branch, or worktree tools only when the user's request, system permissions, and loaded workflow put that action in scope.",
      "Review-only requests remain read-only. Scoped implementation permits necessary edits and verification, but not commit or publication unless the user explicitly authorized them.",
      "Subagents, branches, worktrees, background work, tracker mutation, and other heavy or external actions remain explicit optional enhancements.",
      "A Wizard route permits read-only discovery and an in-chat stage proposal only; script creation, execution, browser actions, local configuration, GitHub mutations, documentation edits, and commits require applicable explicit authorization.",
    ],
    compatibility_note: "Use this bridge only for existing tasks that cannot see native matt-engineering skills. Fresh tasks should use the native skills directly.",
  };
}

function renderToolText(payload) {
  const metadata = {
    ok: payload.ok,
    hot_attach_marker: payload.hot_attach_marker,
    plugin_version: payload.plugin_version,
    route: payload.route,
    matched_terms: payload.matched_terms,
    explicitly_selected: payload.explicitly_selected,
    recommended_explicit_route: payload.recommended_explicit_route,
    requires_explicit_selection: payload.requires_explicit_selection,
    bundle_bytes: payload.bundle_bytes,
    execution_contract: payload.execution_contract,
    compatibility_note: payload.compatibility_note,
  };
  const sections = [
    "# Matt Pocock Engineering compatibility workflow",
    "",
    "Use the loaded workflow below as active instructions and continue the original user request.",
    "",
    "```json",
    JSON.stringify(metadata, null, 2),
    "```",
  ];
  for (const document of payload.source_documents) {
    sections.push("", `## Packaged source: ${document.path}`, "", document.markdown);
  }
  return sections.join("\n");
}

function toolDefinitions() {
  return [
    {
      name: TOOL_NAME,
      title: "Load Matt Pocock Engineering workflow",
      description: "Use only when the user explicitly selected Matt Pocock Engineering in an existing task and native matt-engineering skills are unavailable. Routes the request and loads the exact installed skill and policy Markdown. The bridge is read-only; after it returns, continue with the host agent's normal tools within the user's scope and workflow authorization boundaries.",
      inputSchema: {
        type: "object",
        properties: {
          request: {
            type: "string",
            description: "The user's complete engineering request, preserving concrete intent and constraints.",
            maxLength: MAX_REQUEST_CHARS,
          },
        },
        required: ["request"],
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
  ];
}

function toolResult(payload) {
  const structuredContent = {
    ok: payload.ok,
    hot_attach_marker: payload.hot_attach_marker,
    plugin_version: payload.plugin_version,
    route: payload.route,
    matched_terms: payload.matched_terms,
    explicitly_selected: payload.explicitly_selected,
    recommended_explicit_route: payload.recommended_explicit_route,
    requires_explicit_selection: payload.requires_explicit_selection,
    loaded_paths: payload.source_documents.map((document) => document.path),
    bundle_bytes: payload.bundle_bytes,
    execution_contract: payload.execution_contract,
    compatibility_note: payload.compatibility_note,
  };
  return {
    content: [{ type: "text", text: renderToolText(payload) }],
    structuredContent,
    isError: false,
  };
}

function toolError(message) {
  const payload = { ok: false, error: message };
  return {
    content: [{ type: "text", text: JSON.stringify(payload) }],
    structuredContent: payload,
    isError: true,
  };
}

function rpcResponse(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function rpcError(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

async function handleRpc(message) {
  if (!isPlainObject(message)) return rpcError(null, -32600, "Invalid Request");
  const messageId = message.id;
  const method = message.method;
  const params = isPlainObject(message.params) ? message.params : {};
  if (typeof method !== "string") {
    return messageId != null ? rpcError(messageId, -32600, "Invalid Request") : null;
  }
  if (method.startsWith("notifications/") || method === "$/cancelRequest") return null;

  try {
    if (method === "initialize") {
      return rpcResponse(messageId, {
        protocolVersion: params.protocolVersion || "2024-11-05",
        capabilities: { tools: { listChanged: false } },
        serverInfo: {
          name: SERVER_NAME,
          title: "Matt Pocock Engineering Compatibility Bridge",
          version: pluginVersion(),
          description: "Read-only existing-task loader for installed Matt Pocock Engineering workflows.",
        },
        instructions: SERVER_INSTRUCTIONS,
      });
    }
    if (method === "ping") return rpcResponse(messageId, {});
    if (method === "tools/list") return rpcResponse(messageId, { tools: toolDefinitions() });
    if (method === "tools/call") {
      const name = params.name;
      const args = params.arguments || {};
      if (typeof name !== "string") return rpcError(messageId, -32602, "tools/call requires a tool name");
      if (!isPlainObject(args)) return rpcError(messageId, -32602, "tools/call arguments must be an object");
      try {
        return rpcResponse(messageId, toolResult(callTool(name, args)));
      } catch (error) {
        return rpcResponse(messageId, toolError(error && error.message ? error.message : String(error)));
      }
    }
    if (method === "resources/list") return rpcResponse(messageId, { resources: [] });
    if (method === "resources/templates/list") return rpcResponse(messageId, { resourceTemplates: [] });
    if (method === "prompts/list") return rpcResponse(messageId, { prompts: [] });
  } catch (error) {
    return rpcError(messageId, -32000, error && error.message ? error.message : String(error));
  }
  return rpcError(messageId, -32601, `Method not found: ${method}`);
}

async function writeRpc(message, output = process.stdout) {
  if (!output.write(`${JSON.stringify(message)}\n`)) {
    await once(output, "drain");
  }
}

async function handleDecodedMessage(decoded) {
  if (!Array.isArray(decoded)) return handleRpc(decoded);
  if (decoded.length === 0 || decoded.length > MAX_RPC_BATCH_ITEMS) {
    return rpcError(null, -32600, `JSON-RPC batch must contain 1-${MAX_RPC_BATCH_ITEMS} requests`);
  }
  const responses = [];
  for (const request of decoded) {
    const response = await handleRpc(request);
    if (response) responses.push(response);
  }
  return responses.length ? responses : null;
}

function runStdio() {
  let pending = Buffer.alloc(0);
  let discarding = false;

  const processFrame = async (frame, error) => {
    if (error) return writeRpc(error);
    const trimmed = frame.toString("utf8").trim();
    if (!trimmed) return;
    let decoded;
    try {
      decoded = JSON.parse(trimmed);
    } catch (parseError) {
      return writeRpc(rpcError(null, -32700, `Parse error: ${parseError.message}`));
    }
    const response = await handleDecodedMessage(decoded);
    if (response) await writeRpc(response);
  };

  const processChunk = async (input) => {
    let chunk = Buffer.isBuffer(input) ? input : Buffer.from(input);
    while (chunk.length > 0) {
      const newline = chunk.indexOf(0x0a);
      const part = newline === -1 ? chunk : chunk.subarray(0, newline);
      if (discarding) {
        if (newline !== -1) discarding = false;
      } else if (pending.length + part.length > MAX_RPC_FRAME_BYTES) {
        pending = Buffer.alloc(0);
        await processFrame(null, rpcError(null, -32600, `JSON-RPC frame exceeds ${MAX_RPC_FRAME_BYTES} bytes`));
        discarding = newline === -1;
      } else {
        pending = Buffer.concat([pending, part]);
        if (newline !== -1) {
          await processFrame(pending, null);
          pending = Buffer.alloc(0);
        }
      }
      if (newline === -1) break;
      chunk = chunk.subarray(newline + 1);
    }
  };

  process.stdin.on("data", (input) => {
    process.stdin.pause();
    void processChunk(input)
      .catch((errorValue) => writeRpc(rpcError(null, -32000, errorValue.message || String(errorValue))))
      .catch(() => process.stdin.destroy())
      .finally(() => {
        if (!process.stdin.destroyed) process.stdin.resume();
      });
  });
}

module.exports = {
  HOT_ATTACH_MARKER,
  ROUTE_NAMES,
  TOOL_NAME,
  callTool,
  directMarkdownReferences,
  handleRpc,
  handleDecodedMessage,
  loadWorkflowBundle,
  MAX_RPC_BATCH_ITEMS,
  MAX_RPC_FRAME_BYTES,
  renderToolText,
  routeRequest,
  toolDefinitions,
  writeRpc,
};

if (require.main === module) runStdio();
