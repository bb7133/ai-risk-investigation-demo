// Realistic Sarah Chen scenario content — used across artboards.

// Per-agent thinking traces — terse detective-work lines with tool calls.
const TRACES = {
  customer: [
    { t: '0:02', kind: 'thought', text: 'Pulling card txn history for member m_8821 (Sarah Chen).' },
    { t: '0:04', kind: 'tool',    text: 'query txn_history.read(member=m_8821, range=8y)' },
    { t: '0:06', kind: 'result',  text: '→ 4,127 transactions. last_intl=2019-04-12 (CDG, FR).' },
    { t: '0:09', kind: 'thought', text: 'Tonight\'s txn at 03:14 PT, $4,280, Bali ID.' },
    { t: '0:11', kind: 'thought', text: 'Customer typically transacts 09:00–22:00 PT, mean ticket $84.' },
    { t: '0:13', kind: 'tool',    text: 'compute z_score(amount, hour, geo)' },
    { t: '0:15', kind: 'result',  text: '→ z=6.4 (amount), z=4.1 (hour), geo=novel.' },
    { t: '0:18', kind: 'finding', text: 'Pattern does not match. Anomaly across all three axes.' },
  ],
  merchant: [
    { t: '0:02', kind: 'thought', text: 'Resolving merchant id mch_BL_2904 (PT Sunset Holdings).' },
    { t: '0:05', kind: 'tool',    text: 'merchant.profile(mch_BL_2904)' },
    { t: '0:07', kind: 'result',  text: '→ MCC 7995, registered 2024-09, 7-month history.' },
    { t: '0:10', kind: 'tool',    text: 'merchant.disputes(mch_BL_2904, range=90d)' },
    { t: '0:13', kind: 'result',  text: '→ chargeback rate 8.2% (industry p99=2.1%).' },
    { t: '0:16', kind: 'thought', text: 'Cross-checking adverse media + acquirer flags.' },
    { t: '0:19', kind: 'tool',    text: 'risk.adverse_media(mch_BL_2904)' },
    { t: '0:22', kind: 'finding', text: 'High-risk merchant. 2 acquirer terminations in 18mo.' },
  ],
  network: [
    { t: '0:03', kind: 'thought', text: 'Tracing receiving acct acq_A91F → 2-hop expansion.' },
    { t: '0:06', kind: 'tool',    text: 'graph.expand(acq_A91F, hops=2)' },
    { t: '0:11', kind: 'result',  text: '→ 47 nodes, 6 settlement accounts, 3 mule signals.' },
    { t: '0:14', kind: 'thought', text: 'Comparing against known fraud cluster registry.' },
    { t: '0:17', kind: 'tool',    text: 'cluster.match(graph_hash=0x4f81…, threshold=0.7)' },
    { t: '0:21', kind: 'result',  text: '→ match cluster_RING_142 confidence 0.91.' },
    { t: '0:24', kind: 'finding', text: 'Linked to RING-142. 18 prior victims. Active since Mar 2026.' },
  ],
  policy: [
    { t: '0:02', kind: 'thought', text: 'Loading policy index. Reading mem9 for case context.' },
    { t: '0:05', kind: 'tool',    text: 'mem9.read(case=2461, since=now-30s)' },
    { t: '0:08', kind: 'result',  text: '→ 4 facts: anomaly, merchant_high_risk, fraud_ring, premium_tier.' },
    { t: '0:11', kind: 'tool',    text: 'policy.match(facts=[…])' },
    { t: '0:14', kind: 'result',  text: '→ Reg E §1005.11, Internal P-12 (auto-hold).' },
    { t: '0:17', kind: 'thought', text: 'Premium tier qualifies for 1-hr provisional credit.' },
    { t: '0:20', kind: 'finding', text: 'Auto-hold + $4,280 provisional credit eligible.' },
  ],
};

// drive9 evidence files produced by each agent
const DRIVE9 = [
  { name: 'customer_pattern_anomaly.md', author: 'customer', size: '2.1KB', t: '0:18', preview: 'Z-scores: amount 6.4, hour 4.1, geography novel.' },
  { name: 'merchant_risk_report.md',     author: 'merchant', size: '3.4KB', t: '0:22', preview: 'MCC 7995, CB rate 8.2%, 2 acquirer terminations.' },
  { name: 'network_graph.json',          author: 'network',  size: '11.8KB', t: '0:24', preview: '47 nodes, cluster_RING_142 (conf 0.91).' },
  { name: 'policy_match.md',             author: 'policy',   size: '1.7KB', t: '0:20', preview: 'Reg E §1005.11; Internal P-12 auto-hold.' },
  { name: 'recommendation.md',           author: 'system',   size: '0.9KB', t: '0:26', preview: 'AUTO-HOLD card · $4,280 provisional credit · open dispute.' },
];

// mem9 facts written by agents, ordered chronologically
const MEM9 = [
  { id: 'f1', t: '0:06', author: 'customer', text: 'last_international_txn = 2019-04-12 CDG', readBy: ['policy', 'network'] },
  { id: 'f2', t: '0:07', author: 'merchant', text: 'merchant.mcc = 7995 (gambling)', readBy: ['policy', 'network'] },
  { id: 'f3', t: '0:11', author: 'network',  text: 'receiving_acct.country = ID', readBy: ['policy'] },
  { id: 'f4', t: '0:13', author: 'customer', text: 'anomaly.z_amount = 6.4', readBy: ['policy'] },
  { id: 'f5', t: '0:13', author: 'merchant', text: 'merchant.cb_rate_90d = 0.082', readBy: ['policy'] },
  { id: 'f6', t: '0:21', author: 'network',  text: 'cluster_match = RING-142 (0.91)', readBy: ['policy'] },
  { id: 'f7', t: '0:14', author: 'policy',   text: 'tier.premium = true → 1hr SLA', readBy: [] },
];

const CASE = {
  id: 'CASE-2461',
  customer: { id: 'm_8821', name: 'Sarah Chen', tier: 'Premium', since: '2018' },
  txn: { id: 'txn_9F2A...4B', amount: 4280.00, currency: 'USD', merchant: 'PT Sunset Holdings', city: 'Bali', country: 'ID', when: '03:14 PT' },
  contact: 'I did not make this transaction. I am in San Francisco.',
};

Object.assign(window, { TRACES, DRIVE9, MEM9, CASE });
