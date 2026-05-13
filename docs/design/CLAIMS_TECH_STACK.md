# CLAIMS Tech Stack

Reference document. Decisions consolidated as of frontend kickoff.

## Frontend (Min's territory)

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Runtime | Node.js 20 LTS |
| Package manager | pnpm |
| Styling | Tailwind CSS + CSS variables |
| Component primitives | shadcn/ui |
| Icons | lucide-react |
| 2D charts | Recharts |
| Network graph | react-force-graph-2d |
| Client state | Zustand |
| Mock data layer | MSW (Mock Service Worker) |
| Animation | Framer Motion |
| Streaming protocol | Server-Sent Events (SSE) |
| Linter / formatter | ESLint + Prettier |
| Hosting | Vercel (Seoul region, icn1) |

## Backend (bb7133's territory)

Mostly preserved from existing repo. Frontend treats it as a black box behind a REST + SSE contract.

| Layer | Current |
|---|---|
| Runtime | Node.js |
| Language | JavaScript |
| Database | TiDB Cloud Serverless (target) / TiDB Zero (local) |
| Deployment | TBD by bb7133 |

## Repo Structure (Monorepo)

Single repo with pnpm workspaces. Clear ownership boundaries.

```
ai-risk-investigation-demo/
├── frontend/                  ← new Next.js app (Min)
│   ├── app/                   App Router pages
│   ├── components/
│   │   ├── ui/                shadcn primitives
│   │   ├── agents/            Agent message components
│   │   ├── viz/               Inline visualizations
│   │   ├── case/              Case header, conversation, panels
│   │   └── layout/            Shell, sidebar, top bar
│   ├── lib/
│   │   ├── api/               API client (all backend calls go here)
│   │   ├── store/             Zustand stores
│   │   └── utils/             Helpers
│   ├── mocks/                 MSW handlers (the fake backend)
│   │   ├── handlers.ts
│   │   ├── data/              Hardcoded demo scenarios
│   │   └── browser.ts
│   ├── types/                 Shared TypeScript types
│   │   └── api.ts             API contract types
│   ├── public/                Static assets
│   ├── styles/                globals.css with CSS variables
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                    ← existing backend (bb7133, unchanged)
├── data/                      ← existing seed data (bb7133)
├── scripts/                   ← existing data scripts (bb7133)
├── docs/
│   └── design/                ← design patches and instructions
│       ├── CLAIMS_MOCKUP_REFINEMENT.md
│       ├── CLAIMS_PATCH_synthesis.md
│       ├── CLAIMS_PATCH_scenario.md
│       ├── CLAIMS_TECH_STACK.md
│       └── AGENT_GUARDRAILS.md
│
├── pnpm-workspace.yaml        ← new
├── package.json               ← workspace root
├── README.md
└── .gitignore
```

### Ownership

| Path | Owner |
|---|---|
| `frontend/` | Min (frontend lead) |
| `server/`, `data/`, `scripts/` | bb7133 (eng lead) |
| `docs/design/` | Min (PM lead) |
| Root config | Coordinated |

### Legacy frontend cleanup

The existing `src/` and `index.html` are the old Vite frontend. Delete after `frontend/` is verified working. **Not in scope for Phase 1.** Coordinate with bb7133 before deleting.

## Frontend-Backend Separation Rule

The frontend is built **completely independently** of the backend during all initial phases.

- All API calls go through `frontend/lib/api/` client functions.
- During development, those API calls are intercepted by MSW handlers in `frontend/mocks/`.
- MSW returns hardcoded scenarios (Sarah Chen case timeline, etc.).
- No real HTTP request reaches `server/` until the contract is finalized and Min explicitly switches MSW off.

Detailed rules in `AGENT_GUARDRAILS.md`.

## Architecture

```
[User browser]
    ↓
[Vercel Edge - Seoul region]
    └─ Next.js frontend
         ↓ REST + SSE (after backend wiring phase)
[Backend service - location TBD]
    └─ Agent orchestration, LLM calls, SSE streaming
         ↓
[TiDB Cloud Serverless]
```

## Out of Scope (first demo)

Auth, i18n, testing, real LLM integration, mobile responsive, Storybook, monitoring, custom domain, ICP filing. All postponed until after first Korea demo.

## Open Decisions

1. ~~Repo structure~~ → **Monorepo, decided.**
2. **Backend deployment target.** bb7133 decides.
3. **API contract specifics.** Drafted from frontend after Phase 1 skeleton lands.
4. **LLM provider.** Backend concern, later.
5. **Real-time vs. canned demo data** for first Korea demo. Likely canned.
