#!/usr/bin/env bash
# =============================================================================
#  deploy/start.sh — Clean production build & (optional) nginx publish
# -----------------------------------------------------------------------------
#  Usage:
#     ./deploy/start.sh              # build only (produces ./dist)
#     sudo ./deploy/start.sh --nginx # build + publish to /var/www/nexuscc
#
#  For the full one-shot Kali + Tor deploy, use ../deploy.sh instead.
# =============================================================================
set -Eeuo pipefail

c_reset=$'\e[0m'; c_b=$'\e[1m'; c_g=$'\e[32m'; c_y=$'\e[33m'; c_r=$'\e[31m'; c_c=$'\e[36m'
log()  { echo "${c_c}${c_b}==>${c_reset} $*"; }
ok()   { echo "${c_g}${c_b} ✓ ${c_reset} $*"; }
warn() { echo "${c_y}${c_b} ! ${c_reset} $*" >&2; }
die()  { echo "${c_r}${c_b} ✗ ${c_reset} $*" >&2; exit 1; }
trap 'die "start.sh failed at line $LINENO (last cmd: $BASH_COMMAND)"' ERR

# ---- locate project root (parent of this script's directory) ----------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"
log "Project root: $PROJECT_ROOT"

# ---- parse args -------------------------------------------------------------
PUBLISH_NGINX=0
for arg in "$@"; do
  case "$arg" in
    --nginx) PUBLISH_NGINX=1 ;;
    -h|--help)
      sed -n '2,11p' "$0"; exit 0 ;;
    *) die "Unknown argument: $arg" ;;
  esac
done

APP_NAME="nexuscc"
WEB_ROOT="/var/www/${APP_NAME}"

# ---- 1. .env ----------------------------------------------------------------
if [[ ! -f .env ]]; then
  if [[ -f .env.example ]]; then
    cp .env.example .env
    warn ".env was missing — copied from .env.example. Edit it before re-running if needed."
  else
    die ".env not found and no .env.example to copy from."
  fi
fi
log "Loading variables from .env"
set -a
# shellcheck disable=SC1091
source .env
set +a

# Sanity-check required VITE_* vars (warn only — build will still attempt)
for v in VITE_SUPABASE_URL VITE_SUPABASE_PUBLISHABLE_KEY VITE_SUPABASE_PROJECT_ID; do
  if [[ -z "${!v:-}" ]]; then
    warn "$v is empty in .env — Supabase calls will fail at runtime."
  fi
done

# ---- 2. node sanity ---------------------------------------------------------
command -v node >/dev/null 2>&1 || die "Node.js not installed. Install Node 20 LTS and retry."
command -v npm  >/dev/null 2>&1 || die "npm not installed."
ok "node $(node -v) / npm $(npm -v)"

# ---- 3. install deps --------------------------------------------------------
log "Installing dependencies (npm install --legacy-peer-deps)"
npm install --legacy-peer-deps --no-audit --no-fund

# ---- 4. build ---------------------------------------------------------------
log "Building production bundle (npm run build)"
rm -rf dist
npm run build

[[ -f dist/index.html ]] || die "Build produced no dist/index.html"
ok "Build OK ($(du -sh dist | cut -f1)) → $PROJECT_ROOT/dist"

# ---- 5. optional nginx publish ---------------------------------------------
if [[ "$PUBLISH_NGINX" -eq 1 ]]; then
  [[ $EUID -eq 0 ]] || die "--nginx requires root. Re-run with: sudo ./deploy/start.sh --nginx"
  command -v nginx >/dev/null 2>&1 || die "nginx not installed. apt-get install -y nginx"

  log "Publishing dist/ → $WEB_ROOT"
  mkdir -p "$WEB_ROOT"
  rm -rf "${WEB_ROOT:?}/"*
  cp -a dist/. "$WEB_ROOT/"
  chown -R www-data:www-data "$WEB_ROOT" 2>/dev/null || true
  find "$WEB_ROOT" -type d -exec chmod 755 {} \;
  find "$WEB_ROOT" -type f -exec chmod 644 {} \;

  NGINX_SITE="/etc/nginx/sites-available/${APP_NAME}"
  NGINX_LINK="/etc/nginx/sites-enabled/${APP_NAME}"
  log "Writing $NGINX_SITE"
  cat > "$NGINX_SITE" <<NGINX
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    listen 127.0.0.1:8080;
    server_name _;

    root ${WEB_ROOT};
    index index.html;

    add_header X-Frame-Options        "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff"    always;
    add_header Referrer-Policy        "no-referrer" always;

    location /assets/ {
        access_log off;
        expires    1y;
        add_header Cache-Control "public, immutable";
        try_files  \$uri =404;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~ /\.(?!well-known).* { deny all; }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;
}
NGINX

  rm -f /etc/nginx/sites-enabled/default
  ln -sf "$NGINX_SITE" "$NGINX_LINK"

  log "Testing nginx config"
  nginx -t
  systemctl reload nginx 2>/dev/null || systemctl restart nginx
  ok "nginx serving $WEB_ROOT on :80 (and 127.0.0.1:8080 for Tor)"
fi

echo
ok "Done."
[[ "$PUBLISH_NGINX" -eq 1 ]] && echo "  → http://localhost" || echo "  → Output: $PROJECT_ROOT/dist"
