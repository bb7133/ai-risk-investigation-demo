# CLAIMS Phase 1: Frontend Skeleton

This is the first phase of frontend work for CLAIMS. Read this together with:

- `docs/design/AGENT_GUARDRAILS.md` (mandatory constraints)
- `docs/design/CLAIMS_TECH_STACK.md` (stack and repo structure)
- `docs/design/CLAIMS_DESIGN.md` (visual spec and scenario script)
- `docs/design/mockups/*.png` (visual source of truth)
- `docs/design/reference-code/` (Claude Design exported code, visual reference)

Read all of these before writing any code. The mockups and reference code show exactly what the result should look like.

## Goal

Stand up the frontend skeleton with the Sarah Chen case rendered statically. Match the mockups visually as closely as possible. No animations yet, no demo flow yet, no real backend. Just structure and content that matches the screenshots.

If a person can open the app and see a layout that matches the mockups, with the Sarah Chen case fully rendered, Phase 1 is complete.

## Scope

### A. Monorepo setup (repo root)

1. Create `pnpm-workspace.yaml` at the repo root:
   ```yaml
   packages:
     - "frontend"
     - "server"
   ```
2. Do NOT modify the existing root `package.json` yet. Coordination with bb7133 needed first. Leave it alone.
3. Do NOT delete the existing `src/` or `index.html`. Those go later, coordinated with bb7133.

### B. Frontend bootstrap (`frontend/`)

```bash
# From repo root
mkdir frontend && cd frontend
pnpm create next-app@latest . --typescript --tailwind --app --use-pnpm --eslint --import-alias "@/*"

# Dependencies
pnpm add framer-motion recharts react-force-graph-2d zustand lucide-react clsx tailwind-merge
pnpm add -D msw prettier

# shadcn (New York style, neutral base, CSS variables yes)
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add card badge button tabs tooltip
```

### C. Type definitions (`frontend/types/api.ts`)

Write the API contract types first. Derive the exact fields from the scenario script in `CLAIMS_DESIGN.md`.

Required types (use TypeScript discriminated unions where listed):

- `Case` — case header and list-row data
- `Customer` — for the right panel customer block
- `Transaction` — transaction details
- `SystemEvent` — case opening, auto-triage notices
- `AgentMessage` — discriminated union by agent:
  - `CustomerHistoryMessage` (narrative, scatter data points, finding)
  - `MerchantAnalysisMessage` (narrative, gauge data, finding)
  - `NetworkGraphMessage` (narrative, graph nodes and edges, finding, optional follow-up reply)
  - `PolicyLookupMessage` (narrative, matched policies array, finding)
