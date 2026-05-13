# CLAIMS Design Specification

The visual source of truth for the CLAIMS frontend is two things:

1. **Mockups**: PNG screenshots in `docs/design/mockups/`
2. **Reference code**: Claude Design exported project in `docs/design/reference-code/`

This document is a structured walkthrough plus the scenario script. When in doubt about a visual detail, look at the mockups and reference code, not at this prose.

## Mockup Index

| File | Shows |
|---|---|
| `01-case-default-resolved.png` | Full case view, Synthesis card in resolved state, right panel in Case mode |
| `02-case-stack-mode.png` | Same view, right panel switched to Stack mode (Under the Hood) |
| `03-customer-history-agent.png` | Customer History agent message with scatter visualization |
| `04-merchant-analysis-agent.png` | Merchant Analysis agent with chargeback gauge |
| `05-network-graph-agent.png` | Network Graph agent with cluster viz + Maya's question |
| `06-policy-lookup-agent.png` | Network reply + Policy Lookup with decision cards |
| `07-synthesis-transition.png` | Inspect query expanded + Synthesis card top |
| `08-synthesis-detail.png` | Full Synthesis card with risk score, verdicts, actions |

Min places these files in `docs/design/mockups/` during repo setup.

## Reference Code

Min's Claude Design export is committed at `docs/design/reference-code/`. Treat it as visual reference, not as source to copy verbatim. Use it to understand:

- Exact spacing, padding, type sizes
- Color values for agent badges, severity states, mode themes
- Component composition patterns
- Visual logic that is hard to describe in prose

The actual production code goes in `frontend/`, not in `reference-code/`. The reference is read-only.

## Layout Architecture

Three columns plus a top bar.

```
┌──────────────────────────────────────────────────────────────────┐
│ Top bar: CLAiMS · Search · New case · Maya Singh                 │
├──────────────┬───────────────────────────────────────┬───────────┤
│              │                                       │ Case /     │
│  Cases       │  Case header                          │  Stack     │
│  sidebar     │                                       │  toggle    │
│              │  ─────────────────────────────────    │           │
│              │  Conversation timeline                 │  Right     │
│              │  - System events                       │  panel     │
│              │  - Agent messages × 4                  │           │
│              │  - Analyst message (Maya)              │           │
│              │  - Agent follow-up                     │           │
│              │  - Synthesis card                      │           │
│              │                                       │           │
│              │  ─────────────────────────────────    │           │
│              │  Live status line                      │           │
│              │  Quick action chips                    │           │
│              │  Message input                         │           │
└──────────────┴───────────────────────────────────────┴───────────┘
```

When the right panel is collapsed (Images 3 to 7), it shows vertical tabs `C` and `S` on the right edge with a vertical "UNDER THE HOOD" label.

## Case / Stack Toggle

Single toggle at the top of the right panel switches its content.

### Case mode (default for analyst persona)

The right panel shows case-bound context:
- Customer block (avatar, name, tier, member ID, email, phone)
- Customer contact callout (the dispute quote)
- Agents list (4 agents with status: DONE, WORKING, etc.)
- Team list (3 people, with Invite button)
- Pinned files (5 files)

### Stack mode (for the demo viewer)

The right panel shows infrastructure activity:
- Under the Hood header explaining TiDB, mem9, drive9
- Metrics strip: QPS, P99 latency, vector searches, HTAP OLTP/OLAP split
- TiDB query log: live stream of queries with type tags (OLTP, OLAP, VEC, GRAPH), table, rows, latency
- mem9 facts: WRITE / READ / QUEUED entries
- drive9 pinned: 5 file references
- Footer: tidb-cloud · region · version

This replaces the earlier Persona/Demo toggle idea. Single toggle, one screen, two audiences served.

## Cases Sidebar

Header label: `CASES`

Filter selector: `Awaiting my review` with `High priority` subtitle. Two badges:
- `11` (count awaiting)
- `15` red badge (count high priority)

