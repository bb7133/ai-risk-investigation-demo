// Chat data — Sarah Chen case conversation, plus channel list + agent profiles.

const CHAT_AGENTS = {
  customer: { id: 'customer', name: 'Customer History', short: 'CUST', glyph: 'C', color: 'var(--c-customer)', role: 'Pattern & history specialist', about: 'Reads 8 years of card activity for the cardholder. Surfaces deviations in amount, timing, geography, and merchant category.' },
  merchant: { id: 'merchant', name: 'Merchant Analysis', short: 'MERCH', glyph: 'M', color: 'var(--c-merchant)', role: 'Acceptor & chargeback specialist', about: 'Profiles the merchant — MCC, age, dispute rate, acquirer history, adverse media.' },
  network:  { id: 'network',  name: 'Network Graph',     short: 'NET',   glyph: 'N', color: 'var(--c-network)',  role: 'Graph & cluster specialist',     about: 'Traces receiving accounts 2–3 hops out, matches against known mule clusters in mem9.' },
  policy:   { id: 'policy',   name: 'Policy Lookup',     short: 'POL',   glyph: 'P', color: 'var(--c-policy)',   role: 'Compliance & action specialist',  about: 'Reads what other agents wrote into mem9 and matches the facts against Reg E, internal policies, and the customer tier.' },
};

const ANALYST = { id: 'maya', name: 'Maya Singh', short: 'MS', role: 'Senior analyst', color: '#7a52d4' };

const TEAM_MEMBERS = [
  { id: 'maya',   name: 'Maya Singh',   short: 'MS', role: 'Senior analyst · lead',   color: '#7a52d4', presence: 'active',   isYou: true },
  { id: 'daniel', name: 'Daniel Park',  short: 'DP', role: 'Risk ops manager',         color: '#2e7ad1', presence: 'watching', invitedBy: 'auto · ≥ $4k threshold' },
  { id: 'priya',  name: 'Priya Sharma', short: 'PS', role: 'Fraud analyst · 2nd opinion', color: '#cf3e76', presence: 'idle',    invitedBy: 'Maya · 03:14:50' },
];