- `AnalystMessage` (for Maya's intervention)
- `SynthesisResult` (risk score, confidence, four verdicts, recommended action narrative, file pills, action list, optional resolved metadata)
- `TimelineEntry` — discriminated union of the above

### D. API client (`frontend/lib/api/`)

- `frontend/lib/api/client.ts` — typed fetch wrapper, all errors normalized
- `frontend/lib/api/cases.ts` — functions:
  - `listCases(): Promise<Case[]>`
  - `getCase(id: string): Promise<Case>`
  - `getCaseTimeline(id: string): Promise<TimelineEntry[]>`

All functions hit relative paths (`/api/cases`, etc.). MSW intercepts in dev. No environment-variable base URL yet.

### E. Mock data layer (`frontend/mocks/`)

1. Set up MSW for browser:
   - `frontend/mocks/handlers.ts` — handlers for the three endpoints above
   - `frontend/mocks/browser.ts` — service worker setup
   - `frontend/mocks/data/cases.ts` — 12 case stubs (Sarah Chen first, matching the mockup sidebar exactly)
   - `frontend/mocks/data/sarah-chen-timeline.ts` — full timeline matching the scenario script in `CLAIMS_DESIGN.md`
2. MSW starts only in development, not production.
3. Only Sarah Chen has a full timeline. Other 11 cases are stubs with name, amount, status, time, badge count.

Case sidebar data from the mockup (in display order):
```
Sarah Chen       $4,280     AWAITING REVIEW   2m       (red badge: 3)
Lucia Mendoza    $3,400     AWAITING REVIEW   11m      (red badge: 1)
Anika Patel      $3,100     AWAITING REVIEW   21m      (red badge: 1)
Mohamed Saleh    $5,980     AWAITING REVIEW   47m      (red badge: 2)
Hiro Sato        $6,210     AWAITING REVIEW   1h 14m   (red badge: 1)
Selin Demir      $7,820     AWAITING REVIEW   1h 29m   (red badge: 1)
Olivia Reed      $5,140     AWAITING REVIEW   1h 50m   (red badge: 1)
Sofia Russo      $4,890     AWAITING REVIEW   2h 04m   (red badge: 2)
Mei Ling         $8,400     AWAITING REVIEW   2h 19m   (red badge: 1)
Felix Wagner     $2,470     AWAITING REVIEW   2h 41m   (red badge: 1)
Arjun Khanna     $11,200    AWAITING REVIEW   3h 02m   (red badge: 1)
```

### F. Layout components (`frontend/components/layout/`)

Match the screenshots:

- `AppShell.tsx` — top bar + three columns (sidebar, main, right panel)
- `TopBar.tsx` — CLAiMS logo with subtitle, search bar with ⌘K, New case button, user info
- `CasesSidebar.tsx` — header, "Awaiting my review / High priority" filter with badges (11 and 15), case list
- `RightPanel.tsx` — Case / Stack toggle at the top, switches between two modes:
  - **Case mode** (default): Customer block, Customer contact callout, Agents list, Team list, Pinned files
  - **Stack mode**: Under the Hood header, metrics strip, TiDB query log, mem9 facts, drive9 pinned, footer
- `RightPanelCollapsed.tsx` — collapsed state with vertical `C` / `S` tabs and vertical "UNDER THE HOOD" label

Phase 1 supports toggling between Case and Stack mode. Phase 1 does NOT need the panel to actually collapse (the `<` button can be visible but non-functional).

### G. Case view components (`frontend/components/case/`)

- `CaseHeader.tsx` — customer avatar, name, tier, case ID, HIGH PRIORITY badge, transaction line
- `CaseConversation.tsx` — scrollable timeline, renders each `TimelineEntry` by type, in order
- `SystemEventLine.tsx` — compact muted line for system events
- `SynthesisCard.tsx` — full Synthesis card with risk score block, verdict pills, recommended action, cited evidence, actions on execute, optional resolved strip
- `QuickActionChips.tsx` — 4 chips below the timeline
- `MessageInput.tsx` — input box with @mentions placeholder text

### H. Agent message components (`frontend/components/agents/`)

One per agent. Each renders the skeleton from `CLAIMS_DESIGN.md` section "Agent messages."

- `CustomerHistoryMessage.tsx`
- `MerchantAnalysisMessage.tsx`
- `NetworkGraphMessage.tsx` (handles both initial analysis and Maya follow-up reply)
- `PolicyLookupMessage.tsx`
- `AnalystMessageBubble.tsx` — for Maya's intervention

Visualizations in Phase 1: build them if straightforward, use labeled placeholder boxes if not. Either approach is acceptable. Match the mockup if implementing. If using placeholders, label them clearly (e.g. `[Customer scatter — implemented in Phase 2]`) with a dashed border.

Recommended priority order for visualizations in Phase 1:
1. Policy decision card (simplest, just two stacked card components) — IMPLEMENT
2. Merchant gauge (recharts BarChart with reference lines) — IMPLEMENT
3. Customer scatter (recharts ScatterChart) — IMPLEMENT
4. Network graph (react-force-graph-2d) — PLACEHOLDER ok if complex

### I. Routing (`frontend/app/`)

- `frontend/app/page.tsx` — redirects to `/cases/CASE-2461`
- `frontend/app/cases/[id]/page.tsx` — fetches case + timeline, renders `AppShell` with conversation in the main column
- `frontend/app/layout.tsx` — root layout, initializes MSW client-side in dev

### J. Styling (`frontend/styles/globals.css` and `tailwind.config.ts`)

Match the mockup palette. Reference code at `docs/design/reference-code/` for exact values.

CSS variables to define:
```css
:root {
  /* Surfaces */
  --color-bg: ...;
  --color-surface: ...;
  --color-surface-muted: ...;
  --color-border: ...;
  --color-text: ...;
  --color-text-muted: ...;
  
  /* Agent colors */
  --color-agent-customer: ...;   /* blue family, see Customer History avatar */
  --color-agent-merchant: ...;   /* purple family */
  --color-agent-network: ...;    /* orange family */
  --color-agent-policy: ...;     /* green family */
  --color-agent-synthesis: ...;  /* green accent for Σ */
  
  /* Severity / state */
  --color-severity-high: ...;    /* red, e.g. HIGH PRIORITY badge */
  --color-severity-medium: ...;
  --color-finding: ...;          /* amber/orange for Finding box */
  --color-success: ...;          /* green for RESOLVED */
}
```

Expose these in `tailwind.config.ts` so utility classes work (`bg-surface`, `text-agent-customer`, `border-finding`, etc.).

## What Phase 1 Does NOT Include

- Animations or transitions (Framer Motion not yet used)
- Real agent message streaming (timeline renders all at once)
- Real backend connection
- Customer dispute scene at 03:13 (push, in-app confirmation) — not in the mockups, deferred
- Mobile push notification handoff
- Demo control bar (Play, Pause, speed)
- Right panel actual collapse behavior (toggle visible, panel always expanded for now)
- Execute button behavior (visual only)
- Inspect query expansion behavior (visual only, default collapsed)
- Quick action chips functionality (visual only)
- New case button functionality (visual only)
- Search bar functionality
- Multi-case navigation (other 11 cases in sidebar are not clickable yet)
- Replay button functionality
- Stack mode live updating (Stack content is static mock data)

## Acceptance Criteria

When Phase 1 is done:

1. `cd frontend && pnpm dev` opens the app at `http://localhost:3000`
2. Layout matches the mockups: top bar, three columns
3. Cases sidebar shows 12 cases with Sarah Chen highlighted
4. Case header shows Sarah Chen's transaction details
5. Conversation timeline renders:
   - System event line (case opened)
   - Four agent messages (Customer History, Merchant Analysis, Network Graph, Policy Lookup) with visualizations or labeled placeholders
   - Maya's analyst intervention
   - Network Graph follow-up reply
   - Synthesis card with risk score, 4 verdict pills, recommended action, cited evidence, actions, optional resolved strip
6. Right panel:
   - Case mode shows Customer / Contact / Agents / Team / Pinned files
   - Stack mode shows Under the Hood with metrics, query log, mem9 facts, drive9 pinned, footer
   - Toggle between Case and Stack works
7. Quick action chips and message input are visible at the bottom
8. No console errors, no TypeScript errors, ESLint clean
9. Visual fidelity to mockups is "close enough that a reviewer can recognize each component"

## Deliverables

After completing Phase 1, report:

1. List of files created (paths)
2. Any deviation from this instruction with reasoning
3. Any open questions
4. Description (or screenshot) of what the running app looks like
5. Suggested Phase 2 scope (likely: visualizations not yet built, animations, real backend wiring, demo flow scenes)
