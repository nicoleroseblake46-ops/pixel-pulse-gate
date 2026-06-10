#!/usr/bin/env bash
# One-shot entry point: load .env, install deps, build dist/, reload nginx.
# Usage: sudo ./deploy/start.sh   (run from the project root)
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "==> Project root: $PROJECT_ROOT"

# 1. Load .env so VITE_* vars are baked into the build
if [[ -f .env ]]; then
  echo "==> Loading environment from .env"
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
else
  echo "!! .env not found — create one from .env.example before deploying" >&2
  exit 1
fi

# 2. Install dependencies (prefer npm ci when lockfile exists)
echo "==> Installing dependencies"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

# 3. Build the SPA
echo "==> Building production bundle (dist/)"
npm run build

# 4. Sync dist/ to the nginx web root
WEB_ROOT="/opt/nexuscc/dist"
echo "==> Publishing to $WEB_ROOT"
sudo mkdir -p "$WEB_ROOT"
sudo rsync -a --delete dist/ "$WEB_ROOT/"
sudo chown -R www-data:www-data "$WEB_ROOT"

# 5. Reload nginx (config must already be installed — see deploy/nginx.conf)
echo "==> Reloading nginx"
sudo nginx -t
sudo systemctl reload nginx

echo "==> Done. App is served by nginx at http://127.0.0.1:8080"
echo "    To expose as a Tor hidden service, see deploy/torrc and deploy/README.md"
