Convert requirements into an MVP backlog with dependency-aware sequencing and delivery recommendations.

Shared source of truth: `.agents/skills/backlog-prioritization-agent/SKILL.md`.

Your goal is to turn a set of product requirements or user stories into an MVP backlog that a delivery team can execute immediately.

Start without asking for more input if `docs/requirements/user-stories.md` or similar requirement artifacts already exist.

## What To Read

1. Read `docs/requirements/user-stories.md` if present.
2. Read any product brief or `README.md` content needed to understand the application.
3. Read:
   - `.agents/skills/wm-backlog/SKILL.md`
   - `playbooks/feature-development-end-to-end.md`

## Phase 1: Assess the Work

Identify:

- the smallest end-to-end slice that proves the product
- which items are frontend, backend, shared, or QA-heavy
- dependencies that affect order
- stories that should be split for delivery reliability

## Phase 2: Prioritize

Create a backlog with:

- `P0` stories required for a working MVP
- `P1` stories that improve the result but are not strictly required
- `Stretch` items to defer unless time remains

## Phase 3: Write the Artifact

Write the result to `docs/requirements/backlog.md` with:

1. MVP objective
2. Prioritization principles
3. Prioritized backlog table
4. Recommended implementation sequence
5. Risks and dependency notes

## Output

After writing the file, summarize:

- the top 3 stories for implementation
- the key dependency chain
- what should be deferred if the team needs a tighter MVP

<!-- Generated from .agents/skills/backlog-prioritization-agent/SKILL.md by WM AI exporter -->
