#!/usr/bin/env sh

set -eu

if [ -z "${SERVICE_WEB_URI:-}" ]; then
  SERVICE_WEB_URI="$(azd env get-value SERVICE_WEB_URI 2>/dev/null || true)"
fi

if [ -z "${SERVICE_WEB_URI:-}" ]; then
  echo "Skipping post-deploy verification because SERVICE_WEB_URI is not set."
  exit 0
fi

npm run azure:verify -- "$SERVICE_WEB_URI"
