# tcg-tracker

This repository is currently in a specification-driven build phase for a TCG
card and portfolio tracking web application. The working rules for the project
live in `.specify/memory/constitution.md`.

## Workflow

All non-trivial work follows this path:

1. Create or update `spec.md`.
2. Produce `plan.md` and any supporting design artifacts.
3. Generate `tasks.md` with exact file paths and verification steps.
4. Implement only after the planning artifacts are implementation-ready.

## Current Status

The current implementation plan adopts this stack:

- TypeScript 5.9 on Node.js 22 LTS
- Next.js 16 with React 19
- PostgreSQL 17 with Prisma ORM
- Docker Compose for local PostgreSQL
- TanStack Query, Recharts, and Zod
- Vitest, React Testing Library, and Playwright

The first planned feature is documented under
[`specs/001-card-portfolio-tracker/`](/Users/cmaier/Source/tcg-tracker/specs/001-card-portfolio-tracker).

## Expected Commands

```bash
npm install
npm run db:up
npm run dev
npm run db:migrate
npm run test:unit
npm run test:integration
npm run test:e2e
npm run db:down
```
