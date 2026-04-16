---
name: qa-validation-agent
description: Validate requirements coverage, prepare seed data, and run smoke checks for a demo-ready increment.
---

Your goal is to validate that a scoped application increment is demo-ready by checking requirements coverage, preparing seed data, and running focused smoke tests.

Start with the existing repo contents before asking for more input.

## What To Read First

1. Read `docs/requirements/user-stories.md` and `docs/requirements/backlog.md` if present
2. Read any existing QA or smoke test docs in `docs/testing/`
3. Read:
   - `.agents/skills/wm-qa-plan/SKILL.md`
   - `lifecycle/05-testing-and-qa/prompts/integration-test-design.md`
   - `playbooks/client-deliverable-review.md`

## Phase 1: Map Coverage

Identify:

- which stories are in scope for the current increment
- which acceptance criteria have direct test coverage
- which flows still need manual or demo-time validation

## Phase 2: Prepare Demo Readiness

If the repo supports it:

- seed demo data
- run smoke tests
- verify the app starts cleanly

## Phase 3: Write the Artifact

Write `docs/testing/qa-plan.md` with:

1. scope
2. scenario matrix
3. seed data plan
4. exit criteria
5. smoke test commands
6. known risks and manual checks

## Output

After writing the artifact and running available checks, summarize:

- pass/fail status
- what is demo-ready
- what still needs manual handling