const CHANNELS = [
  { id: 'CASE-2461', cust: 'Sarah Chen',     amount: '$4,280.00',  city: 'Bali, ID',         status: 'awaiting',      priority: 'high', unread: 3, last: 'recommended_action.md', when: '2m',   assignee: 'maya',   active: true },
  { id: 'CASE-2460', cust: 'David Kim',      amount: '$1,840.50',  city: 'Lagos, NG',        status: 'investigating', priority: 'high', unread: 0, last: 'NETWORK is tracing acq_F3A1…', when: '5m', assignee: 'maya'   },
  { id: 'CASE-2459', cust: 'Aiko Tanaka',    amount: '$9,120.00',  city: 'Bucharest, RO',    status: 'investigating', priority: 'high', unread: 2, last: 'MERCHANT flagged mch_BUC_4', when: '7m',   assignee: 'priya' },
  { id: 'CASE-2458', cust: 'Lucia Mendoza',  amount: '$3,400.00',  city: 'São Paulo, BR',    status: 'awaiting',      priority: 'high', unread: 1, last: 'all 4 agents complete · ready', when: '11m', assignee: 'maya' },
  { id: 'CASE-2457', cust: 'Maria Lopez',    amount: '$420.00',    city: 'Madrid, ES',       status: 'investigating', priority: 'med',  unread: 0, last: 'NETWORK at 30%', when: '12m',   assignee: 'maya'  },
  { id: 'CASE-2456', cust: 'Rohan Verma',    amount: '$12,500.00', city: 'Manila, PH',       status: 'investigating', priority: 'high', unread: 0, last: 'CUSTOMER pulling 8y history', when: '14m', assignee: 'maya' },
  { id: 'CASE-2455', cust: 'Tom Hayashi',    amount: '$78.00',     city: 'San Francisco',    status: 'auto',          priority: 'med',  unread: 0, last: 'auto-resolved · low risk',  when: '14m', assignee: 'daniel' },
  { id: 'CASE-2454', cust: 'Anika Patel',    amount: '$3,100.00',  city: 'Buenos Aires, AR', status: 'awaiting',      priority: 'high', unread: 1, last: 'policy.match → escalate path B', when: '21m', assignee: 'maya' },
  { id: 'CASE-2453', cust: 'James OConnor',  amount: '$220.00',    city: 'New York, US',     status: 'resolved',      priority: 'med',  unread: 0, last: 'approved · false alarm',     when: '34m', assignee: 'maya' },
  { id: 'CASE-2452', cust: 'Priya Joshi',    amount: '$49.99',     city: 'Austin, US',       status: 'auto',          priority: 'low',  unread: 0, last: 'auto-resolved',               when: '41m', assignee: 'daniel' },
  { id: 'CASE-2451', cust: 'Mohamed Saleh',  amount: '$5,980.00',  city: 'Dubai, AE',        status: 'awaiting',      priority: 'high', unread: 2, last: '4 agents complete · awaiting',  when: '47m', assignee: 'maya' },
  { id: 'CASE-2450', cust: 'Lena Köhler',    amount: '$612.40',    city: 'Berlin, DE',       status: 'awaiting',      priority: 'med',  unread: 0, last: '4 agents complete',            when: '53m', assignee: 'priya' },
  { id: 'CASE-2449', cust: 'Ben Carter',     amount: '$14.20',     city: 'Chicago, US',      status: 'resolved',      priority: 'low',  unread: 0, last: 'approved',                     when: '58m', assignee: 'maya'  },
  { id: 'CASE-2448', cust: 'Rahul Desai',    amount: '$980.00',    city: 'Mumbai, IN',       status: 'investigating', priority: 'med',  unread: 0, last: 'CUSTOMER at 70%',              when: '1h 04m', assignee: 'priya' },
  { id: 'CASE-2447', cust: 'Diego Romero',   amount: '$4,400.00',  city: 'Caracas, VE',      status: 'resolved',      priority: 'high', unread: 0, last: 'approved by Maya',             when: '1h 11m', assignee: 'maya' },
  { id: 'CASE-2446', cust: 'Hiro Sato',      amount: '$6,210.00',  city: 'Bangkok, TH',      status: 'awaiting',      priority: 'high', unread: 1, last: 'policy match · auto-hold',     when: '1h 14m', assignee: 'maya' },
  { id: 'CASE-2445', cust: 'Yuki Watanabe',  amount: '$1,450.00',  city: 'Tokyo, JP',        status: 'awaiting',      priority: 'med',  unread: 0, last: '4 agents complete',            when: '1h 24m', assignee: 'maya' },
  { id: 'CASE-2444', cust: 'Selin Demir',    amount: '$7,820.00',  city: 'Istanbul, TR',     status: 'awaiting',      priority: 'high', unread: 1, last: 'ring match RING-098',          when: '1h 29m', assignee: 'maya' },
  { id: 'CASE-2443', cust: 'Adam Lee',       amount: '$312.00',    city: 'Toronto, CA',      status: 'awaiting',      priority: 'med',  unread: 0, last: 'policy match pending review',  when: '1h 36m', assignee: 'maya' },
  { id: 'CASE-2442', cust: 'Ruth Coleman',   amount: '$25.00',     city: 'Phoenix, US',      status: 'auto',          priority: 'low',  unread: 0, last: 'auto-resolved',                when: '1h 42m', assignee: 'daniel' },
  { id: 'CASE-2441', cust: 'Olivia Reed',    amount: '$5,140.00',  city: 'Cape Town, ZA',    status: 'awaiting',      priority: 'high', unread: 1, last: 'all 4 agents complete · ready', when: '1h 50m', assignee: 'maya' },
  { id: 'CASE-2440', cust: 'Karim Hassan',   amount: '$3,720.00',  city: 'Cairo, EG',        status: 'investigating', priority: 'high', unread: 0, last: 'NETWORK tracing acq_K2L8…',    when: '1h 58m', assignee: 'maya' },
  { id: 'CASE-2439', cust: 'Sofia Russo',    amount: '$4,890.00',  city: 'Rome, IT',         status: 'awaiting',      priority: 'high', unread: 2, last: 'merchant CB 6.4%',             when: '2h 04m', assignee: 'maya' },
  { id: 'CASE-2438', cust: 'Theo Brown',     amount: '$2,180.00',  city: 'London, UK',       status: 'investigating', priority: 'high', unread: 1, last: 'CUSTOMER at 45%',              when: '2h 11m', assignee: 'maya' },
  { id: 'CASE-2437', cust: 'Mei Ling',       amount: '$8,400.00',  city: 'Singapore, SG',    status: 'awaiting',      priority: 'high', unread: 1, last: 'ring match RING-077',          when: '2h 19m', assignee: 'maya' },
  { id: 'CASE-2436', cust: 'Pablo Ortiz',    amount: '$1,260.00',  city: 'Lima, PE',         status: 'investigating', priority: 'high', unread: 0, last: 'MERCHANT scanning…',           when: '2h 28m', assignee: 'maya' },
  { id: 'CASE-2435', cust: 'Ingrid Sørensen',amount: '$3,950.00',  city: 'Oslo, NO',         status: 'resolved',      priority: 'high', unread: 0, last: 'approved by Maya',             when: '2h 33m', assignee: 'maya' },
  { id: 'CASE-2434', cust: 'Felix Wagner',   amount: '$2,470.00',  city: 'Vienna, AT',       status: 'awaiting',      priority: 'high', unread: 1, last: 'policy match · auto-hold',     when: '2h 41m', assignee: 'maya' },
  { id: 'CASE-2433', cust: 'Naomi Bryce',    amount: '$1,050.00',  city: 'Auckland, NZ',     status: 'resolved',      priority: 'med',  unread: 0, last: 'approved · within pattern',    when: '2h 48m', assignee: 'maya' },
  { id: 'CASE-2432', cust: 'Hannah Cole',    amount: '$640.00',    city: 'Glasgow, UK',      status: 'investigating', priority: 'med',  unread: 0, last: 'CUSTOMER at 70%',              when: '2h 55m', assignee: 'maya' },
  { id: 'CASE-2431', cust: 'Arjun Khanna',   amount: '$11,200.00', city: 'Delhi, IN',        status: 'awaiting',      priority: 'high', unread: 1, last: '4 agents complete · awaiting', when: '3h 02m', assignee: 'maya' },
  { id: 'CASE-2430', cust: 'Esme Laurent',   amount: '$3,200.00',  city: 'Paris, FR',        status: 'resolved',      priority: 'high', unread: 0, last: 'approved · confirmed travel',  when: '3h 11m', assignee: 'maya' },
];