This filter shows only Tier 2 cases needing analyst attention. Tier 0 and Tier 1 auto-resolved cases are NOT in this view. They are aggregated elsewhere (Operations dashboard, future scope).

Below the filter, ~12 case rows. Each row:
- Red dot indicator (priority)
- Customer name
- Amount
- Status pill: `AWAITING REVIEW`
- Time elapsed (right-aligned)
- Small red badge (count of new updates or sub-items)

Sarah Chen is the active selected case.

## Case Header

Always visible above the conversation timeline.

- Customer avatar (SC initials in colored circle)
- Customer name
- Tier and tenure: `Premium · since 2018`
- Case ID: `# CASE-2461`
- Priority badge: `HIGH PRIORITY` (red)
- Amount: `$4,280.00` (red)
- Merchant: `PT Sunset Holdings`
- Location: `Bali, ID`
- Timestamp: `03:14:24 PT`

## Conversation Timeline

Reads top to bottom. Components in order:

### System event line
`03:14:24 Case CASE-2461 opened · auto-triage flagged HIGH RISK · 4 agents joined the channel.`

Compact, single line, muted color.

Note: per the earlier scenario script we discussed, this could be preceded by two more system events showing the customer push and confirmation (03:13:08 push, 03:13:42 dispute confirmed). These are NOT in the current mockups. Treat them as Phase 2 additions, not Phase 1.

### Agent messages (4 total)

Each agent message has the same skeleton:

1. Agent avatar (color-coded initial in a circle)
2. Agent name + `AGENT` badge + timestamp
3. Narrative paragraph (2 to 3 sentences, analyst voice not query output voice)
4. Inline visualization (specific to the agent, see below)
5. One-line summary under the visualization
6. Finding box (orange/amber, warning icon, "FINDING" label, summary)
7. Collapsed `▸ Inspect query · 1 query · 1 file` toggle
8. (When expanded) Inspect query block with `HOW THIS WAS COMPUTED`, SQL query, result line, and attached `.md` file pill

### Agent signature visualizations

**Customer History (`C`, blue)**: scatter plot, x-axis is hour of day, y-axis is amount (log scale). Blue dots are baseline transactions, one large red dot at top-left labeled `$4,280 · 03:14 · 6.4σ OUTLIER`. Dashed cluster region labeled `baseline cluster`. See `03-customer-history-agent.png`.

**Merchant Analysis (`M`, purple)**: horizontal gauge for 90-day chargeback rate. Red filled bar at 8.2%, with vertical reference lines at P50 (0.5%), P90 (1.4%), P99 (2.1%). X-axis 0% to 10%. See `04-merchant-analysis-agent.png`.

**Network Graph (`N`, orange)**: force-directed mini graph inside an oval cluster boundary labeled `RING-142 · conf 0.91`. Central red node `acq_A91F` highlighted. Nodes colored by type: red (receiver), orange (prior victim), gray (settlement). Dashed orange edges are mule edges. Legend below the graph. See `05-network-graph-agent.png`.

**Policy Lookup (`P`, green)**: two stacked decision cards, one for `Reg E §1005.11` and one for `Internal P-12`. Each card has TRIGGER and GRANTS sections with green checkmark MATCH badge. Below the cards, a one-liner about Premium SLA. See `06-policy-lookup-agent.png`.

### Analyst message (Maya)

After all four agents finish, Maya intervenes:

> `@network.history` is any of the 18 prior victims also a Premium tier customer? Trying to gauge if this ring targets our segment.

Renders with MS avatar, `ANALYST` badge, timestamp. The `@network.history` is a styled mention pill.

### Agent follow-up (Network Graph)

> `@maya` 11 of 18 are Premium, 4 Business, 3 Standard. The selectivity looks ticket-size driven rather than tier driven — every victim charge sat between $2.8k and $6.2k. Sarah's $4,280 lands right in the middle of that band.

Plain text reply, no new visualization needed.

### Synthesis card

The final block in the timeline, visually distinct.

