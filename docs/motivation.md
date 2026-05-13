# Motivation

## 背景

这次 demo 的目标不是单纯展示一个聊天机器人，而是展示一个更接近真实企业场景的 **AI agent application**：多个 agent 围绕一个高风险业务事件协作，读取业务数据、政策、历史上下文和证据，最后给出可审计的结论和行动建议。

会议里讨论过三个方向：

1. E-commerce agent：容易理解，视觉表现好，但交易复杂度和企业级故事偏弱。
2. Digital payment / banking agent：更贴近交易场景，但仍容易停留在客服/操作流。
3. Fintech risk investigation tool：最适合展示 TiDB + agent memory + evidence workflow 的组合价值。

本项目选择第三个方向：**金融风险调查控制台**。

## Demo 要讲的故事

当支付平台发现一笔可疑交易时，传统系统只会给出一个规则命中结果。我们的 demo 展示的是：

1. 系统从 TiDB 中读取交易、客户、商户、证据和历史风险事件。
2. 多个 agent 分别分析客户历史、商户风险、交易网络、政策规则和旧案例记忆。
3. Agent 输出被汇总成 risk dossier，包括 risk score、证据链、结论和推荐动作。
4. 调查过程和结论可以写回 TiDB，变成后续 agent 可召回的 memory / evidence。

这个故事的重点是：**TiDB 不只是业务数据库，也是 agent application 的可靠状态层**。

为了让这个故事在 UI 里可见，demo 不应只展示“agent 给出结论”，还要展示：

- 每个 agent 读取了哪些业务表；
- 每个 agent 使用了什么 SQL-like query；
- 每个 agent 找到了哪些证据；
- 最终结论如何写回 `agent_findings` 和 `memory_events`；
- 这些写回如何成为下一次调查的 memory。

## 真实业务定位：Agent 不在交易 hot path

这个 demo 需要明确一个边界：**AI agent 不是替代毫秒级实时风控引擎**。

真实支付/金融系统通常分成两层：

1. **实时决策层**
   - 由规则、传统 ML、图特征和 risk score 处理。
   - 目标是几十毫秒内决定 pass / hold / step-up / block。
   - 这一层并发和延迟要求极高，不适合让 LLM agent 对每笔交易实时思考。

2. **调查与处置层**
   - 实时层筛出的 suspicious transaction 进入 case queue。
   - AI agent 负责证据收集、历史回溯、商户/客户画像、网络关系分析、政策匹配、case narrative 和 recommended action。
   - SLA 可以是几秒到几分钟，更适合 agent，并且天然需要 human-in-the-loop。

因此本 demo 的叙事应是：

> Rules / ML models handle high-concurrency real-time screening. AI agents handle high-value investigation cases after an alert is created.

这样讲更贴近真实金融业务，也能避免观众质疑“LLM 是否能承受逐笔交易的实时延迟”。

## 业界探索方向

公开信息显示，金融风控已经在把 AI 用到两个相邻方向：

- **实时 risk score 增强**：例如 Mastercard Decision Intelligence Pro 会在交易周边实体关系上增强风险评分，并强调 50ms 内更新 DI score；Visa 也公开强调交易在 milliseconds 内用实时 AI risk score 进行筛查。
- **Alert triage / investigation workflow**：一些银行现代化和金融犯罪平台开始把 AI agents 放在 alert queue、case management、evidence gathering、routing decision、case narrative 等环节。

这说明我们的 demo 方向是可行的，但应该对准 **investigation workflow**，而不是宣称 agent 直接取代实时授权系统。

参考：

- Mastercard Decision Intelligence Pro: https://www.mastercard.com/news/press/2024/february/mastercard-supercharges-consumer-protection-with-gen-ai
- Visa AI fraud detection: https://corporate.visa.com/en/solutions/visa-protect/insights/ai-fraud-detection.html
- Google Cloud AML AI: https://cloud.google.com/financial-services/anti-money-laundering/docs/concepts/overview
- FlowX alert triage agent: https://www.flowx.ai/ai-agents/alert-triage-agent

## 为什么 TiDB 适合这个 demo

风险调查同时需要几类数据：

- 高吞吐交易流水：大量 `transactions`
- 强一致业务状态：`risk_cases`、case status、hold/release action
- 可审计证据：`evidence_files`
- 多维分析：customer / merchant / account graph
- Agent 记忆：历史调查结论、相似 case、policy interpretation

这些数据天然需要 SQL、事务、索引、可扩展存储和可审计更新。TiDB 可以把这些能力放在一个统一的数据层中，避免 demo 变成多个分散存储拼接的故事。

## 为什么需要模拟数据

Demo 需要满足两个相互冲突的要求：

1. **故事稳定**：每次演示都能复现同一个 P1 案件和清晰证据链。
2. **规模可信**：能说明它不是 toy sample，而是可以扩展到数十万/百万交易。

因此数据分两层：

- 固定小样本 seed：用于 UI、流程和讲故事。
- PaySim-style synthetic generator：生成大量 mobile-money / payment transaction 数据，并派生风险 case、network edge、memory event。

PaySim 本身适合作为 transaction simulation 的参考模型，但它是 GPL-3.0 项目，不应直接拷贝源码到本 demo。我们采用的是 **PaySim-style schema and behavior**，自己实现轻量生成器。

## 成功标准

第一版 demo 成功的标准：

- 用户能打开一个 Web 控制台，看到风险案件队列。
- 选择一个 case 后能看到交易、客户、商户、证据和 network graph。
- 点击运行后，多个 agent 输出不同角度的调查结果。
- 系统生成一个清晰的 risk dossier 和 recommended action。
- 数据模型能自然映射到 TiDB 表。
- 数据生成器能扩展到至少 10 万交易，后续可导入 TiDB。

## 非目标

第一版暂不追求：

- 真实银行级风控模型准确率。
- 真实 LLM agent 调用链稳定性。
- 完整权限系统和审计 UI。
- 真实 PDF / 文件存储集成。

这些可以放到第二阶段，在 starter demo 跑通后再接入。
