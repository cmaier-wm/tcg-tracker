# Project Context

<!-- BEGIN WM AI SHARED BLOCK -->
## WM Shared AI Assets (Claude Code)

This project uses West Monroe shared AI assets exported from the central repo.

Portable skills live in `.agents/skills/`. Load the relevant `SKILL.md` on demand instead of rewriting the workflow from scratch.

Available assets:
- `wm-story` — Generate a West Monroe-style user story with acceptance criteria from a raw requirement or feature brief.
- `wm-backlog` — Turn requirements or stories into a prioritized MVP backlog with sequencing and delivery guidance.
- `wm-qa-plan` — Create a concise QA plan, scenario matrix, seed-data approach, and smoke-test checklist.
- `wm-pr-review` — Review a change against West Monroe quality, security, testing, and client-delivery expectations.
- `wm-adr` — Generate a West Monroe-style architecture decision record from the current decision context.
- `wm-client-handoff` — Review a client-facing deliverable for readiness, professionalism, and West Monroe engagement standards.
- `product-requirements-agent` — Convert a product brief into backlog-ready user stories, assumptions, out-of-scope items, and open questions.
- `backlog-prioritization-agent` — Convert requirements into an MVP backlog with dependency-aware sequencing and delivery recommendations.
- `full-stack-delivery-agent` — Implement a scoped feature with tests while following the existing codebase patterns.
- `qa-validation-agent` — Validate requirements coverage, prepare seed data, and run smoke checks for a demo-ready increment.
- `codebase-onboarding-agent` — Explore a codebase and produce an onboarding guide that gets a new engineer productive quickly.
- `product-delivery-orchestrator` — Act as a PM-style orchestrator that coordinates requirements, backlog, implementation, and QA skills.

Working guidance:
- Start with the smallest relevant skill or agent-skill instead of a broad freeform prompt.
- Use `product-delivery-orchestrator` when you want a visible product-to-backlog-to-delivery flow.
- Prefer updating existing docs and artifacts rather than creating duplicate files.
- Keep outputs grounded in repo context, requirements, tests, and delivery constraints.
<!-- END WM AI SHARED BLOCK -->