- Left edge: green vertical accent bar (signals system step, not agent)
- Σ icon in place of avatar
- Header: `Synthesis` + `SYSTEM` badge + subtitle `matched policy against mem9 facts` + timestamp
- Risk score block: large `94 /100` with red progress bar, `97% confidence` below
- Four verdict pills in a row: `Anomaly HIGH`, `Merchant HIGH`, `Network HIGH`, `Policy AUTO-HOLD`. Each pill has its agent letter in a colored circle.
- `RECOMMENDED ACTION` label and narrative paragraph
- `recommended_action.md · drive9` file pill, with `AWAITING` or `✓ RESOLVED` state badge on the right
- `CITED EVIDENCE` label with 4 file pills (one per agent)
- `ACTIONS ON EXECUTE` label with 4 action rows. Each row has a checkbox/circle, action title, detail line, and an `EXEC` button on the right.
- (When resolved) Bottom strip: `✓ RESOLVED · DSP-9921 opened · pattern saved to mem9` + `Replay` button

The Synthesis card has TWO main states:

1. **Awaiting**: green left edge, recommendations not yet executed, actions show empty checkboxes, no resolved strip
2. **Resolved**: green left edge stays, checkboxes filled or omitted, RESOLVED strip with Replay button visible at the bottom

See `01-case-default-resolved.png` for resolved state and `08-synthesis-detail.png` for the full layout.

## Bottom Strip (Below Timeline)

Three rows above the input box:

1. **Live status line**: e.g. `Network Graph is looking up adjacent clusters...` (when agents are still working). Muted color, status dot.
2. **Quick action chips** (4 chips): Ask @network for ring depth · Request 2nd opinion from policy · Reject — false positive · Escalate to senior team
3. **Message input**: placeholder `Message #CASE-2461 · @customer @merchant @network @policy` with a `Send` button on the right

## Scenario Script (Sarah Chen, CASE-2461)

This is the canonical timeline for Phase 1 mock data. Match this exactly.

```
System event
  03:14:24  Case CASE-2461 opened · auto-triage flagged HIGH RISK · 4 agents joined the channel.

Customer History  AGENT  03:14:28
  This is the strongest pattern break in Sarah's 8-year history. The amount is 50× her
  mean ticket, the timestamp is 4 hours outside any prior session window, and the
  location is novel — she has not transacted internationally since a 2019 Paris trip.
  Treating this as a high-confidence anomaly.
  [scatter viz]
  $4,280 in Bali at 03:14 PT sits 6.4σ from her 8-year baseline.
  Finding: Anomaly across all three axes · amount z=6.4 · hour z=4.1 · geography novel.

Merchant Analysis  AGENT  03:14:35
  The acceptor is PT Sunset Holdings — gambling MCC, registered Sept 2024, so only 8
  months old. Its 90-day chargeback rate is 4× the industry p99 and two acquirers have
  terminated it in the last 18 months. By itself this would justify a manual review.
  [gauge viz]
  PT Sunset Holdings · 8.2% chargeback rate · 4× industry p99.
  Finding: High-risk acceptor · 8.2% chargeback rate · 4× industry p99.

Network Graph  AGENT  03:14:41
  @customer.history Building on your novel-geography read. The receiving account sits
  inside RING-142, a cluster we already know about — 47 nodes, 18 prior victims, active
  since March. The mule edges are tight and the cluster confidence is 0.91, which is
  well above our action threshold.
  [graph viz]
  RING-142 · 47 nodes · 18 prior victims · 0.91 cluster confidence.
  Finding: Receiving account links to RING-142 · 18 prior victims · 0.91 cluster confidence.

Maya Singh  ANALYST  03:14:49
  @network.history is any of the 18 prior victims also a Premium tier customer? Trying
  to gauge if this ring targets our segment.

Network Graph  AGENT  03:14:51
  @maya 11 of 18 are Premium, 4 Business, 3 Standard. The selectivity looks
  ticket-size driven rather than tier driven — every victim charge sat between $2.8k
  and $6.2k. Sarah's $4,280 lands right in the middle of that band.

Policy Lookup  AGENT  03:14:53
  Read four facts from mem9 — pattern anomaly, high-risk merchant, ring match, Premium
  tier — and matched them against active policies. Two trigger: Reg E §1005.11 covers
  the unauthorized EFT path, and Internal P-12 requires an auto-hold when the amount
  exceeds $1,000 and a ring match is present. Premium tier puts the provisional credit
  SLA at one hour.
  [policy decision cards: Reg E §1005.11, Internal P-12]
  Premium SLA · 1-hour provisional credit window.
  Finding: Auto-hold + $4,280 provisional credit eligible under P-12 · Premium 1h SLA.

Synthesis  SYSTEM  03:14:56  matched policy against mem9 facts
  Risk score: 94/100, 97% confidence
  Verdicts: Anomaly HIGH · Merchant HIGH · Network HIGH · Policy AUTO-HOLD
  Recommended action: Three high-severity signals stack on one transaction: a 6.4σ
  behavioral break, a 4× p99 acceptor, and a confirmed RING-142 receiver. Reg E §1005.11
  + Internal P-12 support automatic action; Premium tier puts the provisional credit
  SLA at one hour.
  recommended_action.md · drive9
  Cited evidence: customer_pattern_anomaly.md, merchant_risk_report.md, network_graph.json, policy_match.md
  Actions on execute:
    - Suspend card (•••• 4421 · effective immediately)
    - Issue provisional credit ($4,280.00 → acct 8210)
    - Open dispute case (Reg E §1005.11 · 10-day SLA)
    - Write pattern → mem9 (cluster_RING_142)

(After execute, the card transitions to RESOLVED state with strip:
  ✓ RESOLVED · DSP-9921 opened · pattern saved to mem9   [Replay])
```

