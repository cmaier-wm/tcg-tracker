#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

if [[ ! -f node_modules/next/package.json ]]; then
  rm -rf node_modules
  npm ci
fi

existing_pid="$(lsof -tiTCP:3000 -sTCP:LISTEN 2>/dev/null | head -n 1 || true)"

if [[ -n "$existing_pid" ]]; then
  existing_command="$(ps -p "$existing_pid" -o command= 2>/dev/null || true)"
  existing_cwd="$(lsof -a -p "$existing_pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -n 1)"

  if [[ "$existing_command" == *"next-server"* ]] && [[ "$existing_cwd" == *"/tcg-tracker"* ]]; then
    kill "$existing_pid"
    sleep 1
  fi
fi

npm run db:up
npm run db:prepare
npm run db:seed

export AUTH_SECRET="${AUTH_SECRET:-local-auth-secret}"
export TEAMS_WEBHOOK_ENCRYPTION_KEY="${TEAMS_WEBHOOK_ENCRYPTION_KEY:-local-teams-secret}"

npm run dev
