# CLAIMS Agent Guardrails

Constraints for any AI coding agent (Claude Code, etc.) working on this repo. Included in every phase instruction.

## Scope of Work

You work **only inside `frontend/`**. Nothing else gets created, modified, or deleted unless explicitly listed in the current phase instruction.

### Read-only (you may read for context, never write)

- `server/` (bb7133's backend, do not touch)
- `data/` (seed data, do not touch)
- `scripts/` (data generation scripts, do not touch)
- `docs/` (design specs and reference, read but do not modify)
- Existing root `package.json`, `package-lock.json`, `index.html`, `src/` (legacy, slated for removal but not by you in this phase)

### Write-allowed

- Everything under `frontend/`
- New files at root only if listed in the phase instruction (`pnpm-workspace.yaml`, etc.)

If a task seems to require touching a read-only path, stop and ask. Do not improvise.

## Frontend-Backend Separation

The frontend is built independently of the real backend. There is no live backend during Phase 1 and probably not during Phase 2 either.

### Rules

1. **No real HTTP requests to the backend.** Every `fetch` call in app code goes to a path like `/api/cases`, which MSW intercepts and returns hardcoded data.
2. **All API logic flows through `frontend/lib/api/`.** Components never call `fetch` directly. They call typed functions from this directory.
3. **MSW handlers live in `frontend/mocks/`.** This is where the "fake backend" is. Hardcoded scenario data goes in `frontend/mocks/data/`.
4. **API contract types live in `frontend/types/api.ts`.** Both the client functions and the MSW handlers import from this file. This is the source of truth for the contract.
5. **Never import from `server/`.** Even though it is in the same repo, frontend and backend are independent packages.

### Why

This separation lets bb7133 rebuild or change `server/` freely without breaking the frontend. It also lets the frontend ship a fully working demo on Vercel using only MSW data. When the real backend is ready, only the MSW switch and the API client base URL need to change.

## Coding Conventions

### TypeScript

- **Strict mode on.** `noImplicitAny`, `strictNullChecks`, all enabled in `tsconfig.json`.
- **No `any`.** If you need a flexible type, use `unknown` and narrow it.
- **Define types before implementing.** When adding a new API endpoint or data shape, write the type in `frontend/types/` first, then implement.
- **Type exports use `type` keyword.** `export type Case = {...}`, not `export interface Case`.

### React and Next.js

- **Server Components by default.** Only mark a file with `"use client"` when it genuinely needs client behavior (state, effects, event handlers, browser APIs, Framer Motion).
- **One component per file.** Filename matches export name in PascalCase.
- **Compose small components.** If a component file exceeds 200 lines, split it.
- **No prop drilling beyond 2 levels.** Reach for Zustand or composition instead.

### Styling

- **Tailwind utility classes only.** No inline `style` objects unless dynamically computed.
- **No separate CSS files** except `frontend/styles/globals.css` for CSS variable definitions.
- **CSS variables for design tokens.** Agent colors, severity colors, mode themes all go through CSS variables defined in `globals.css` and referenced in `tailwind.config.ts`.
- **shadcn/ui first.** Before building a primitive (Card, Dialog, Tabs, etc.), check if shadcn already provides it. Add it via `pnpm dlx shadcn@latest add <component>`.

### File structure

```
frontend/components/agents/CustomerHistoryMessage.tsx
frontend/components/agents/MerchantAnalysisMessage.tsx
frontend/components/agents/NetworkGraphMessage.tsx
frontend/components/agents/PolicyLookupMessage.tsx
frontend/components/case/CaseHeader.tsx
frontend/components/case/CaseConversation.tsx
frontend/components/case/SynthesisCard.tsx
frontend/components/viz/CustomerScatter.tsx
frontend/components/viz/MerchantGauge.tsx
frontend/components/viz/NetworkGraphViz.tsx
frontend/components/viz/PolicyDecisionCard.tsx
frontend/components/layout/AppShell.tsx
frontend/components/layout/CasesSidebar.tsx
frontend/components/layout/RightPanel.tsx
frontend/components/layout/TopBar.tsx
```

Match this pattern when creating new components.

## Dependencies

- **Do not install new packages without listing them.** When you need a library not already in `package.json`, stop and list it in your response with a one-line rationale. Wait for approval before installing.
- **Approved dependencies** are listed in `CLAIMS_TECH_STACK.md`. Anything in that list can be installed without asking.

## When You Are Blocked or Uncertain

Stop. Do not improvise. Output:

1. What you were trying to do.
2. What is blocking you (missing info, ambiguous spec, conflict between docs).
3. What options you see.
4. Which option you would pick and why, if forced to choose.

Wait for direction. Do not silently make assumptions and continue.

## Out of Scope Always

These never happen unless explicitly requested:

- Authentication, login flows, user management
- Internationalization (i18n)
- Mobile responsive design
- Accessibility audits beyond basic semantic HTML
- Tests (no Jest, Vitest, Playwright)
- Storybook
- Performance optimization beyond Next.js defaults
- SEO meta tags beyond basic title and description
- Analytics integration
- Real LLM API calls (everything is mocked)
- Real database connections (everything is mocked)

If a task instruction seems to require any of the above, stop and ask first.

## Communication

When reporting progress:
- State what was created or changed in concrete file paths.
- Note any deviation from the phase instruction with reasoning.
- Flag anything that depends on a decision Min has not made yet.
- Do not editorialize about quality or completeness. Just report.