// ─── Risk summary data — used inside the SYNTHESIS block at the end ─────
const RISK_SUMMARY = {
  score: 94,
  confidence: 0.97,
  verdicts: [
    { agent: 'customer', label: 'Anomaly',  level: 'HIGH',      tone: 'danger' },
    { agent: 'merchant', label: 'Merchant', level: 'HIGH',      tone: 'danger' },
    { agent: 'network',  label: 'Network',  level: 'HIGH',      tone: 'danger' },
    { agent: 'policy',   label: 'Policy',   level: 'AUTO-HOLD', tone: 'warn'   },
  ],
  recommendation: 'Auto-hold card, issue $4,280 provisional credit, open dispute under Reg E §1005.11.',
};

// ─── Conversation ───────────────────────────────────────────────────────
// Each agent message now has:
//   narrative — 2–3 sentence interpretation
//   viz       — signature visualization key
//   finding   — one-line summary
//   inspect   — { tool, query, result, file } folded behind a toggle
const MESSAGES = [
  { type: 'system', ts: '03:14:24', text: 'Case CASE-2461 opened · auto-triage flagged HIGH RISK · 4 agents joined the channel.' },

  // Customer agent
  { type: 'agent', agent: 'customer', ts: '03:14:28', body: [
    { kind: 'narrative', text: 'This is the strongest pattern break in Sarah\'s 8-year history. The amount is 50× her mean ticket, the timestamp is 4 hours outside any prior session window, and the location is novel — she has not transacted internationally since a 2019 Paris trip. Treating this as a high-confidence anomaly.' },
    { kind: 'viz', viz: 'customer-scatter' },
    { kind: 'finding', text: 'Anomaly across all three axes · amount z=6.4 · hour z=4.1 · geography novel.' },
    { kind: 'inspect', items: [
      { kind: 'tool', name: 'tidb.txn_history', q: 'WHERE member_id = m_8821 RANGE 8y' },
      { kind: 'result', text: '4,127 rows scanned · 38ms · mean_ticket=$84 · hours 09:00–22:00 PT · last_intl_txn = 2019-04-12 (CDG, FR)' },
      { kind: 'file', name: 'customer_pattern_anomaly.md', size: '2.1 KB' },
    ]},
  ]},

  // Merchant agent
  { type: 'agent', agent: 'merchant', ts: '03:14:35', body: [
    { kind: 'narrative', text: 'The acceptor is PT Sunset Holdings — gambling MCC, registered Sept 2024, so only 8 months old. Its 90-day chargeback rate is 4× the industry p99 and two acquirers have terminated it in the last 18 months. By itself this would justify a manual review.' },
    { kind: 'viz', viz: 'merchant-gauge' },
    { kind: 'finding', text: 'High-risk acceptor · 8.2% chargeback rate · 4× industry p99.' },
    { kind: 'inspect', items: [
      { kind: 'tool', name: 'tidb.merchants ⋈ disputes', q: 'merchant_id = mch_BL_2904 RANGE 90d' },
      { kind: 'result', text: '1 row · vector match on adverse-media index · 14ms · cb_rate_90d=0.082 · p99_industry=0.021 · acquirer_terminations=2' },
      { kind: 'file', name: 'merchant_risk_report.md', size: '3.4 KB' },
    ]},
  ]},

  // Network — replies to customer
  { type: 'agent', agent: 'network', ts: '03:14:41', body: [
    { kind: 'narrative', mention: 'customer', text: '@customer.history Building on your novel-geography read. The receiving account sits inside RING-142, a cluster we already know about — 47 nodes, 18 prior victims, active since March. The mule edges are tight and the cluster confidence is 0.91, which is well above our action threshold.' },
    { kind: 'viz', viz: 'network-graph' },
    { kind: 'finding', text: 'Receiving account links to RING-142 · 18 prior victims · 0.91 cluster confidence.' },
    { kind: 'inspect', items: [
      { kind: 'tool', name: 'graph.bfs + vector.search', q: 'FROM acq_A91F DEPTH 2  ANN k=10 ON ring_emb' },
      { kind: 'result', text: '47 nodes · 6 settlement accts · 3 mule signals · 412ms · matched RING-142 (cosine=0.91)' },
      { kind: 'file', name: 'network_graph.json', size: '11.8 KB' },
    ]},
  ]},

  // Maya asks
  { type: 'user', user: 'maya', ts: '03:14:49', text: '@network is any of the 18 prior victims also a Premium tier customer? Trying to gauge if this ring targets our segment.' },

  { type: 'agent', agent: 'network', ts: '03:14:51', body: [
    { kind: 'narrative', mention: 'maya', text: '@maya 11 of 18 are Premium, 4 Business, 3 Standard. The selectivity looks ticket-size driven rather than tier driven — every victim charge sat between $2.8k and $6.2k. Sarah\'s $4,280 lands right in the middle of that band.' },
  ]},

  // Policy
  { type: 'agent', agent: 'policy', ts: '03:14:53', body: [
    { kind: 'narrative', text: 'Read four facts from mem9 — pattern anomaly, high-risk merchant, ring match, Premium tier — and matched them against active policies. Two trigger: Reg E §1005.11 covers the unauthorized EFT path, and Internal P-12 requires an auto-hold when the amount exceeds $1,000 and a ring match is present. Premium tier puts the provisional credit SLA at one hour.' },
    { kind: 'viz', viz: 'policy-card' },
    { kind: 'finding', text: 'Auto-hold + $4,280 provisional credit eligible under P-12 · Premium 1h SLA.' },
    { kind: 'inspect', items: [
      { kind: 'tool', name: 'mem9.read + policy.match', q: 'case=2461 facts=[anomaly, merchant_risk, ring_match, tier=premium]' },
      { kind: 'result', text: '4 facts read · 2 policies matched · 9ms · regE_1005_11 + internal_p12 · sla_provisional=1h' },
      { kind: 'file', name: 'policy_match.md', size: '1.7 KB' },
    ]},
  ]},

  // Synthesis — system-level, not attributed to an agent
  { type: 'synthesis', ts: '03:14:56',
    score: RISK_SUMMARY.score,
    confidence: RISK_SUMMARY.confidence,
    verdicts: RISK_SUMMARY.verdicts,
    narrative: 'Three high-severity signals stack on one transaction: a 6.4σ behavioral break, a 4× p99 acceptor, and a confirmed RING-142 receiver. Reg E §1005.11 + Internal P-12 support automatic action; Premium tier puts the provisional credit SLA at one hour.',
    file: 'recommended_action.md',
    actions: [
      { t: 'Suspend card', d: '•••• 4421 · effective immediately' },
      { t: 'Issue provisional credit', d: '$4,280.00 → acct 8210' },
      { t: 'Open dispute case', d: 'Reg E §1005.11 · 10-day SLA' },
      { t: 'Write pattern → mem9', d: 'cluster_RING_142' },
    ],
    cited: [
      { f: 'customer_pattern_anomaly.md', a: 'customer' },
      { f: 'merchant_risk_report.md',     a: 'merchant' },
      { f: 'network_graph.json',          a: 'network'  },
      { f: 'policy_match.md',             a: 'policy'   },
    ],
  },
];

