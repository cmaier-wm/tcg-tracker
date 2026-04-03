# MCPs Used During Development

This document tracks Model Context Protocol (MCP) servers used to help develop
`tcg-tracker`.

Scope matters here:

- This is about development workflow tooling.
- It is not a list of runtime dependencies in the shipped app.
- If an MCP changes implementation workflow or design handoff, document it here.

## Current MCP Inventory

### Figma MCP

Status: Available for development workflows. Not required for local app runtime.

Docs:

- https://help.figma.com/hc/en-us/articles/39166810751895

Primary uses:

- Pull design context, screenshots, and node metadata from Figma when building
  or refining UI.
- Map Figma components to code components through Code Connect.
- Search design-system assets and variables from connected Figma libraries.
- Write updates back to Figma files when design exploration or handoff requires
  it.
- Capture web UI into Figma when a design artifact needs to be created from the
  running application.

Typical tool families exposed by this MCP:

- Design context and screenshots: `get_design_context`, `get_screenshot`,
  `get_metadata`, `get_variable_defs`
- Code Connect: `get_code_connect_map`, `get_code_connect_suggestions`,
  `add_code_connect_map`, `send_code_connect_mappings`
- Figma editing and generation: `use_figma`, `generate_figma_design`,
  `create_new_file`, `generate_diagram`
- Design system search: `search_design_system`

Repository impact:

- No application code in this repository currently depends on Figma MCP at
  runtime.
- Using this MCP should produce or update normal repo artifacts such as specs,
  screenshots, design notes, or implementation changes, not hidden workflow
  state.

### Postgres MCP

Status: Available for local development workflows against the repository's
Dockerized PostgreSQL instance. Not required for shipped application runtime.

Docs:

- https://github.com/ericzakariasson/pg-mcp-server

Configured transport:

- Codex global config uses `npx --yes pg-mcp-server --transport stdio`
- Connection target for the MCP should be the local development database at
  `postgresql://postgres:postgres@localhost:5432/tcg_tracker`
- Do not reuse the Prisma application `DATABASE_URL` here. Prisma uses
  `?schema=public`, but `pg-mcp-server` does not accept that query parameter and
  will exit during MCP initialization.

Primary uses:

- Inspect tables, columns, and schema shape without dropping into ad hoc SQL
  shells.
- Run targeted read queries while debugging catalog, portfolio, and snapshot
  data flows.
- Give agents direct database context during development work that spans Prisma,
  API routes, and seeded data.

Typical tool families exposed by this MCP:

- Query execution: `query`
- Schema and sample-data resources: `postgres://tables`,
  `postgres://table/{schema}/{table}`

Repository impact:

- No application code in this repository depends on Postgres MCP at runtime.
- This MCP is a development convenience layered on top of the existing Prisma
  and Docker-based local database workflow.

### Playwright MCP

Status: Available for browser-level development verification workflows. Not
required for shipped application runtime.

Docs:

- https://playwright.dev/docs/getting-started-mcp

Configured transport:

- Codex global config uses `npx @playwright/mcp@latest --headless`
- Headless mode is preferred here so browser-based verification remains usable
  in non-GUI or sandboxed development sessions

Primary uses:

- Verify that local pages such as `http://localhost:3000` actually load and
  render visible content in a browser context.
- Inspect page structure, accessibility snapshots, and obvious runtime-load
  failures that are not provable from shell networking alone.
- Support targeted browser automation during UI debugging without requiring the
  full end-to-end test suite for every check.

Typical tool families exposed by this MCP:

- Browser navigation and page inspection tools for opening pages, reading page
  structure, and interacting with rendered UI

Repository impact:

- No application code in this repository depends on Playwright MCP at runtime.
- This MCP complements the repo's existing Playwright test framework by adding
  interactive browser verification for development sessions.

## What Is Not An MCP Here

These tools are part of the development stack but are not MCP servers for this
repository:

- `Vitest` and React Testing Library for unit/integration tests
- `Prisma` for database access and schema management
- `Docker Compose` for local PostgreSQL
- `spec-kit` templates and scripts under `.specify/`

`Playwright` remains part of the development stack in two different forms:

- The Playwright test framework used by `npm run test:e2e`
- Playwright MCP used for interactive browser automation during development

## Runtime Position

The application does not currently expose or require an MCP server in local
development, CI, or production. MCP usage is limited to external development
tooling.

## Maintenance Rule

When a new MCP becomes part of the development workflow, update:

1. `docs/development/mcps.md`
2. `README.md` if the change affects contributor workflow
3. `AGENTS.md` if the change affects agent-facing guidance or expected tooling
