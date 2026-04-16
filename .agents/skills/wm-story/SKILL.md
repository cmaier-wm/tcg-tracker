---
name: wm-story
description: Generate a West Monroe-style user story with acceptance criteria from a raw requirement or feature brief.
---

Generate a well-formed user story with acceptance criteria from the input context. If explicit input is provided, use it. Otherwise, use the most recent feature, requirement, or discussion context available.

Produce the story in the following West Monroe format:

## Story: [Short Title]

**Epic:** [Epic name if determinable from context, otherwise "[Epic TBD]"]
**Story Points:** [Estimate using Fibonacci — 1, 2, 3, 5, 8, 13. Flag if too large to estimate as a single story.]

### User Story

> As a **[type of user]**,
> I want **[goal/capability]**
> so that **[business value/outcome]**.

### Background

[1–3 sentences of context that helps developers understand why this story matters and how it fits into the larger feature or workflow.]

### Acceptance Criteria

Use Given/When/Then format for behavioral criteria:

**AC1 — [Happy path title]**
- **Given** [precondition]
- **When** [action]
- **Then** [expected outcome]

**AC2 — [Second scenario title]**
- **Given** [precondition]
- **When** [action]
- **Then** [expected outcome]

**AC3 — [Edge case or error path]**
- **Given** [precondition]
- **When** [action]
- **Then** [expected outcome]

Add more ACs only when they materially improve clarity. If more than 8 are needed, recommend splitting the story.

### Out of Scope

- [Explicitly list what this story does not cover]

### Dependencies & Blockers

- [Stories, decisions, systems, or approvals that block this story]

### Definition of Done

- [ ] Code reviewed and approved per WM PR standards
- [ ] Unit tests written and passing
- [ ] Acceptance criteria verified by QA or product owner
- [ ] No commented-out code or TODO comments in the diff
- [ ] Documentation updated if public APIs or user-facing behavior changed

After generating the story, flag if it appears too large for a single sprint iteration and suggest how it might be split.
