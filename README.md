# Matt Pocock Engineering for Codex

[中文](./README.md) · [English](./README_EN.md)

> 把复杂的软件工程工作拆成一组可以按需组合、逐步推进的 Codex 工作流。

## 这是什么

<img src="plugins/matt-engineering/assets/readme-banner.jpg" alt="Matt Pocock Engineering">

Matt Pocock Engineering 是一套面向 Codex 的工程工作流插件，改编自 [Matt Pocock 的 Engineering skills](https://github.com/mattpocock/skills/tree/main/skills/engineering)。

它不是一个试图包办所有事情的“超级提示词”，而是把软件工程拆成 19 个目的明确的工作流：澄清问题、建立领域模型、研究、原型验证、生成规格、拆分任务、实现、测试、诊断、审查、架构改进、分流和交接。用户只需要描述当前目标，插件负责选择或建议最适合当前阶段的工作流。

这套组合既适用于从零开始的新项目，也适用于已经存在的代码库和进行中的任务。

## 快速开始

要求：已安装支持插件的 Codex CLI 或 Codex 桌面应用。

```bash
codex plugin marketplace add tsai09495/matt-pocock-engineering
codex plugin add matt-engineering@matt-pocock-engineering
```

安装后重启 Codex，或打开一个新任务。在桌面应用中选择 **Matt Pocock Engineering**，然后直接描述目标：

```text
检查当前项目的代码结构，找出最值得优化的地方。
```

需要了解全部 19 个 skills 的适用场景、产物、边界、组合方式和可复制示例，请阅读[完整能力说明与使用手册](docs/MATT-POCOCK-ENGINEERING-GUIDE.zh-CN.md)。

## 核心概念

### 1. 用工作流组合代替单一大流程

不同工程阶段需要不同的思考方式。探索问题时不应该急着实现，诊断故障时不应该先猜修复方案，规格设计和任务拆分也不应该混成一次输出。

因此，每个 skill 只负责一个清晰阶段，并把结果交给下一阶段。你可以只使用其中一个，也可以把它们串成完整交付路径。

### 2. 根据任务状态路由，而不是要求用户记住命令

用户通常知道自己想完成什么，却不一定知道应该调用哪个 skill。Ask Matt 和窄范围的自然语言路由会根据当前意图推荐最小可用工作流。

当任务需要更完整的产品或架构导航时，可以显式使用 Wayfinder；当仓库需要建立整套工作约定时，可以显式使用 Setup。

### 3. 让上下文通过工程产物持续传递

讨论、规格、tickets、实现证据、审查结论和 handoff 不是彼此孤立的输出。它们共同承担上下文传递：上一阶段已经确认的约束，不需要在下一阶段重新猜测。

目标不是制造更多文档，而是在任务变长、人员变化或上下文窗口切换时，保留真正影响决策的信息。

### 4. 以可观察证据结束每个阶段

实现需要验证，诊断需要根因证据，代码审查需要同时检查工程标准和原始需求，架构建议需要指向真实代码结构。

插件强调“完成了什么、如何证明、还剩什么不确定性”，而不是只生成看起来完整的答案。

### 5. 默认轻量，复杂能力按需加入

日常工作默认由当前 agent 完成。Subagent、worktree、独立 reviewer、后台研究等较重能力只作为可选增强，在它们确实能降低风险或缩短关键路径时再加入。

## 借鉴并组合的理念

这套插件主要继承并组合了 Matt Pocock Engineering skills 中的以下思路：

- **Grill before build**：在实现前通过追问、文档和证据暴露模糊假设。
- **Domain language first**：先建立稳定的领域词汇、状态和规则，再设计代码边界。
- **Spec as a decision artifact**：规格记录已经确认的行为和约束，而不是堆砌愿望。
- **Tracer-bullet tickets**：任务按可独立验证的垂直行为切分，而不是按技术层横向拆散。
- **Evidence-driven implementation**：实现、TDD、诊断和代码审查都围绕可观察行为闭环。
- **Deep modules and narrow interfaces**：架构改进关注信息隐藏、接口深度和高杠杆 seam，而不是机械增加层级。
- **Explicit context handoff**：在任务、agent 或上下文窗口切换时，只保留后续真正需要的工作状态。

在此基础上，本项目增加了适用于 Codex 的组合方式：原生 skills、自然语言路由、既有任务兼容桥、保守的默认介入，以及显式可选增强。

## 能够实现什么效果

| 阶段 | 工作流 | 典型结果 |
| --- | --- | --- |
| 导航 | Ask Matt、Wayfinder | 选择下一步，或形成产品、架构和交付路径。 |
| 探索 | Grill with Docs、Domain Modeling、Research、Prototype | 澄清问题、统一语言、补足证据、验证关键假设。 |
| 形式化 | To Spec、To Tickets | 形成可评审规格和可独立交付的任务。 |
| 交付 | Implement、TDD | 完成有边界的实现，并留下新鲜验证证据。 |
| 诊断与审查 | Diagnosing Bugs、Code Review、Resolving Merge Conflicts | 找到根因、识别缺陷、验证需求完整性、安全解决冲突。 |
| 架构 | Codebase Design、Improve Codebase Architecture | 设计更深的模块与接口，识别高杠杆重构机会。 |
| 运作与延续 | Triage、Wizard、Setup、Handoff | 分流工作、生成配置向导、建立仓库约定、传递上下文。 |

组合使用时，一条典型路径是：

```text
模糊想法
  → Grill with Docs / Domain Modeling / Research / Prototype
  → To Spec
  → To Tickets
  → Implement / TDD
  → Code Review
  → Handoff
```

Bug 任务通常从 Diagnosing Bugs 开始；已有项目的结构优化通常从 Improve Codebase Architecture 或 Codebase Design 开始。没有必要每次走完整条链路。

## 如何使用

### 直接描述目标

```text
使用 Matt Pocock Engineering，检查当前项目的代码结构，找出最值得优化的地方。

帮我挑战一下这个产品想法，确认后把它整理成 spec 和可交付 tickets。

实现 issue #42，运行相关验证，然后审查最终 diff。

先诊断这个回归问题，在根因确认前不要开始修复。
```

### 不确定该选什么时

```text
使用 Ask Matt，根据当前任务建议最小的工作流组合。
```

### 使用显式入口

```text
使用 Wayfinder，把当前产品方向整理为架构地图和实施路径。

使用 Setup，为这个仓库生成 Matt Engineering 工作约定的配置预览。
```

### 在既有任务中介入

新任务优先使用原生 skills。如果当前任务在安装插件之前已经打开，或技能列表里暂时看不到 Matt skills，显式选择 **Matt Pocock Engineering**；插件会通过兼容桥加载同一套工作流，再由当前 agent 继续执行任务。

## 权衡说明

- **它优化的是工程质量和上下文连续性，不是最少步骤。** 对一次性的微小修改，直接实现可能更快；不需要为了使用插件而走完整流程。
- **19 个工作流带来了更细的选择，也带来了路由成本。** 不确定时使用 Ask Matt，避免手动研究全部 skills。
- **保守路由减少误介入，但有时需要一次显式选择。** Setup、Wayfinder 和较重增强能力不会被普通措辞自动启动。
- **工程产物可以减少后续返工，也可能制造维护负担。** Spec、tickets、ADR 和上下文文档只应在它们会被后续工作消费时保留。
- **既有任务兼容桥会多一次工作流加载，并增加少量 token 开销。** 新任务中的原生 skills 仍是更直接的路径。
- **默认单 agent 更可控，但不会自动获得最大并行度。** 当任务可以安全拆分且并行收益明显时，再选择 subagents 或独立 reviewer。
- **上游同步不是自动覆盖。** Matt Pocock skills 的新版本需要经过语义对比后再吸收，以保留本插件的组合逻辑和 Codex 适配。

## 本地开发与验证

要求：Bash、Node.js、Python 3，以及包含官方 skill/plugin validator 的 Codex 安装。

```bash
git clone https://github.com/tsai09495/matt-pocock-engineering.git
cd matt-pocock-engineering
bash plugins/matt-engineering/scripts/validate-suite.sh
```

## 归属与许可证

Engineering 工作流概念及改编内容源自 [mattpocock/skills](https://github.com/mattpocock/skills)。本项目由 Yewang Tsai 独立适配和维护，不是 Matt Pocock 的官方发布，也不代表 Matt Pocock 对本项目的背书。

本项目采用 [MIT License](LICENSE)。
