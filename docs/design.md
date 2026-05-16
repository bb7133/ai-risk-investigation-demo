# Design

## 总体架构

当前版本分成两个已经可运行的部分：

- 新的 CLAIMS Frontend：`frontend/` 下的 Next.js 应用，当前默认通过 Next.js API adapter 读取 `8787` 后端真实数据；MSW 仅作为离线 fallback。
- Legacy API + TiDB Backend：`8787` Node.js API，已经支持 local file repository 和 TiDB Zero repository，负责支撑 TiDB backend storage 叙事。

目标架构是把新 frontend 接到 TiDB-backed API：

```text
Real-time Rules / ML Risk Scoring
        |
        | suspicious transaction / held payment
        v
Next.js CLAIMS Frontend
        |
        | HTTP API
        v
Node.js Demo API / Adapter
        |
        | TiDB Zero repository
        v
Transactions / Cases / Evidence / Timeline / Memory / Agent Outputs
```

当前已经进入 adapter 形态：新 frontend 的浏览器请求仍使用 `/api/*` contract，但由 `frontend/app/api/cases/*` 转接到 `8787` 后端并映射成 CLAIMS UI 需要的 payload。Schema 和 mapping 见 [frontend-data-contract.md](frontend-data-contract.md)。

## 系统边界

本 demo 不把 AI agent 放进逐笔交易授权的 hot path。真实系统应采用两段式架构：

```text
Payment event
   |
   v
Rules / ML / graph features / risk score       latency target: milliseconds
   |
   | pass / hold / block / create alert
   v
Risk case queue
   |
   v
AI agent investigation workflow                latency target: seconds to minutes
   |
   | evidence, narrative, recommended action
   v
Human review / automated low-risk action
```

这样设计有三个好处：

- 保留金融业务对实时授权链路的低延迟和确定性要求。
- 让 AI agent 处理更适合它的任务：解释、证据组装、历史召回、政策匹配和文档化。
- 给 TiDB 一个清晰位置：实时交易、case、证据、graph edge、agent memory 和 action log 都写在同一个可靠状态层里。

## 用户体验

新的 CLAIMS 主界面分为几块：

1. **Case Queue**
   - 展示待调查 case。
   - 包含 priority、customer、merchant、amount、reason。

2. **Case Context**
   - 展示客户、商户、交易金额、用户历史中位数。
   - 展示 evidence files。

3. **Network Evidence**
   - 展示 customer / device / payout account / merchant 的风险关系图。
   - 高风险边用不同颜色突出。

4. **Agent Workspace + Risk Dossier**
   - 多个 agent 输出调查发现。
   - 汇总 risk score、conclusion、recommended action。
   - 每个 agent 展示 `Input -> Query -> Steps -> Evidence -> Output`，避免黑盒感。

5. **TiDB Backend Storage / Stack View**
   - 展示 agent 读取和写回的 TiDB 表。
   - 明确哪些表是实时交易状态，哪些表是证据、图关系、memory 和 agent output。
   - 当前新 frontend 中这部分仍然是 demo visualization；接入 real backend 后再由 TiDB/API 状态驱动。

页面顶部会展示简化流程：

```text
Realtime screening -> Case queue -> Agent investigation -> Human action
```

这个流程提示用于避免误解：agent 处理的是已经被筛出的 case，不是逐笔实时交易。

## Agent 设计

第一版 agent 是 deterministic agent，便于 demo 稳定；第二版再替换成真实 LLM agent。

### Customer History Agent

输入：

- customer profile
- customer median payment
- previous memory events
- current transaction amount

输出：

- 当前交易是否显著高于用户正常行为
- 用户是否有 prior chargeback / fraud memory

### Merchant Risk Agent

输入：

- merchant profile
- merchant risk score
- merchant category/country
- merchant memory events

输出：

- 商户是否属于高风险类别
- 是否存在共享 payout account 或历史欺诈网络

### Network Graph Agent

输入：

- network_edges
- customer/device/account/merchant graph

输出：

- 高风险边数量
- 是否存在 two-hop / three-hop risk connection

### Policy Agent

输入：

- fraud policy markdown
- case context
- agent findings

输出：

- 是否满足 escalation / conditional hold / release 条件

### Memory Agent

输入：

- memory_events
- customer/merchant/case ids

输出：

- 相似历史事件
- 可召回的旧结论
- 置信度

## 数据模型

### Core Tables

```sql
customers(id, name, risk_tier, country, created_at, median_payment)
merchants(id, name, category, country, risk_score)
transactions(id, customer_id, merchant_id, amount, currency, status, occurred_at)
risk_cases(id, transaction_id, priority, status, reason, created_at)
evidence_files(id, case_id, kind, title, uri, summary)
network_edges(case_id, source, target, edge_type, risk)
memory_events(id, subject_type, subject_id, event_type, content, confidence, created_at)
agent_findings(id, case_id, agent_name, finding, confidence, created_at)
```