// ─── Visualization data ─────────────────────────────────────────────────
// Customer history scatter — 8-year baseline + tonight's outlier
const VIZ_CUSTOMER = {
  // synthetic but seeded — x = local hour (0..24), y = amount USD
  baseline: [
    [9.2,42],[10.1,68],[11.0,95],[11.5,55],[12.3,120],[12.4,88],[12.8,40],[13.0,150],
    [13.1,72],[13.3,28],[13.6,210],[14.0,64],[14.4,180],[14.8,96],[15.0,52],[15.2,38],
    [15.4,138],[15.6,84],[15.8,42],[16.0,76],[16.2,168],[16.5,108],[16.7,55],[16.9,32],
    [17.1,210],[17.3,86],[17.5,46],[17.7,124],[17.9,72],[18.0,38],[18.2,158],[18.4,92],
    [18.6,64],[18.8,114],[19.0,46],[19.2,86],[19.5,212],[19.7,58],[19.9,42],[20.1,148],
    [20.3,92],[20.5,68],[20.7,116],[20.9,40],[21.1,82],[21.3,164],[21.5,58],[21.7,38],
    [21.9,108],[22.0,72],[10.6,52],[11.8,142],[12.6,68],[13.8,196],[14.6,78],[15.5,118],
    [16.3,88],[17.4,148],[18.5,62],[19.4,176],[20.4,52],[21.0,128],[12.0,32],[13.5,224],
    [14.9,42],[16.1,196],[17.2,68],[18.3,108],[19.6,38],[20.6,154],[15.7,72],[16.8,52],
  ],
  outlier: { x: 3.23, y: 4280, label: 'TONIGHT' },
  caption: '$4,280 in Bali at 03:14 PT sits 6.4σ from her 8-year baseline.',
};

