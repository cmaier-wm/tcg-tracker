# tcg-tracker

This repository contains a TCG card and portfolio tracking web application
built with Next.js. The working rules for the project live in
`.specify/memory/constitution.md`.

## Workflow

All non-trivial work follows this path:

1. Create or update `spec.md`.
2. Produce `plan.md` and any supporting design artifacts.
3. Generate `tasks.md` with exact file paths and verification steps.
4. Implement only after the planning artifacts are implementation-ready.

## Stack

The current application uses:

- TypeScript 5.9 on Node.js 22 LTS
- Next.js 16 with React 19
- PostgreSQL 17 with Prisma ORM
- Docker Compose for local PostgreSQL
- TanStack Query, Recharts, and Zod
- Vitest, React Testing Library, and Playwright

The primary feature specification and delivery artifacts live under
[`specs/001-card-portfolio-tracker/`](/Users/cmaier/Source/tcg-tracker/specs/001-card-portfolio-tracker).

## Running Locally

```bash
npm install
npm run db:up
npm run db:generate
npm run dev
npm run db:migrate
```

## Verification

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm run snapshots:run
npm run db:down
```

## Notes

- The current implementation includes demo catalog and portfolio data so the UI
  remains usable before a live upstream sync is configured.
- Snapshot history can be refreshed through the scheduled snapshot route or
  `npm run snapshots:run` while the app server is running.