### Indexing Direction

```sql
CREATE INDEX idx_transactions_customer_time ON transactions(customer_id, occurred_at);
CREATE INDEX idx_transactions_merchant_time ON transactions(merchant_id, occurred_at);
CREATE INDEX idx_risk_cases_status_priority ON risk_cases(status, priority, created_at);
CREATE INDEX idx_evidence_case ON evidence_files(case_id);
CREATE INDEX idx_network_case ON network_edges(case_id);
CREATE INDEX idx_memory_subject ON memory_events(subject_type, subject_id, created_at);
```

## 数据生成设计

### 为什么参考 PaySim

PaySim 是 mobile money fraud simulation 的经典方向，字段适合支付交易演示：

```text
step,type,amount,nameOrig,oldbalanceOrg,newbalanceOrig,
nameDest,oldbalanceDest,newbalanceDest,isFraud,isFlaggedFraud
```

这些字段天然能表达 payment / transfer / cash-out / fraud pattern。

### 为什么不直接依赖 PaySim 源码

PaySim repo 是 GPL-3.0。为了避免 license 风险，本项目不复制或嵌入它的 Java 源码，而是：

- 采用类似字段结构；
- 自己实现 lightweight synthetic generator；
- 在生成结果上派生 demo-specific tables。

### 生成器输出

`npm run seed:paysim` 输出：

```text
data/paysim-like/transactions.csv
data/paysim-like/risk_cases.csv
data/paysim-like/network_edges.csv
data/paysim-like/memory_events.csv
```

生成逻辑：

- 正常客户产生大量 PAYMENT / TRANSFER / CASH_OUT 交易。
- 少量 fraudster account 触发 transfer / cash-out depletion pattern。
- 高风险 merchant 触发 elevated merchant risk pattern。
- 大额交易、共享 payout account、设备指纹复用会派生 risk case。
- risk case 会派生 network edge 和 memory event。

## API 设计

### 新 CLAIMS Frontend Contract

新 frontend 的 TypeScript contract 在 `frontend/types/api.ts`，期望的接口是：

```text
GET  /api/cases
GET  /api/cases/:id
GET  /api/cases/:id/timeline
GET  /api/cases/:id/events
POST /api/cases
POST /api/cases/:id/chat
POST /api/cases/:id/execute
```

其中：

- `GET /api/cases` 返回 case queue。
- `GET /api/cases/:id` 返回完整 case bundle。
- `GET /api/cases/:id/timeline` 返回 agent workflow timeline。
- `GET /api/cases/:id/events` 用 SSE 流式展示 agent 进度。
- `POST /api/cases/:id/chat` 让 analyst 直接向一个或多个 agents 发消息，并把 agent 回复追加到 timeline。
- `POST /api/cases/:id/execute` 触发或回放 investigation，并写回 timeline / finding / synthesis / action。

当前这些接口由 Next.js route handlers 提供，并通过 Node API adapter 从 TiDB-backed backend 读取和组装同样的 payload。`frontend/mocks/` 保留为显式 offline fallback。详细 schema 和 mapping 见 [frontend-data-contract.md](frontend-data-contract.md)。

### Legacy API

旧 API 仍然可用，主要用于本地数据和 TiDB backend repository 验证：

```text
GET  /api/health
GET  /api/cases?source=guided
GET  /api/cases?source=generated&priority=P1&limit=500
GET  /api/cases?source=generated&q=RC00000008
GET  /api/cases/:caseId
POST /api/cases/:caseId/investigate
GET  /api/schema
```

`source=guided` 使用手工整理的精品 case，适合讲故事；`source=generated` 读取生成数据，适合展示大量 open cases 和 TiDB backend storage 的规模感。

当前已经支持两种 repository：

- `npm run dev:api`：local file repository，读取 `data/seed.json` 和 `data/paysim-like/*.csv`。
- `npm run dev:api:tidb`：TiDB Zero repository，读取 `riskops_ai_demo` 里的 TiDB 表。

## Agent 输出约束

为了让 demo 更接近真实金融业务，agent 输出需要满足以下约束：

- 必须引用证据来源，例如 transaction、merchant、network edge、memory event 或 policy section。
- 必须展示它读取了哪些 TiDB 表，以及触发的 SQL-like query。
- 必须展示主要推理步骤，而不是只展示最终一句话结论。
- 必须给出 confidence。
- 必须区分 fact、inference 和 recommendation。
- 高风险 action 默认 human-in-the-loop，不直接自动扣款、冻结或关闭账户。
- 如果证据不足，输出应建议补充调查，而不是强行给出结论。