// Merchant gauge
const VIZ_MERCHANT = {
  merchantRate: 8.2,
  industry: { p50: 0.5, p90: 1.4, p99: 2.1 },
  max: 10,
  caption: 'PT Sunset Holdings · 8.2% chargeback rate · 4× industry p99.',
};

// Network graph (positions pre-computed for reproducibility)
// Center = receiving account. 18 prior victims marked. Mule edges flagged.
const VIZ_NETWORK = (() => {
  // Build a small force-directed-looking cluster around the receiver.
  const nodes = [];
  const edges = [];
  // Center node
  nodes.push({ id: 'r0', x: 160, y: 90, r: 6, kind: 'receiver' });
  // 6 settlement accounts inner ring
  const settleR = 32;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    nodes.push({ id: 's' + i, x: 160 + Math.cos(a) * settleR, y: 90 + Math.sin(a) * settleR, r: 3.4, kind: i < 3 ? 'mule' : 'settle' });
    edges.push({ a: 'r0', b: 's' + i, mule: i < 3 });
  }
  // 40 outer nodes — 18 victims, rest neutral
  // Seeded pseudo-random
  let seed = 91; const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < 40; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = 50 + rand() * 36;
    const x = 160 + Math.cos(angle) * radius;
    const y = 90 + Math.sin(angle) * radius * 0.72; // squish vertically to fit 180px
    const victim = i < 18;
    nodes.push({ id: 'n' + i, x, y, r: 2.6 + rand() * 0.8, kind: victim ? 'victim' : 'neutral' });
    // connect to a settlement
    const parent = 's' + (i % 6);
    edges.push({ a: parent, b: 'n' + i, mule: false });
    // a few cross-edges for graph texture
    if (i % 5 === 0 && i > 0) edges.push({ a: 'n' + i, b: 'n' + (i - 3), mule: false });
  }
  return { nodes, edges, caption: 'RING-142 · 47 nodes · 18 prior victims · 0.91 cluster confidence.' };
})();

