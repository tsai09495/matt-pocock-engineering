# Matt Pocock Engineering 完整能力说明与使用手册

> 适用于 Matt Pocock Engineering v2.2.1。本文档解释插件的运行方式、19 个 skills 的能力边界、使用示例、组合路径和实际权衡。

[返回中文 README](../README.md) · [English README](../README_EN.md)

## 目录

- [快速开始](#2-快速开始)
- [插件如何运行](#3-插件如何运行)
- [19 个 skills 总览](#4-19-个-skills-总览)
- [选择入口](#5-选择入口从任务状态出发)
- [每个 skill 的详细说明](#6-每个-skill-的详细说明)
  - [Ask Matt](#skill-ask-matt)
  - [Wayfinder](#skill-wayfinder)
  - [Grill with Docs](#skill-grill-with-docs)
  - [Domain Modeling](#skill-domain-modeling)
  - [Research](#skill-research)
  - [Prototype](#skill-prototype)
  - [To Spec](#skill-to-spec)
  - [To Tickets](#skill-to-tickets)
  - [Implement](#skill-implement)
  - [TDD](#skill-tdd)
  - [Diagnosing Bugs](#skill-diagnosing-bugs)
  - [Code Review](#skill-code-review)
  - [Codebase Design](#skill-codebase-design)
  - [Improve Codebase Architecture](#skill-improve-codebase-architecture)
  - [Resolving Merge Conflicts](#skill-resolving-merge-conflicts)
  - [Triage](#skill-triage)
  - [Wizard](#skill-wizard)
  - [Setup Matt Pocock Skills](#skill-setup)
  - [Handoff](#skill-handoff)
- [常用组合剧本](#7-常用组合剧本)
- [主要工程产物](#8-主要工程产物)
- [可选增强](#9-可选增强什么时候值得考虑)
- [使用边界与权衡](#10-使用边界与权衡)
- [常见问题](#11-常见问题)
- [可复制的提示词模板](#12-可复制的提示词模板)

## 1. 这份手册解决什么问题

Matt Pocock Engineering 不是一个必须从头跑到尾的固定流程，而是由 19 个目的明确的工程工作流组成。它们分别处理澄清、研究、领域建模、原型、规格、任务拆分、实现、测试、诊断、审查、架构、分流、配置和上下文交接。

这份手册帮助你回答四个实际问题：

1. 我现在应该使用哪个 skill？
2. 这个 skill 会做什么、不会做什么？
3. 我需要提供什么信息，最终会得到什么？
4. 一个 skill 完成以后，通常应该接哪一步？

如果你只想尽快开始，不需要先读完整手册。安装插件后直接描述目标；如果不知道该选什么，让 Ask Matt 推荐最小工作流即可。

## 2. 快速开始

### 2.1 安装

要求：已安装支持插件的 Codex CLI 或 Codex 桌面应用。

```bash
codex plugin marketplace add tsai09495/matt-pocock-engineering
codex plugin add matt-engineering@matt-pocock-engineering
```

安装后重启 Codex，或新建一个任务。在桌面应用中选择 **Matt Pocock Engineering**，然后直接描述目标：

```text
检查当前项目的代码结构，找出最值得优化的地方。
```

### 2.2 三种调用方式

#### 方式一：直接说目标

普通工作流支持窄范围的自然语言意图。用户不需要记住全部 skill 名称。

```text
实现 issue #42，运行相关测试并审查最终 diff。

这个回归问题原因不清楚，先建立复现，不要直接猜修复方案。

把我们刚才确认的功能整理成 spec。
```

#### 方式二：显式选择某个 skill

当你已经知道需要什么工作方式时，可以直接点名：

```text
使用 $matt-engineering:code-review 审查当前未提交改动。

使用 $matt-engineering:tdd 实现购物车优惠规则。
```

#### 方式三：先让 Ask Matt 路由

如果任务跨越多个阶段，或者你无法判断入口：

```text
使用 Ask Matt，根据当前项目状态推荐最小的 Matt Engineering 工作流组合。
```

Ask Matt 只推荐下一步，不会因为给出建议就自动执行整条流程。

### 2.3 两个必须显式选择的入口

下面两个 workflow 不会因为普通措辞自动启动：

- **Setup Matt Pocock Skills**：建立仓库级 tracker、triage 和领域文档约定。
- **Wayfinder**：处理无法在一个任务中可靠规划、并且存在多层依赖未知项的长期目标。

这是为了避免日常小任务被意外扩展成仓库配置或重型跨会话项目管理。

## 3. 插件如何运行

### 3.1 Skill 是工作方式，不是权限包

选择一个 skill 表示采用相应的分析和执行流程，不表示同时授权所有后续动作。例如：

- 选择 `to-spec` 不等于允许立即把 spec 发布到 issue tracker；
- 选择 `triage` 不等于允许评论、改标签或关闭 issue；
- 选择 `implement` 不等于允许 commit、push 或创建 PR；
- 选择 `prototype` 不等于允许删除原型或把它合并进生产代码；
- 选择 `wayfinder` 不等于允许创建一组 tracker tickets。

如果你的当前请求已经明确包含某项动作，例如“实现并 commit”，插件会把该动作视为已授权；没有明确包含的外部或持久化动作会先展示预期变化。

### 3.2 默认使用当前 agent

日常任务默认由当前 agent 自包含完成。下面这些能力是可选增强，而不是默认动作：

- subagent 或并行研究；
- 独立 reviewer；
- 新 branch 或 worktree；
- 每个 ticket 使用独立任务；
- 原型隔离分支；
- 完成后的 commit、push、PR 或 merge 菜单。

只有存在明确收益时，插件才应说明收益、成本并征得同意。例如，认证或迁移代码的高风险 diff 值得增加独立 reviewer；包含大量实验代码的原型可能值得放进独立 worktree。

### 3.3 原生 skill 与既有任务兼容桥

新任务优先通过 Codex 原生 skill 机制使用这些工作流。如果一个桌面任务在安装插件之前已经打开，或当前技能列表没有暴露 Matt skills，可以显式选择 **Matt Pocock Engineering**。兼容桥会读取已安装插件中的同一份 workflow，当前 agent 仍然可以在用户授权范围内使用宿主提供的文件、命令、Git 和其他工具。

兼容桥解决的是“旧任务如何加载工作流”，不是把 agent 降级为只读审阅器。

### 3.4 完成不是一句“已完成”

不同阶段使用不同证据闭环：

- 实现：最终实质改动之后运行的新鲜测试、检查或构建结果；
- TDD：能证明目标行为的 RED，再用最小实现得到 GREEN；
- 诊断：能稳定捕获用户精确症状的反馈回路和根因证据；
- 代码审查：分别完成 Standards 和 Spec 两个检查轴；
- 架构审查：把建议绑定到真实代码、调用关系和修改热点；
- 规格与 tickets：先展示完整草稿，再决定是否持久化或发布。

## 4. 19 个 skills 总览

| 类别 | Skill | 什么时候使用 | 主要结果 |
| --- | --- | --- | --- |
| 导航 | Ask Matt | 不确定下一步或需要最小组合建议 | 一个主推荐、理由和可选增强 |
| 导航 | Wayfinder | 长期目标巨大且存在相互依赖的未知项 | 决策地图、fog、decision tickets 和 frontier |
| 探索 | Grill with Docs | 需求或设计还模糊，需要追问和证据 | 已确认事实、决策、风险和共享理解 |
| 探索 | Domain Modeling | 领域词汇、状态、规则或边界含混 | 更清晰的领域模型和可选文档更新 |
| 探索 | Research | 一个有边界的工程问题需要证据 | 事实、推论、未知项和建议 |
| 探索 | Prototype | 需要用可运行的试验回答一个问题 | 明确可丢弃的逻辑或 UI 原型 |
| 形式化 | To Spec | 上下文已确定，需要形成可构建规格 | 完整 spec 草稿或经批准的发布物 |
| 形式化 | To Tickets | 计划或 spec 已确定，需要拆成实现单元 | tracer-bullet tickets、依赖边和 frontier |
| 交付 | Implement | 需求已经定义，需要修改真实代码 | 有边界的实现、验证和双轴审查 |
| 交付 | TDD | 希望通过 RED/GREEN 开发行为 | 可保留的行为测试和最小实现 |
| 诊断 | Diagnosing Bugs | 原因未知、难复现、flaky 或性能问题 | 紧反馈回路、根因、回归证据 |
| 审查 | Code Review | 审查工作树、branch、commit 或 PR | Standards/Spec 分离的可执行 findings |
| 架构 | Codebase Design | 设计 module、interface 或测试 seam | 深模块设计和较小的调用者认知负担 |
| 架构 | Improve Codebase Architecture | 找现有代码的高杠杆重构机会 | 带 before/after 图的离线 HTML 报告 |
| 集成 | Resolving Merge Conflicts | 正在 merge/rebase 且发生冲突 | 按双方意图解决的冲突与验证结果 |
| 运作 | Triage | 评估、分类或推进 issue/外部 PR | 分类、状态建议、Agent Brief 或分流结果 |
| 运作 | Wizard | 必须由人操作第三方后台、凭据或 cutover | 经审查的交互式 Bash 人工向导 |
| 配置 | Setup Matt Pocock Skills | 首次建立仓库级 Matt 工作约定 | tracker、domain docs 和 triage 配置预览/文件 |
| 延续 | Handoff | 上下文要转移到新任务、worktree 或协作者 | 临时目录中的可移植 Markdown 交接文档 |

## 5. 选择入口：从任务状态出发

| 你当前的状态 | 推荐入口 |
| --- | --- |
| 只是不知道该用什么 | `ask-matt` |
| 想法模糊，但预计一个任务内能说清 | `grill-with-docs` |
| 领域术语和业务规则本身混乱 | `domain-modeling` |
| 缺少一个外部事实或代码事实 | `research` |
| 需要运行一个试验才能决定 | `prototype` |
| 已经讨论清楚，需要正式记录 | `to-spec` |
| 已有 spec/计划，需要拆成工作项 | `to-tickets` |
| 有明确 ticket 或验收标准 | `implement`，需要 test-first 时配合 `tdd` |
| Bug 的原因还不清楚 | `diagnosing-bugs` |
| 只想审查现有变化 | `code-review` |
| 想设计一个 module/interface/seam | `codebase-design` |
| 想审查已有项目的整体结构 | `improve-codebase-architecture` |
| 正在处理 merge/rebase 冲突 | `resolving-merge-conflicts` |
| 要处理 tracker 中的 incoming work | `triage` |
| 人必须去第三方 UI 操作 | `wizard` |
| 要第一次配置整个仓库的工作约定 | 显式选择 `setup-matt-pocock-skills` |
| 目标跨多任务且未知项相互依赖 | 显式选择 `wayfinder` |
| 上下文要离开当前任务 | `handoff` |

## 6. 每个 skill 的详细说明

<a id="skill-ask-matt"></a>

### 6.1 Ask Matt

源码：[ask-matt/SKILL.md](../plugins/matt-engineering/skills/ask-matt/SKILL.md)

**核心能力**

根据当前目标和任务状态推荐最小可用 workflow。它的价值不是展示 19 个选项，而是减少选择成本：给出一个主推荐或一条短路径，说明为什么适合、需要什么输入或授权，并最多补充一个真正有收益的可选增强。

**适合使用**

- 你知道目标，但不知道应该从澄清、研究、实现还是审查开始；
- 当前请求可能跨越两个或多个工程阶段；
- 你想确认是否真的需要 Wayfinder、Setup、subagent 或 worktree。

**不适合使用**

- 入口已经很明确，例如“审查当前未提交 diff”；
- 你希望它自动执行整条推荐路径。Ask Matt 默认只建议，不自动展开。

**输入与输出**

- 输入：当前目标、已有材料、任务状态和希望达到的终点；
- 输出：一个主要 skill 或短流程、选择理由、必要输入/授权、最多一个可选增强。

**示例指令**

```text
使用 Ask Matt，判断这个已有项目的架构优化应该从哪里开始。

我们已经有产品讨论记录，但还没有 spec。请推荐最小工作流，不要自动执行。
```

**常见组合**

Ask Matt 可以把模糊需求路由到 `grill-with-docs → to-spec`，把已明确 ticket 路由到 `implement`，把未知原因的失败路由到 `diagnosing-bugs`。Setup 只应作为缺失仓库约定时的少见前置条件。

<a id="skill-wayfinder"></a>

### 6.2 Wayfinder

源码：[wayfinder/SKILL.md](../plugins/matt-engineering/skills/wayfinder/SKILL.md)

**核心能力**

把一个无法在单次任务中可靠规划的长期目标，整理为可持续推进的决策地图。它管理的是未知项和决策依赖，不是直接实现最终产品。

核心对象包括：

- **Destination**：想达到的结果；
- **Map**：目标、约束、已知决策、fog、tickets 和 frontier 的索引；
- **Fog**：阻止形成可信 spec 的重要未知项；
- **Decision ticket**：回答一个问题，而不是交付一个产品功能；
- **Blocking edge**：问题之间真实存在的前置关系；
- **Frontier**：当前已解锁、可开始处理的 tickets。

**入口条件**

Wayfinder 必须显式选择，并且通常需要同时满足：目标跨多个任务、未知项彼此依赖、普通追问会在得到可构建 spec 之前耗尽上下文、需要多人或多会话共享持久地图。

“工作量很大”本身不够。如果目标已经足够清楚，应直接使用 `to-spec`、`to-tickets` 或 `implement`。

**工作方式与产物**

1. 定义 destination、成功指标、约束和 out of scope；
2. 从代码、领域文档和 ADR 中直接消除便宜的事实问题；
3. 把剩余 fog 转为 Research、Prototype、Grilling 或 Task 类型的 decision tickets；
4. 先在对话中展示完整 map、ticket bodies、依赖和初始 frontier；
5. 获得授权后才写 tracker 或本地文件；
6. 默认一次会话只解决一个 frontier ticket；
7. fog 清除后退出 Wayfinder，转入 `to-spec → to-tickets → implement`。

**示例指令**

```text
显式使用 Wayfinder。我们要把单体支付系统迁移到多区域架构，但数据一致性、切换策略和合规要求相互依赖。先只起草决策地图，不要创建 tracker tickets。

继续 Wayfinder 地图中“确定跨区域写入模型”这个已解锁 ticket，先读取证据，不要实现迁移。
```

**重要边界**

Wayfinder 不在地图阶段实现 destination，不自动创建或认领 tickets，不自动启动并行研究、subagent、branch 或 worktree。

<a id="skill-grill-with-docs"></a>

### 6.3 Grill with Docs

源码：[grill-with-docs/SKILL.md](../plugins/matt-engineering/skills/grill-with-docs/SKILL.md)

**核心能力**

通过依赖安全的追问、仓库事实核对和决策树，把模糊需求推进到共享理解。它区分“可以调查的事实”和“必须由用户决定的取舍”，避免 agent 用猜测填补产品决策。

**适合使用**

- 产品行为、边界、失败路径或优先级还不清楚；
- 多个问题有前后依赖，需要先回答上游问题；
- 现有计划可能与代码、术语表或 ADR 冲突；
- 需要在生成 spec 之前确认共同理解。

**工作方式与产物**

- 先读取已有讨论、代码、领域词汇和 ADR；
- 直接调查事实，不把可查问题抛回给用户；
- 每轮只问当前 frontier 上互不依赖的 1–4 个问题；
- 记录事实证据、用户决策、理由、未解决风险和建议下一步；
- 在共享理解得到确认前，不进入实现、spec 发布或 tickets 发布。

如果用户明确把文档更新放入范围，可以同步更新 `CONTEXT.md`；每个 ADR 仍是独立的持久化决策，需要明确同意。

**示例指令**

```text
挑战这个订阅暂停功能的设计。先检查现有计费代码和领域文档，再按依赖顺序向我提问。

用 Grill with Docs 重新核对这份架构方案，区分代码事实、已经决定的内容和仍需我决定的内容。保持讨论模式，不写仓库文档。
```

**常见下一步**

需要验证某个假设时进入 `research` 或 `prototype`；上下文稳定后进入 `to-spec`。

<a id="skill-domain-modeling"></a>

### 6.4 Domain Modeling

源码：[domain-modeling/SKILL.md](../plugins/matt-engineering/skills/domain-modeling/SKILL.md)

**核心能力**

建立或收紧产品领域的词汇、实体、状态、规则和关系，让产品讨论、代码命名、测试和架构使用同一套语言。它不是被动读取 glossary，而是主动发现模糊、冲突和缺失概念。

**适合使用**

- 同一个词在产品、代码和数据库中含义不同；
- 状态机、终止条件或业务不变量含混；
- module 或 seam 很难命名，反映领域本身还未稳定；
- 新功能正在引入需要长期复用的概念。

**工作方式与产物**

- 阅读 `CONTEXT.md`、ADR 和相关代码；
- 用具体边界案例挑战模糊术语；
- 区分相似但不同的概念，记录状态、规则和关系；
- 反向检查代码是否违背已确认的领域语言；
- 文档写入在范围内时，保持 `CONTEXT.md` 只描述领域，不塞入实现细节。

ADR 只用于难以逆转、如果缺少上下文会显得意外、并且存在真实取舍的决策；每个 ADR 单独确认。

**示例指令**

```text
使用 Domain Modeling 澄清 Order、Reservation 和 Fulfillment 的区别，并用现有代码验证这些定义。

检查当前“取消”状态模型。列出终止状态、允许的转换和违反不变量的代码位置；先不要修改文档。
```

**常见组合**

经常与 `grill-with-docs` 一起使用，并为 `codebase-design`、`to-spec`、`tdd` 和 `triage` 提供稳定词汇。

<a id="skill-research"></a>

### 6.5 Research

源码：[research/SKILL.md](../plugins/matt-engineering/skills/research/SKILL.md)

**核心能力**

回答一个有边界、会影响工程决策的问题，并把确认事实、合理推论和未知项分开。默认由当前 agent 完成，并优先使用本地仓库、官方文档、规范、上游源码和 release 信息。

**适合使用**

- API、平台行为、版本兼容性或技术约束需要权威证据；
- 仓库内部的调用链、历史决策或实现状态需要核对；
- 一个外部事实会决定 spec、prototype 或架构方向。

**不适合使用**

- 问题没有边界，只是“研究整个技术领域”；
- 真正缺少的是用户取舍，而不是事实；
- 用户已经给出明确要求，只需要实现。

**输入与输出**

- 输入：精确问题、它支持的决策、新鲜度要求和明确 out of scope；
- 输出：证据来源、确认事实、推论、未知项、对决策的影响和下一步核验。

默认在对话中交付。只有用户要求或后续流程确实需要持久引用时，才创建 Markdown 研究文档。

**示例指令**

```text
研究 Node.js 当前 LTS 对 WebSocketStream 的官方支持情况，用于决定我们是否移除现有 polyfill。只使用一手来源。

检查这个仓库最近为什么反复修改 auth/session 目录，并确认是否已有相关 ADR。输出事实和推论，不要修改代码。
```

**可选增强**

只有阅读量很大、问题可以独立、且用户能同时推进其他工作时，才建议后台或并行研究。

<a id="skill-prototype"></a>

### 6.6 Prototype

源码：[prototype/SKILL.md](../plugins/matt-engineering/skills/prototype/SKILL.md)

**核心能力**

用明确可丢弃的代码回答一个具体问题。Prototype 的成功标准是让决策变清楚，不是形成可维护的生产实现。

**两种形态**

- **逻辑/状态原型**：优先做成单个自包含 HTML 文件，不依赖 CDN、build 或 server，通过输入控件和可见状态暴露规则；
- **UI 原型**：优先在已有页面上生成若干差异足够大的变体，并提供切换方式；新建页面是最后选择。

**入口条件**

用户必须明确要求或同意做 throwaway prototype。开始前要说明它回答的问题、放置位置和运行方式。

**工作方式与产物**

- 只实现足以回答问题的行为；
- 不增加持久化、生产级错误处理、完整测试、抽象层或无关 polish；
- 保持一个明显的运行入口；
- 清楚展示关键状态和决策差异；
- 完成后总结原型回答了什么，并让用户选择删除、暂时保留、吸收结论到生产实现，或保存经批准的持久证据。

**示例指令**

```text
做一个可丢弃的单文件 HTML 原型，验证退款状态机在部分退款和重复回调下的转换。不要接数据库。

在现有结账页面上做三个差异明显的移动端布局变体，增加切换器，只用于比较信息层级，不进入生产实现。
```

**重要边界**

不会自动创建 branch/worktree，不会自动删除原型，也不会默认把原型代码迁入生产代码。

<a id="skill-to-spec"></a>

### 6.7 To Spec

源码：[to-spec/SKILL.md](../plugins/matt-engineering/skills/to-spec/SKILL.md)

**核心能力**

把已经建立的上下文综合成可构建、可评审的 spec。即使用户使用“PRD”或“需求文档”的说法，正式产物默认仍称为 **spec**；旧措辞只是入口，不是 artifact 名称。

**适合使用**

- 需求讨论、研究或 prototype 已经形成稳定结论；
- 需要把行为、边界、失败路径和验证方式固定下来；
- 后续要交给实现者或拆成 tickets。

**不适合使用**

- 关键产品决策仍未解决；此时回到 `grill-with-docs`；
- 用户只有模糊想法，希望 spec 自动替他做决定；
- 当前只是一个很小、已明确的修改，不需要持久规格。

**Spec 内容**

- Problem；
- Solution；
- User stories 或 behavioral outcomes；
- Implementation decisions；
- Testing decisions；
- Out of scope；
- Open questions and risks；
- Further notes。

**工作方式与产物**

它会汇总对话、计划、tickets、领域词汇、ADR 和代码事实，分开已确认决策与未决项，并确定最高实际价值的验证 seam。完整草稿和风险会先展示；只有获得批准或当前请求已经明确要求写入时，才发布到 tracker 或仓库。

**示例指令**

```text
把刚才确认的离线同步行为整理成完整 spec。先在对话中给我审稿，不要发布到 GitHub。

读取 docs/notes/auth-refresh.md 和相关 ADR，生成可实现的 spec；未解决的问题明确列出，不要自行补决定。
```

**常见下一步**

单个小功能可直接进入 `implement`；需要多个独立切片时进入 `to-tickets`。

<a id="skill-to-tickets"></a>

### 6.8 To Tickets

源码：[to-tickets/SKILL.md](../plugins/matt-engineering/skills/to-tickets/SKILL.md)

**核心能力**

把已确认的 spec、计划或对话拆成 tracer-bullet tickets：每个普通 ticket 都是贯穿受影响层的窄而完整路径，可以独立理解、演示和验证，而不是按“先做所有 schema、再做所有 API、最后做所有 UI”横向切割。

**好的 ticket 必须具备**

- 明确交付一个端到端行为；
- 可在一个新的实现上下文中完成；
- 验收标准描述可观察结果；
- 终止路径分别表达，不把成功、耗尽、取消等互斥路径压成一句；
- 只列真实 blockers；
- 测试、指标和文档通常与它们证明的行为放在同一 ticket。

对于无法保持每批都 GREEN 的大范围机械重构，可以使用 **expand–migrate–contract**；integration branch 仍是需要批准的可选增强。

**工作方式与产物**

输出编号草稿、每个 ticket 的交付内容、验收标准、`Blocked by`、必要时的 HITL 标识、初始 frontier 和紧凑依赖视图。用户确认粒度和依赖后，才渲染最终 bodies 并发布。

**示例指令**

```text
把这份 spec 拆成可独立验证的 tracer-bullet tickets，展示依赖图和初始 frontier，先不要创建 issues。

将这个全库 API 迁移按 expand–migrate–contract 拆分，明确哪些迁移批次真正阻塞后续工作。
```

**重要边界**

不会自动创建 tracker issues、修改 parent issue、启动并行实现或分配 subagents。

<a id="skill-implement"></a>

### 6.9 Implement

源码：[implement/SKILL.md](../plugins/matt-engineering/skills/implement/SKILL.md)

**核心能力**

实现一个已经定义的 spec、ticket、issue 或有边界行为，并用最终验证和双轴审查完成交付。

**入口分流**

- 原因未知、复现不稳、复杂回归或性能问题：先进入 `diagnosing-bugs`；
- 原因明确且修复范围清楚：直接实现，并保留回归验证；
- 产品行为仍明显缺失：回到 `grill-with-docs`，不替用户发明决定。

**工作方式与产物**

1. 完整读取 source work item、comments、验收标准、仓库指令、领域词汇、ADR 和附近实现；
2. 声明目标范围并保留用户的无关改动；
3. 选择最高实际价值的既有公开验证 seam；
4. 逐步做最小一致变更，频繁运行 focused checks；
5. 最后一次实质修改后运行完整相关验证；
6. 检查 staged、unstaged 和 untracked 内容；
7. 用 `code-review` 完成 Standards 与 Spec 两轴审查；
8. 修复仍在授权范围内的确认 findings，并重新验证最终 diff。

最终交付说明包含行为变化、受影响模块、验证证据、审查结果和残余风险。

**示例指令**

```text
实现 issue #42。先读取完整 issue 和 comments，修改后运行相关测试并完成双轴审查，但不要 commit。

根据 docs/specs/export-csv.md 实现第一条已解锁 ticket。只做 ticket 范围内的行为，保留其他未提交改动。
```

**重要边界**

实现授权不自动包含 commit、push、PR、merge、deploy 或 tracker 状态修改。

<a id="skill-tdd"></a>

### 6.10 TDD

源码：[tdd/SKILL.md](../plugins/matt-engineering/skills/tdd/SKILL.md)

**核心能力**

以一个可观察行为为单位执行严格的 RED → GREEN 循环，形成真正能够捕获行为变化的测试，而不是在实现完成后补一批与内部结构耦合的测试。

**每个循环**

1. 选择一个行为和最高实际价值的公开 seam；
2. 写一个 focused behavior test；
3. 从 requirement、示例、规范、可信 fixture 或独立计算得到期望值；
4. 运行并确认它因目标行为缺失而 RED，而不是 syntax、fixture 或环境错误；
5. 做最小 production change；
6. 运行 focused test 得到 GREEN，再运行附近检查；
7. 保持 GREEN 时只做立即必要的微型重构，然后进入下一个行为。

**反模式**

- 一次写完所有测试，再一次写完所有实现；
- 测 private methods 或内部调用顺序；
- 用被测实现的同一算法生成 expected value；
- 为未来可能的测试增加抽象和 hooks；
- mock 普通内部协作者，而不是时间、随机数、外部服务等真实系统边界。

如果当前架构不存在能够覆盖真实行为的正确 seam，应明确报告架构限制，而不是写一个只能制造安全感的浅测试。

**示例指令**

```text
使用 TDD 实现优惠券过期行为。一次只做一个 RED/GREEN 垂直切片，每轮展示实际测试结果。

为这个已确认的多调用者缓存 bug 建立行为测试。不要测试 private method；如果没有正确 seam，先说明架构问题。
```

**常见组合**

通常嵌入 `implement`；修复未知原因 Bug 时，先由 `diagnosing-bugs` 找到最小 repro，再把它转成 TDD 回归测试。

<a id="skill-diagnosing-bugs"></a>

### 6.11 Diagnosing Bugs

源码：[diagnosing-bugs/SKILL.md](../plugins/matt-engineering/skills/diagnosing-bugs/SKILL.md)

**核心能力**

为原因未知、难复现、flaky 或性能敏感的 Bug 建立证据链。它最重要的阶段不是读代码或提出理论，而是先建立一个快速、稳定、可由 agent 重复运行，并且能够准确捕获用户症状的反馈回路。

**六个阶段**

1. **Build a feedback loop**：优先尝试 failing test、HTTP/CLI 脚本、headless browser、trace replay、throwaway harness、fuzz、bisection、differential loop，最后才是结构化 HITL；
2. **Reproduce + minimise**：确认捕获的是同一个 Bug，并逐项删除非必要条件；
3. **Hypothesise**：提出 3–5 个有排序、可证伪并带预测的假设；
4. **Instrument**：每个 probe 对应一个假设，一次只改变一个变量；
5. **Fix + regression test**：在正确 seam 上先把最小 repro 变成失败测试，再修复并重跑原始场景；
6. **Cleanup + post-mortem**：删除调试 instrumentation、处理 throwaway artifacts、记录真实根因，并识别是否需要架构后续。

性能问题先测 baseline、profile 或 query plan，再修复。Flaky 问题的目标是把复现率提升到足够调试，而不是等待一次完美复现。

**示例指令**

```text
诊断这个偶发重复扣款问题。先建立能够捕获精确症状的反馈回路，在有红色信号之前不要推测根因。

这个接口从 80ms 退化到 900ms。先做可重复的性能基线并给出 3–5 个可证伪假设，不要直接重写查询。
```

**无法复现时**

它会明确列出已尝试方法，并请求环境访问、脱敏后的 HAR/log/core dump，或增加临时 instrumentation 的许可；不会在没有反馈回路时继续输出看似确定的根因。

<a id="skill-code-review"></a>

### 6.12 Code Review

源码：[code-review/SKILL.md](../plugins/matt-engineering/skills/code-review/SKILL.md)

**核心能力**

审查 working tree、branch、commit 或 PR，并把结论分成两个独立轴：

- **Standards**：仓库规则、正确性、安全性、数据损失、兼容性、并发、迁移、可维护性、module depth 和测试质量；
- **Spec**：是否完整、正确且不超范围地实现原始 request、ticket、spec 或 PR 目标。

一个轴干净不能替代另一个轴。代码可能写得很规范但漏掉需求，也可能满足需求但留下严重工程问题。

**审查范围**

- Working tree：同时检查 staged、unstaged 和相关 untracked 文件；
- Fixed point：按用户指定的 branch、tag、commit、range 或 PR 建立基线；
- Spec 来源优先级：用户提供的路径或 ticket，其次 commit/branch metadata、仓库 spec，最后是当前请求。

**输出要求**

只报告离散、可操作、由被审变化引入或暴露、作者知道后大概率会修复的问题。按严重度排序，给最小有用文件/行范围、触发场景和预期修正；没有 findings 时直接说明。

**示例指令**

```text
审查当前 staged、unstaged 和 untracked changes。分别给出 Standards 和 Spec 结论，只报告可操作问题，不要修改文件。

对比 main...HEAD 审查这个分支，并以 docs/specs/import.md 作为 Spec 轴来源。
```

**编辑边界**

独立的 review-only 请求不修改、stage 或 commit。它作为已授权 `implement` 的闭环步骤时，可以修复原范围内的确认 findings，再重新审查。

<a id="skill-codebase-design"></a>

### 6.13 Codebase Design

源码：[codebase-design/SKILL.md](../plugins/matt-engineering/skills/codebase-design/SKILL.md)

**核心能力**

设计 deep modules：在一个干净 seam 上，用较小 interface 隐藏较多行为。目标是让调用者获得 leverage，让维护者获得 locality，并让测试通过同一 interface 覆盖真实行为。

**核心词汇**

- **Module**：任何具有 interface 和 implementation 的东西，可以是函数、类、package 或跨层 slice；
- **Interface**：调用者为了正确使用 module 必须知道的一切，包括不变量、顺序、错误模式、配置和性能特征，不只是类型签名；
- **Implementation**：module 内部代码；
- **Depth**：调用者每学习一单位 interface 能得到多少行为能力；
- **Seam**：无需在原位置编辑即可替换行为的位置；
- **Adapter**：在 seam 上满足 interface 的具体实现；
- **Leverage**：调用者从 depth 获得的复用价值；
- **Locality**：变化、Bug、知识和验证集中在一个位置。

**关键判断**

- 删除测试：删掉 module 后，复杂度消失说明它可能只是 pass-through；复杂度重新散落到多个 callers，说明它在提供价值；
- interface 同时是调用者和测试的表面；
- 一个 adapter 往往只是想象中的 seam，两个 adapter 才通常证明变化真实存在；
- 优先接受 dependencies、返回结果和缩小 surface，不让 module 在内部偷偷创建难以替换的依赖。

**示例指令**

```text
使用 Codebase Design 为支付授权流程设计一个 deep module。比较 seam 放在 gateway 调用前后时，interface、错误模式和测试方式的差异。

检查这个缓存 wrapper 是否只是 shallow pass-through，用 deletion test 说明它应该删除、合并还是加深。
```

**可选增强**

“Design It Twice” 可以并行产生多个差异明显的 interface 方案，但 subagents 只在用户同意后启动；当前 agent 也可以顺序生成和比较多个方案。

<a id="skill-improve-codebase-architecture"></a>

### 6.14 Improve Codebase Architecture

源码：[improve-codebase-architecture/SKILL.md](../plugins/matt-engineering/skills/improve-codebase-architecture/SKILL.md)

**核心能力**

在已有代码库中寻找能够把 shallow modules 加深的高杠杆机会，重点改善 testability、AI navigability、leverage 和 locality。它不是按通用清单给整个仓库打分，也不是看到“代码味道”就建议增加抽象。

**扫描范围**

- 用户指定 module、subsystem 或 pain point 时，以该范围为主；
- 没有指定时，从近期 Git 修改热点开始，约 20 个 commits 只是初始观察窗口；
- Git 历史不足或变化分散时，从当前任务、执行入口、测试摩擦和仓库指令确定范围；
- 明确说明为什么选择这些路径，以及哪些区域没有扫描。

**工作方式与产物**

1. 读取领域 glossary 和相关 ADR；
2. 追踪理解摩擦、shallow interfaces、缺乏 locality、泄漏的 seams 和测试困难；
3. 使用 deletion test 验证候选；
4. 在操作系统临时目录生成完全离线、自包含、无脚本的 HTML 报告；
5. 每个候选包含 files、problem、solution、benefits、before/after 图和 `Strong` / `Worth exploring` / `Speculative` 强度；
6. 给出 top recommendation，但暂不设计最终 interface；
7. 用户选中候选后，再进入 grilling 和 interface 探索。

**示例指令**

```text
审查当前项目的代码结构，优先查看最近频繁修改的路径，生成架构改进 HTML 报告，并说明未覆盖的区域。

只检查 RaceSystem 与 RaceScene 之间的 interface 泄漏，找出最值得 deepening 的候选。先报告，不修改代码。
```

**重要边界**

默认单 agent 探索；大型陌生仓库可以建议 explorer subagent，但要先说明成本并获得同意。HTML 报告写入系统临时目录，不污染仓库。

<a id="skill-resolving-merge-conflicts"></a>

### 6.15 Resolving Merge Conflicts

源码：[resolving-merge-conflicts/SKILL.md](../plugins/matt-engineering/skills/resolving-merge-conflicts/SKILL.md)

**核心能力**

在正在进行的 merge 或 rebase 中，根据双方变化的原始意图解决冲突，而不是简单选择 ours/theirs 或只让文件通过语法检查。

**工作方式与产物**

1. 检查当前 merge/rebase 状态、历史和所有冲突文件；
2. 阅读 commits、PRs、issues 或 tickets，确定每一侧变化为什么存在；
3. 尽量同时保留双方意图；无法兼容时，选择符合本次合并目标的一侧并说明取舍；
4. 从仓库 scripts、任务配置和 CI 中发现可信自动化检查；
5. 先运行覆盖冲突表面的窄检查，再运行更广的相关检查；
6. 展示 resolved diff 和验证结果。

如果 incoming side 新增或修改了要运行的命令，会先展示命令及其定义变化，避免把冲突内容直接当成可信执行指令。

**示例指令**

```text
使用 Resolving Merge Conflicts 处理当前 rebase。先查清两个 commit 的目标，再逐个解决冲突并运行项目已有检查；暂时不要继续 rebase。

解决 package-lock 和 auth adapter 的 merge 冲突，保留双方需求，不要用 ours/theirs 整文件覆盖。
```

**完成边界**

workflow 不以 abort 代替解决；但 stage、commit、`rebase --continue` 或完成 merge 仍需要当前请求明确授权或用户批准。

<a id="skill-triage"></a>

### 6.16 Triage

源码：[triage/SKILL.md](../plugins/matt-engineering/skills/triage/SKILL.md)

**核心能力**

让 maintainer 按一个小型状态机处理 issue，以及仓库配置允许时的外部 PR。PR 在这里被视为“带代码的请求”：分类和状态一致，但需要额外检查 diff。

**角色模型**

每个已 triage 项目应有一个 category 和一个 state：

- Category：`bug` 或 `enhancement`；
- State：`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`。

具体 tracker label 名称可以由 Setup 映射为仓库现有词汇。

**工作方式与产物**

- “需要我关注什么”：按最旧优先显示 unlabeled、needs-triage、以及 reporter 有新回复的 needs-info；
- 指定 issue/PR：读取 body、comments、labels、author、日期和必要 diff；
- 检查请求是否已经实现，并查询 `.out-of-scope/` 中的历史拒绝；
- 从可信项目配置重建验证，确认 claim 是成立、失败还是信息不足；
- 必要时结合 `grill-with-docs` 和 `domain-modeling`；
- 推荐 category/state，并在批准后生成 Agent Brief、needs-info notes、wontfix 说明或状态变化。

所有由该 workflow 发布到 tracker 的评论都以 AI triage 声明开头。Quick override 只执行用户明确说出的 mutation；例如“move #42 to ready-for-agent”不同时授权额外 comment、close 或文件写入。

**示例指令**

```text
列出当前最需要 maintainer 关注的 issues，只做只读查询，按最旧优先分组。

Triage #42：读取完整 comments 和相关代码，验证报告是否成立，然后推荐 category 和 state；先不要修改 labels 或评论。

把 #42 移到 ready-for-agent。只执行这个明确状态变化，其他动作先问我。
```

<a id="skill-wizard"></a>

### 6.17 Wizard

源码：[wizard/SKILL.md](../plugins/matt-engineering/skills/wizard/SKILL.md)

**核心能力**

把必须由人完成的第三方 dashboard、认证、凭据收集或 cutover 操作，变成可审查、可 dry-run、可重复的交互式 Bash journey。它不是普通 shell 脚本生成器。

**入口条件**

至少有一个关键步骤无法由 agent 在当前授权范围内安全完成，例如人必须登录第三方控制台、批准访问、取回 credential，或在迁移中执行人工检查点。Agent 本来就能完成的工作继续走普通 `implement`。

**分阶段授权**

1. 隐式调用只允许只读 discovery 和对话内 proposal；
2. 用户批准完整 proposal 后，才创建 script；
3. 创建 script 不等于批准运行；
4. 用户最终决定何时真实执行 journey。

**工作方式与产物**

- 只读取公开配置、`.env.example` 和变量名，不加载真实 secret values；
- 对第三方页面使用当前官方文档核对路径；
- proposal 展示 script 路径、阶段、人类操作、变量名、来源和目标、所有 mutation、验证与 rollback；
- 使用固定 Bash runner，只写 allowlisted 的声明式 records；
- secret 使用隐藏输入，源码、日志和对话不出现真实值；
- 通过 `bash -n`、可用时的 `shellcheck`、`--dry-run` 和静态数据流检查验证；
- 真实 journey 不由 agent 端到端代跑。

**示例指令**

```text
使用 Wizard 为 Stripe webhook 和 GitHub Actions secrets 生成一个人工配置向导。先读取公开配置并展示完整 proposal，不要创建或运行脚本。

根据已经批准的 stages 创建 wizard 脚本并执行 dry-run。不要打开浏览器，不要写 .env，也不要设置 GitHub secrets。
```

**重要边界**

不会自动读取已有 secrets、`chmod +x`、链接 README、commit、删除脚本，或把临时向导升级为永久安装路径。

<a id="skill-setup"></a>

### 6.18 Setup Matt Pocock Skills

源码：[setup-matt-pocock-skills/SKILL.md](../plugins/matt-engineering/skills/setup-matt-pocock-skills/SKILL.md)

**核心能力**

一次性配置仓库级 Matt Engineering 工作约定，让 `to-spec`、`to-tickets`、`triage`、`domain-modeling` 和 Wayfinder 知道 tracker、标签和领域文档放在哪里、如何读写。

**入口条件**

Setup 必须显式选择。普通开发不要求先运行 Setup；只有仓库需要统一约定，或相关 workflow 缺少 tracker/domain 配置时才需要。

**可能产物**

- 现有 `CLAUDE.md` 或 `AGENTS.md` 中的 `## Agent skills` block；
- `docs/agents/issue-tracker.md`；
- `docs/agents/domain.md`；
- `docs/agents/triage-labels.md`，仅当 triage 可用。

Setup 不创建应用代码、issues、labels、Wayfinder maps 或 ADRs。

**工作方式与产物**

1. 只读检查仓库 guidance、remote、已有配置、`CONTEXT.md`、ADR、`.scratch/` 和 monorepo 信号；
2. 推荐仓库已经使用的 tracker；
3. 仅在发现真实 monorepo 或 bounded-context 证据时讨论多 context；
4. 分节确认 tracker、triage labels 和 domain docs；
5. 在写入前展示所有目标文件的完整内容；
6. 获得批准后更新现有 guidance file，避免创建重复配置；
7. 重读所有文件、检查链接并结束，不自动进入下一 workflow。

**示例指令**

```text
显式使用 Setup，为这个 GitHub 仓库建立 Matt Engineering 约定。先探索并展示完整文件预览，不要写入。

重新运行 Setup，只调整 issue tracker 的 dependency 和 claim 约定，保留现有 domain docs 配置。
```

<a id="skill-handoff"></a>

### 6.19 Handoff

源码：[handoff/SKILL.md](../plugins/matt-engineering/skills/handoff/SKILL.md)

**核心能力**

在工作将转移到另一个 Codex 任务、目录、worktree、harness、协作者或中途 side fork 时，创建一份可移植的 Markdown 交接文档。它解决的是上下文跨边界传递，不是普通任务内的“总结一下”。

**适合使用**

- 新任务需要继承当前工作状态；
- 新 worktree 要做版本迭代，不能污染当前上下文；
- 工作要交给另一个 agent、harness 或人；
- 当前阶段中途 fork 出一个独立方向。

**工作方式与产物**

- 保存到操作系统临时目录，不污染当前 workspace；
- 记录目标、当前状态、已确认决策、剩余工作、验证证据、重要路径和限制；
- 引用现有 spec、计划、ADR、issues、commits 和 diffs，不复制已经存在的长内容；
- 包含 `suggested skills`，告诉接手者下一步适合调用什么；
- 删除 secrets、凭据和个人信息。

**示例指令**

```text
使用 Handoff，把当前 v2.2 迭代状态交给一个新的 worktree 任务，重点说明尚未完成的发布验证和禁止触碰的目录。

为接手这个 flaky bug 的同事生成 handoff，引用现有 repro 脚本、失败日志位置和已经排除的假设。
```

**不适合使用**

当前对话仍然有效并会继续在同一任务工作时，通常不需要 handoff；常规上下文整理可以直接留在对话中。

## 7. 常用组合剧本

### 7.1 模糊想法到真实交付

```text
Grill with Docs
  → 必要时 Domain Modeling / Research / Prototype
  → To Spec
  → 需要多个切片时 To Tickets
  → Implement，必要时使用 TDD
  → Code Review
```

这不是强制流水线。一个已经明确的小功能可以直接从 Implement 开始；只有关键假设需要运行验证时才加入 Prototype。

**示例总指令**

```text
挑战这个团队邀请功能，先澄清权限、过期、撤销和重复邀请行为。达成共享理解后给我 spec 草稿；我确认前不要拆 tickets 或实现。
```

### 7.2 已有项目的架构审查与改进

```text
Improve Codebase Architecture
  → 用户选择候选
  → Grill with Docs / Domain Modeling
  → Codebase Design
  → To Spec 或 To Tickets
  → Implement
  → Code Review
```

第一步先找真实高杠杆候选，不应该直接进行全库重构。用户选中候选后，再设计 interface 和落地切片。

**示例总指令**

```text
使用 Matt Pocock Engineering 审查这个已有项目的架构。先生成有范围说明的 HTML 候选报告；我选择候选前不要设计 interface 或修改代码。
```

### 7.3 原因未知的 Bug

```text
Diagnosing Bugs
  → 建立并最小化反馈回路
  → 回归测试
  → Implement / TDD 修复
  → Code Review
  → 必要时 Improve Codebase Architecture
```

架构建议放在根因确认和修复之后，因为这时才知道哪种 locality 或 seam 真正缺失。

### 7.4 明确 ticket 的快速实现

```text
Implement
  → focused verification
  → final relevant suite
  → Code Review 的 Standards/Spec 双轴
```

不需要先跑 Grill、Spec 或 Tickets。如果实施中发现关键行为未定义，再退回澄清。

### 7.5 Tracker 运作

```text
Setup（只在尚无约定时显式运行一次）
  → Triage incoming work
  → Agent Brief / Needs Info / Wontfix
  → Implement ready-for-agent item
```

Triage 的读取、建议和 tracker mutation 是不同阶段。要求“看看 #42”不会自动改 labels；要求“把 #42 移到 ready-for-agent”则只授权该明确变化。

### 7.6 巨大且充满决策雾区的项目

```text
显式 Wayfinder
  → 一次解决一个 frontier decision ticket
  → fog 清除
  → To Spec
  → To Tickets
  → Implement
```

如果第一次检查发现已经能可靠写 spec，Wayfinder 应立即执行 no-fog exit，而不是为了形式继续制造地图和 tickets。

### 7.7 人工第三方配置

```text
Wizard discovery
  → 完整 proposal 审批
  → 生成声明式 Bash wizard
  → syntax / shellcheck / dry-run
  → 用户自行真实运行
```

普通配置文件修改、agent 已获授权的迁移和简单说明不需要 Wizard。

### 7.8 跨任务或 worktree 延续

```text
当前 workflow 完成一个稳定阶段
  → Handoff
  → 新任务读取 handoff 和被引用 artifacts
  → 从 suggested skills 继续
```

Handoff 应传递“接下来做决定和行动所需的最少完整上下文”，而不是复制整个聊天记录。

## 8. 主要工程产物

| 产物 | 用途 | 通常由谁产生 | 是否默认写入仓库 |
| --- | --- | --- | --- |
| `CONTEXT.md` | 领域词汇、状态、关系和不变量 | Domain Modeling / Grill / Architecture | 否，文档更新要在范围内 |
| ADR | 记录难逆、意外且有真实取舍的决策 | Grill / Domain Modeling / Architecture | 否，每个 ADR 单独确认 |
| Spec | 固定问题、行为、边界、实现和测试决策 | To Spec | 否，先审稿 |
| Tickets | 可独立验证的实现切片和依赖关系 | To Tickets | 否，先审稿 |
| Research result | 一个问题的事实、推论和未知项 | Research | 默认在对话中 |
| Prototype | 回答一个问题的 throwaway code | Prototype | 位置先约定，去留后决定 |
| Architecture HTML report | 高杠杆 deepening 候选和图示 | Improve Codebase Architecture | 否，写系统临时目录 |
| Agent Brief | 可供 agent 执行的持久行为契约 | Triage | 需要 tracker mutation 授权 |
| Wizard script | 人工第三方操作的声明式 journey | Wizard | 创建和执行分开批准 |
| Handoff | 跨任务、worktree 或协作者的工作状态 | Handoff | 否，写系统临时目录 |

## 9. 可选增强：什么时候值得考虑

| 可选增强 | 适合建议的信号 | 收益 | 成本 |
| --- | --- | --- | --- |
| Worktree / dedicated branch | 当前分支共享或受保护、有无关改动、长期迭代、需要对比方案 | 隔离、易回滚 | 创建、维护和集成成本 |
| Independent reviewer | auth、payments、migration、concurrency、data deletion、安全路径或微妙 flaky 修复 | 新上下文降低盲点 | 额外 token、等待和结论协调 |
| Parallel research | 问题有边界、阅读量大、彼此不共享未决假设 | 缩短关键路径 | 重复工作和结论分叉风险 |
| Prototype isolation | 实验代码很多，可能污染有价值改动 | 易删除、易比较 | branch/worktree 管理 |
| Per-ticket fresh context | tickets 独立、跨多个 sessions、上下文互相干扰 | 聚焦、减少污染 | handoff 和重新熟悉仓库 |
| Detailed plan / Wayfinder | 依赖顺序重要，或存在多层决策 fog | 显示依赖、保持长期进度 | 规划和 tracker 噪音 |
| Branch finishing menu | 完成后 commit/push/PR/merge 等终态都合理 | 明确结束方式 | 需要用户再做选择 |

用户不需要提前掌握这些判断。当前 agent 发现具体信号时，应说明“为什么现在值得用”和“会增加什么成本”；用户拒绝后继续使用单 agent 默认路径。

## 10. 使用边界与权衡

### 10.1 它不会强迫每个任务走完整生命周期

一个拼写修复、明确的单函数修改或纯 review 请求，可以直接进入对应 skill。把所有任务都扩展为 grilling、spec、tickets、implementation、review，反而会降低日常效率。

### 10.2 更精确的路由会带来少量选择成本

19 个专用 workflows 比单个 mega prompt 更可控，但用户可能不知道 skill 名称。自然语言路由和 Ask Matt 用来吸收这个成本。

### 10.3 持久产物既能保留上下文，也会产生维护负担

Spec、tickets、ADR 和 domain docs 应该只在后续会消费它们时存在。一次性探索默认留在对话或临时目录中。

### 10.4 默认单 agent 更稳定，但不追求最大并行度

单 agent 能减少上下文分叉和协调成本。任务真正可独立、风险高或阅读量大时，再显式加入 subagents、独立 reviewer 或 worktree。

### 10.5 保守的动作边界有时会多一次确认

发布、commit、push、tracker mutation、持久文档和重型增强可能需要额外确认。这换来的是：用户可以调用一个专业 workflow，而不用担心它顺便改变了仓库或外部系统中未授权的部分。

### 10.6 兼容桥解决加载，不替代原生 skill

既有任务可以通过兼容桥热加载相同 workflow，但会多一次读取和少量 token 开销。新任务中的原生 skill 仍是更直接的路径。

### 10.7 上游更新需要语义审计

本项目选择性吸收 Matt Pocock Engineering skills，而不是自动覆盖本地版本。更新时需要逐个比较能力变化、路由变化和副作用变化，再保留 Codex 适配与本地组合约束。

## 11. 常见问题

### 每个项目都要先运行 Setup 吗？

不需要。普通研究、实现、诊断、审查和架构工作都可以直接使用。只有仓库需要统一 tracker、triage 和 domain-doc 约定时，才显式运行 Setup。

### Ask Matt、Grill with Docs 和 Wayfinder 有什么区别？

- Ask Matt 回答“下一步用什么”；
- Grill with Docs 回答“一个可管理问题中的事实和决策是什么”；
- Wayfinder 管理“跨多任务、相互依赖的未知项如何逐步清除”。

### Codebase Design 和 Improve Codebase Architecture 有什么区别？

- Codebase Design 设计一个 module、interface 或 seam 应该是什么形状；
- Improve Codebase Architecture 先扫描已有代码，找哪些位置最值得 deepening。

通常先用后者找候选，再用前者设计选中的候选。

### Diagnosing Bugs 和 TDD 有什么区别？

- Diagnosing Bugs 用于原因未知，先建立能捕获症状的反馈回路并找根因；
- TDD 用于目标行为已经明确，通过 RED/GREEN 逐步实现。

诊断后形成的最小 repro 经常会成为 TDD 的第一条回归测试。

### To Spec 和 To Tickets 有什么区别？

- Spec 描述要解决的问题、行为、边界和已确定的实现/测试决策；
- Tickets 把已确认方案切成可独立交付和验证的工作单元，并记录依赖。

一个小 spec 可以直接实现，不必为了形式创建 tickets。

### Prototype 可以直接变成生产代码吗？

不默认。Prototype 为速度刻意跳过了生产级持久化、完整测试、错误处理和抽象。它应先回答决策问题，再由用户选择删除、临时保留或把结论重新实现到生产代码。

### 只选择插件会自动修改项目吗？

不会。选择插件或 skill 只是加载工作方式。文件修改、持久文档、tracker mutation、commit、push、worktree 和 subagent 等动作仍以当前请求的明确范围为准。

### 为什么旧任务里看不到 skills？

任务可能在插件安装前已经建立技能快照。显式选择 **Matt Pocock Engineering** 后，兼容桥可以加载同一份 workflow，当前 agent 继续完成文件、命令和 Git 等已授权工作。

### 为什么没有 `to-prd` 和 `to-issues`？

v2 将它们改名为 `to-spec` 和 `to-tickets`。自然语言中的 PRD、requirements、issues 和 tickets 仍能路由到新名称，但旧名称不保留为重复 alias，避免多个 skills 争抢同一意图。

### 为什么没有 zoom-out、qa、grill-me、wait-what 等 skills？

它们已弃用、与现有能力重叠，或会扩大日常路由竞争，因此不属于当前插件。`teach` 仍是独立外部 skill，不由本插件接管。

## 12. 可复制的提示词模板

### 路由

```text
使用 Ask Matt。我的目标是 <目标>，目前已有 <材料/状态>，希望最终得到 <结果>。只推荐最小工作流，不要自动执行。
```

### 澄清

```text
使用 Grill with Docs 审查 <想法/方案>。先读取 <代码/文档>，直接调查事实，只把必须由我决定的问题按依赖顺序提出来。确认共享理解前不要实现。
```

### 研究

```text
研究 <精确问题>，用于决定 <工程决策>。优先使用 <本地代码/官方文档/规范>，区分确认事实、推论和未知项。范围不包括 <排除项>。
```

### Spec

```text
把 <对话/计划/研究结果> 整理成可构建 spec，包含行为、边界、失败路径、测试决策、out of scope 和风险。先给完整草稿，不要发布。
```

### Tickets

```text
把 <spec/计划> 拆成 tracer-bullet tickets。每个 ticket 要端到端可验证，列出真实 blockers、初始 frontier 和 HITL；先给完整草稿，不要创建 tracker items。
```

### 实现

```text
实现 <ticket/spec/行为>。先读取完整来源和 comments，保持范围最小，运行最终相关验证和 Standards/Spec 双轴审查。不要 commit。
```

### 诊断

```text
诊断 <精确症状>。在推测根因前，先建立一个快速、稳定、能够捕获这个症状的反馈回路；最小化 repro，给出 3–5 个可证伪假设，再逐个验证。
```

### 审查

```text
审查 <working tree/main...HEAD/commit/PR>。分别执行 Standards 和 Spec 两个 pass，以 <spec/ticket/当前请求> 为需求来源。只报告离散、可操作的问题，不修改文件。
```

### 架构审查

```text
使用 Improve Codebase Architecture 检查 <范围>。基于真实调用关系、修改热点和测试摩擦找 deepening 候选，生成离线 HTML 报告；说明未扫描区域，我选择候选前不要改代码。
```

### Wayfinder

```text
显式使用 Wayfinder 处理 <长期目标>。先验证是否真的存在多层依赖 fog；如果目标已足够清晰就执行 no-fog exit。否则只起草 map、decision tickets、blocking edges 和 frontier，不写 tracker。
```

### 交接

```text
使用 Handoff，把当前工作交给 <新任务/worktree/协作者>。引用已有 artifacts，记录已确认决策、当前状态、验证、剩余风险、禁止触碰范围和 suggested skills，不复制整个对话。
```

## 13. 版本与归属

本文描述 Matt Pocock Engineering v2.2.1 的当前行为。Engineering workflow 概念和改编内容源自 [mattpocock/skills](https://github.com/mattpocock/skills/tree/main/skills/engineering)。本项目由 Yewang Tsai 独立适配和维护，不是 Matt Pocock 的官方发布，也不代表 Matt Pocock 对本项目的背书。
