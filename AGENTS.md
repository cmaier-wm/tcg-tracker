# Project Context

## Tech Stack
- TypeScript 5.9 on Node.js 22 LTS
- Next.js 16 with React 19
- Prisma ORM with PostgreSQL 17
- Docker Compose for local PostgreSQL
- TanStack Query, Recharts, and Zod
- Vitest, React Testing Library, and Playwright

## Conventions
- Follow the constitution in `.specify/memory/constitution.md`.
- Use the spec-driven workflow: `spec.md -> plan.md -> supporting design docs ->
  tasks.md -> implementation`.
- Organize work as independently valuable user stories with exact file-path
  tasks.
- Verification is mandatory for every behavior change. Prefer automated tests;
  if not practical, define explicit manual verification in `quickstart.md`.
- Keep repo guidance in sync with accepted plans when stack, structure, or
  commands change.
- Prefer Docker only for local infrastructure services unless a later plan
  explicitly justifies containerizing the app itself.

## Commands
- `npm install`
- `npm run db:up`
- `npm run db:generate`
- `npm run dev`
- `npm run db:migrate`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:e2e`
- `npm run snapshots:run`
- `npm run db:down`
- Use the `.specify/scripts/bash/` helpers for spec-kit workflow maintenance as
  needed.

## Active Technologies
- TypeScript 5.9 on Node.js 22 LTS + Next.js 16, React 19, Prisma ORM, PostgreSQL, Docker Compose, TanStack Query, Recharts, Zod (001-card-portfolio-tracker)
- PostgreSQL 17 for application data and time-series snapshots (001-card-portfolio-tracker)

## Recent Changes
- 001-card-portfolio-tracker: Added TypeScript 5.9 on Node.js 22 LTS + Next.js 16, React 19, Prisma ORM, PostgreSQL, Docker Compose, TanStack Query, Recharts, Zod
