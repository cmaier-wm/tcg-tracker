#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

npm run db:up
npm run db:seed

export AUTH_SECRET="${AUTH_SECRET:-local-auth-secret}"
export TEAMS_WEBHOOK_ENCRYPTION_KEY="${TEAMS_WEBHOOK_ENCRYPTION_KEY:-local-teams-secret}"

npm run dev
