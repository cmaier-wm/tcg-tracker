---
name: wm-backlog
description: Turn requirements or stories into a prioritized MVP backlog with sequencing and delivery recommendations.
---

Convert the available requirements or stories into a prioritized backlog. If explicit input is provided, use it. Otherwise, use the most recent requirements, stories, or feature context available.

Produce the output in markdown with the following structure:

# Prioritized Backlog

## Objective

[1–2 sentences on the product goal and what the MVP should prove]

## Prioritization Principles

- [List the 3–5 principles used to prioritize the work]

## Backlog Table

| Priority | Story / Slice | Rationale | Dependencies | Suggested Owner | Demo Value |
|----------|---------------|-----------|--------------|-----------------|-----------|
| P0 | [Short title] | [Why it belongs in MVP] | [None or dependency] | [Frontend / Backend / QA / Product] | [How this helps the demo or end user] |

Use `P0`, `P1`, `P2`, and `Stretch`.

## Recommended MVP Sequence

1. [Story / slice]
2. [Story / slice]
3. [Story / slice]

## Risks / Watchouts

- [Technical, sequencing, or delivery risks]

## Suggested Demo Narrative

- [How to tell the story from brief to backlog to working software]

After the backlog, call out:

- any stories that should be split smaller
- any dependencies that could block delivery
- any stories that can be mocked or deferred without hurting the outcome
