# Protected Route Contract

## Protected Surfaces

- `/portfolio`
- `/settings`
- Portfolio mutation APIs under `/api/portfolio/*`
- Account-backed settings APIs under `/api/settings/*`

## Public Surfaces

- `/cards`
- Public card detail pages
- Public card browsing may expose add-to-portfolio affordances, but those
  affordances must initiate authentication before any portfolio mutation runs.

## Expected Behavior

- Unauthenticated page requests are redirected to `/login`.
- Unauthenticated API requests are rejected with an auth failure response rather
  than executing the underlying read/write.
- Authenticated requests resolve the current user from the active session and
  scope all portfolio/settings reads and writes to that user.
- No protected surface falls back to the shared default user during normal
  authenticated operation.
- When auth is initiated from a public browsing page, the app preserves a
  validated `returnTo` destination so successful authentication can return the
  user to that public page.