## What Phase 1 Implements From This

Phase 1 renders this entire timeline statically with mock data. No animations, no real backend, no agent streaming, no execute behavior. Just visual fidelity to the mockups.

Visualizations can use placeholder boxes in Phase 1 if real chart implementation is faster in a later phase. See `CLAIMS_PHASE_1.md` for exact scope.

## Notable Decisions Encoded in the Design

These are decisions reached during design that affect how the frontend should behave. Reading the mockups alone might miss them.

1. **Policy Lookup does not recommend actions.** Policy matches and Premium SLA are its only output. Action recommendation belongs to Synthesis.
2. **Synthesis is a system step, not an agent.** It has no avatar circle, just the Σ icon. Its job is to combine 4 agent findings with policy rules into a single executable action package.
3. **Risk score appears once.** It is inside the Synthesis card at the bottom of the timeline, not at the top. The case header carries only `HIGH PRIORITY` (auto-triage signal), not the AI verdict.
4. **Maya intervenes mid-flow.** The four agents complete in order, then Maya asks a strategic question, then Network Graph follows up, then Synthesis renders. The mockup shows this exact sequence.
5. **Each agent has a signature visualization.** No agent message ships without its visual.
6. **Inspect query is collapsed by default.** SQL and infrastructure call details are progressive disclosure under the analyst-facing content, not always visible.
7. **Cases sidebar shows only Tier 2 (high priority awaiting review).** Tier 0 and Tier 1 cases are auto-resolved and live in a separate Operations view (future scope).
8. **Case / Stack toggle replaces Persona / Demo mode.** Single toggle, two right-panel modes. The case stays the same, the side context changes.

## Not in the Current Design (Phase 2 or Later)

- Customer dispute moment in the timeline (push notification + Sarah's in-app confirmation at 03:13:08 and 03:13:42). Only the case opening at 03:14:24 is shown.
- Mobile push notification scene as a demo handoff transition.
- Demo control bar (Play, Pause, speed) for live demo operators.
- Persona vs. Demo mode toggle (replaced by Case / Stack).
- Operations dashboard for Tier 0/1 monitoring.
- Multiple scenario picker (Sarah Chen is the only scripted case).

These are not gaps to fix in Phase 1. They are deferred to later phases.
