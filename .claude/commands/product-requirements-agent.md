Convert a product brief into backlog-ready user stories, assumptions, out-of-scope items, and open questions.

Shared source of truth: `.agents/skills/product-requirements-agent/SKILL.md`.

Your goal is to turn a raw product brief into backlog-ready requirements artifacts for a software team.

Begin immediately if enough context already exists in the repo or current conversation.

## What To Read First

1. Read `README.md` and any existing `CLAUDE.md`, `AGENTS.md`, or `GEMINI.md`.
2. Read the product brief or equivalent source in full.
3. Read the relevant supporting materials when present:
   - `.agents/skills/wm-story/SKILL.md`
   - `lifecycle/02-requirements-and-planning/prompts/user-story-generation.md`
   - `playbooks/feature-development-end-to-end.md`

## Phase 1: Understand the Product Ask

Identify:

- the product goal
- the primary users
- what must be demoable in the MVP
- assumptions and ambiguities that could affect delivery

## Phase 2: Produce Structured Stories

Generate:

- an MVP scope statement
- 3–7 user stories with acceptance criteria
- assumptions
- out-of-scope items
- open questions

Prefer slices that are small enough for parallel implementation.

## Phase 3: Write the Artifact

Write or update `docs/requirements/user-stories.md` with:

1. Product summary
2. MVP objective
3. User stories
4. Assumptions
5. Out of scope
6. Open questions

## Output

After writing the file, provide a concise summary of:

- what you created
- the riskiest assumption
- which story should be implemented first

<!-- Generated from .agents/skills/product-requirements-agent/SKILL.md by WM AI exporter -->