// Policy match card
const VIZ_POLICY = {
  rows: [
    {
      code: 'Reg E §1005.11',
      title: 'Unauthorized EFT',
      trigger: 'Cardholder disputes transaction in-app + ring match present',
      eligibility: ['Provisional credit within 10 business days', 'Investigation up to 45 days'],
    },
    {
      code: 'Internal P-12',
      title: 'Auto-hold on cluster match',
      trigger: 'Amount ≥ $1,000 AND cluster confidence ≥ 0.85',
      eligibility: ['Suspend card immediately', '1h provisional credit (Premium SLA)', 'Open dispute case'],
    },
  ],
  caption: 'Premium SLA · 1-hour provisional credit window.',
};

// ─── "Under the Hood" panel — TiDB / mem9 / drive9 telemetry ────────────
const UNDER_HOOD = {
  metrics: {
    qps: 1284,
    p99: '14.2 ms',
    vector: 312,
    htap: 'OLTP 71% · OLAP 29%',
  },
  queries: [
    { ts: '03:14:28.041', kind: 'OLTP', table: 'txn_history',  rows: '4,127',  latency: '38ms',  agent: 'customer' },
    { ts: '03:14:28.083', kind: 'OLAP', table: 'txn_history',  rows: '4,127',  latency: '11ms',  agent: 'customer', note: 'AGG mean+stddev' },
    { ts: '03:14:35.211', kind: 'OLTP', table: 'merchants',    rows: '1',      latency: '4ms',   agent: 'merchant' },
    { ts: '03:14:35.219', kind: 'OLAP', table: 'disputes',     rows: '12,418', latency: '14ms',  agent: 'merchant', note: 'cb_rate 90d window' },
    { ts: '03:14:35.241', kind: 'VEC',  table: 'merchant_emb', rows: 'ANN k=10', latency: '6ms', agent: 'merchant', note: 'adverse-media match' },
    { ts: '03:14:41.118', kind: 'GRAPH',table: 'accounts',     rows: '47',     latency: '38ms',  agent: 'network',  note: 'BFS DEPTH 2 from acq_A91F' },
    { ts: '03:14:41.198', kind: 'VEC',  table: 'ring_emb',     rows: 'ANN k=10', latency: '8ms', agent: 'network',  note: 'cosine 0.91 → RING-142' },
    { ts: '03:14:53.024', kind: 'OLTP', table: 'mem9.facts',   rows: '4',      latency: '3ms',   agent: 'policy' },
    { ts: '03:14:53.036', kind: 'OLTP', table: 'policies',     rows: '2',      latency: '6ms',   agent: 'policy',   note: 'regE_1005_11, internal_p12' },
  ],
  mem9: {
    read: 4,
    queued: 1,
    facts: [
      { id: 'fact_a1', agent: 'customer', text: 'amount_z=6.4 · hour_z=4.1 · geo=novel', op: 'WRITE' },
      { id: 'fact_a2', agent: 'merchant', text: 'cb_rate_90d=0.082 · acq_term=2',         op: 'WRITE' },
      { id: 'fact_a3', agent: 'network',  text: 'cluster=RING-142 · conf=0.91',            op: 'WRITE' },
      { id: 'fact_a4', agent: 'policy',   text: 'tier=premium · sla=1h',                   op: 'READ'  },
      { id: 'fact_a5', agent: 'policy',   text: 'pattern_RING_142 · seen_in=CASE-2461',    op: 'QUEUED' },
    ],
  },
  drive9: {
    pinned: 5,
    files: [
      { name: 'customer_pattern_anomaly.md', size: '2.1 KB', agent: 'customer' },
      { name: 'merchant_risk_report.md',     size: '3.4 KB', agent: 'merchant' },
      { name: 'network_graph.json',          size: '11.8 KB',agent: 'network'  },
      { name: 'policy_match.md',             size: '1.7 KB', agent: 'policy'   },
      { name: 'recommended_action.md',       size: '1.2 KB', agent: 'policy'   },
    ],
  },
};

