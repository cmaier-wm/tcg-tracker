# tcg-tracker

This repository is currently in its specification-first bootstrap phase. The
working rules for the project live in
`.specify/memory/constitution.md`.

## Workflow

All non-trivial work follows this path:

1. Create or update `spec.md`.
2. Produce `plan.md` and any supporting design artifacts.
3. Generate `tasks.md` with exact file paths and verification steps.
4. Implement only after the planning artifacts are implementation-ready.

## Current Status

No application stack or runtime commands are adopted at the repository level
yet. Each feature plan must define the concrete language, dependencies, storage,
test approach, and operating constraints before implementation begins.