当前实现已经把 timeline 从静态回放推进到 real-agent 分析：后端会针对当前 case 为 `customer_history.lookup`、`merchant_risk.score`、`network_graph.expand`、`policy_match.evaluate` 四个 lane 分别收集 TiDB-backed tool observations，然后在配置了 Codex provider 时交给本地 `codex exec` 生成 agent message。每条 agent message 都包含 skill 名称、SQL-like query、读取/写入表、关键步骤、证据、生成 artifact 名称，以及回复来源，前端在 `Inspect query` 中展示这些工作细节。

底部 analyst chatbox 现在走真实 agent runtime：用户输入消息后，`POST /api/cases/:id/chat` 会按 `@customer`、`@merchant`、`@network`、`@policy` 选择 agent（未指定时默认四个都回应）。后端先从 TiDB case bundle 读取当前 case、customer、merchant、graph、memory、policy 等工具观测，再把 analyst task + agent role + tool observations 交给本地 `codex exec` 生成 agent response，最后把 analyst message + agent replies 作为 `CaseEvent[]` 返回给前端实时追加到 timeline。

如果未配置或无法调用 Codex CLI，本地服务会退回 deterministic skill fallback，保证离线 demo 仍可运行。`GET /api/health` 会明确返回当前 `agentRuntime`，用于区分 `codex-cli` 和 `deterministic-fallback`。

## TiDB Backend Storage 叙事

UI 需要把 TiDB 从“后台数据库”变成 demo 中可见的业务基础设施。推荐把它讲成三类能力：

1. **Operational State**
   - `transactions`
   - `customers`
   - `merchants`
   - `risk_cases`
   - 用于承载实时交易状态和 case workflow。

2. **Evidence and Relationship Store**
   - `evidence_files`
   - `network_edges`
   - 用于保存可审计证据和 customer-device-account-merchant 关系图。

3. **Agent Memory and Output**
   - `memory_events`
   - `agent_findings`
   - 用于保存历史调查经验、agent 输出和后续 recall 输入。

演示时可以强调：

> Agent is useful only if it can reliably read current business state, retrieve historical evidence, and write back auditable outcomes. TiDB provides that shared state layer.

## TiDB 接入

当前已经完成：

1. 本地 JSON/CSV 导入 TiDB：
   - `npm run import:tidb`
   - 创建/使用 `riskops_ai_demo`
   - 导入 `customers`、`merchants`、`transactions`、`risk_cases`、`evidence_files`、`network_edges`、`memory_events`、`policy_documents`

2. API repository 可切换：
   - local file mode 使用内存中的 JSON/CSV。
   - TiDB mode 使用 SQL join 读取 case bundle。
   - `analyze()` 输入保持不变。

3. 新 CLAIMS frontend 通过 Next.js API adapter 接入 legacy API / TiDB backend。

4. TiDB schema 已扩展以支持新 frontend 的 timeline / agent status / synthesis / action model：
   - `case_timeline_events`
   - `case_agent_status`
   - `case_synthesis`
   - `case_actions`

5. 当前 timeline 和 chatbox 已接入 live agent-skill path，可基于当前 TiDB case bundle 生成 agent 输出。

还没有完成：

6. Agent 输出持久写回：
   - `case_timeline_events`
   - `agent_findings`
   - `case_synthesis`
   - `case_actions`
   - `memory_events`

推荐顺序：

1. 把 `CASE-2461` / Sarah Chen mock fixture seed 到 TiDB，如果仍需固定截图 case。
2. 继续扩展真实 API 写回能力，同时保留 MSW 作为离线 demo fallback。

## Project Skills

为了让后续 agent 操作更稳定，仓库中新增两个 project-local skills：

- `skills/risk-demo-data-generation/SKILL.md`：定义生成 PaySim-style CSV、导入 TiDB、验证 case queue / workflow tables 的标准流程。
- `skills/risk-demo-agent-configuration/SKILL.md`：定义真实 agent runtime 的配置和验证流程。当前可用 provider 是 Codex CLI；Claude Code 或其他本地 CLI 可以按同样的 strict JSON contract 增加 adapter 后接入。

## Demo 叙事顺序

推荐演示脚本：

1. 打开控制台，展示待处理风险案件。
2. 说明数据存储在 TiDB：交易、case、证据、memory 是统一状态层。
3. 选择 P1 case。
4. 展示 network graph 和 evidence。
5. 点击 Run Investigation。
6. 解释每个 agent 的职责。
7. 展示最终 dossier 和 action。
8. 说明下一步：agent 输出写回 TiDB，成为后续调查的 memory。