// Agent profile — recent activity for the side drawer
const AGENT_HISTORY = {
  customer: {
    todayStats: { cases: 31, findings: 47, facts: 84 },
    activity: [
      { case: 'CASE-2461', text: 'Anomaly z=6.4 amount · z=4.1 hour · geography novel', when: 'just now' },
      { case: 'CASE-2460', text: 'David Kim · 0 anomalies in 8y baseline', when: '5m ago' },
      { case: 'CASE-2459', text: 'Aiko Tanaka · 3 prior Bucharest trips · pattern matches', when: '7m ago' },
      { case: 'CASE-2456', text: 'Rohan Verma · pulling 8y history…', when: '14m ago' },
      { case: 'CASE-2447', text: 'Diego Romero · false positive — recurring annual purchase', when: '1h 11m ago' },
    ],
  },
  merchant: {
    todayStats: { cases: 28, findings: 31, facts: 64 },
    activity: [
      { case: 'CASE-2461', text: 'PT Sunset Holdings · MCC 7995 · CB 8.2%', when: 'just now' },
      { case: 'CASE-2459', text: 'mch_BUC_4 · MCC 5712 · CB 11.4% · flagged', when: '7m ago' },
      { case: 'CASE-2456', text: 'No merchant signal · clean profile', when: '14m ago' },
      { case: 'CASE-2444', text: 'Established merchant · 6y history · approved', when: '1h 29m ago' },
    ],
  },
  network: {
    todayStats: { cases: 24, findings: 18, facts: 52 },
    activity: [
      { case: 'CASE-2461', text: 'acq_A91F → cluster RING-142 (0.91)', when: 'just now' },
      { case: 'CASE-2460', text: 'Tracing acq_F3A1…', when: '5m ago' },
      { case: 'CASE-2454', text: 'acq_K7H2 → cluster RING-098 (0.84)', when: '21m ago' },
      { case: 'CASE-2447', text: 'Isolated account · no cluster match', when: '1h 11m ago' },
    ],
  },
  policy: {
    todayStats: { cases: 19, findings: 22, facts: 41 },
    activity: [
      { case: 'CASE-2461', text: 'Reg E §1005.11 + P-12 · auto-hold + 1h SLA', when: 'just now' },
      { case: 'CASE-2458', text: 'Reg E §1005.11 · provisional credit', when: '11m ago' },
      { case: 'CASE-2454', text: 'Escalate path B · over-threshold + ring match', when: '21m ago' },
      { case: 'CASE-2447', text: 'P-9 · cardholder zero-liability applies', when: '1h 11m ago' },
    ],
  },
};

const CASE_META = {
  id: 'CASE-2461',
  customer: { name: 'Sarah Chen', id: 'm_8821', tier: 'Premium', since: '2018', email: 's.chen@example.com', phone: '+1 415 ··· 4019' },
  txn: { id: 'txn_9F2A···4B', amount: '$4,280.00', merchant: 'PT Sunset Holdings', city: 'Bali, ID', time: '03:14:24 PT' },
  contact: 'Customer reached out via app: "I did not make this transaction. I am in San Francisco."',
};

Object.assign(window, {
  CHAT_AGENTS, ANALYST, TEAM_MEMBERS, CHANNELS, MESSAGES, AGENT_HISTORY, CASE_META,
  RISK_SUMMARY, VIZ_CUSTOMER, VIZ_MERCHANT, VIZ_NETWORK, VIZ_POLICY, UNDER_HOOD,
});
