#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_ENV="$ROOT_DIR/.codex/environments/environment.toml"
WORKTREE_ROOT="${CODEX_HOME:-$HOME/.codex}/worktrees"
REPO_NAME="$(basename "$ROOT_DIR")"

if [[ ! -f "$SOURCE_ENV" ]]; then
  echo "Missing source Codex environment: $SOURCE_ENV" >&2
  exit 1
fi

if [[ ! -d "$WORKTREE_ROOT" ]]; then
  echo "No Codex worktrees found at $WORKTREE_ROOT"
  exit 0
fi

while IFS= read -r worktree; do
  target_dir="$worktree/.codex/environments"
  target_env="$target_dir/environment.toml"

  mkdir -p "$target_dir"
  cp "$SOURCE_ENV" "$target_env"
  echo "Synced $target_env"
done < <(find "$WORKTREE_ROOT" -maxdepth 2 -type d -name "$REPO_NAME" | sort)
