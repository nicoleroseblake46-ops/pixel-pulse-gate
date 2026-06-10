# Production deployment — Kali Linux + Nginx + Tor

This guide turns the Vite/React app into a production deployment on Kali Linux,
fronted by Nginx as a reverse proxy with a single entry point, and optionally
exposed as a Tor v3 hidden service. Supabase is the backend (auth, database,
storage, edge functions) and is reached directly from the browser using the
public `VITE_SUPABASE_*` keys baked into the build.

```
            ┌──────────────┐         ┌─────────────────┐
 client ──▶ │   nginx :80  │ ──────▶ │  /opt/nexuscc/  │
 (tor or    │ (reverse     │  files  │      dist/      │
  clearnet) │  proxy + SPA │         └─────────────────┘
            │  fallback)   │ ──HTTPS▶  *.supabase.co
            └──────────────┘            (database/auth/functions)
```

The single entry point on the box is **`./deploy/start.sh`**. It loads `.env`,
runs `npm run build`, syncs `dist/` to the Nginx web root, and reloads Nginx.

---

## 1. Prerequisites (one-time, on Kali)

```bash
sudo apt update
sudo apt install -y nginx tor rsync curl git
# Node.js 20 LTS via NodeSource (Kali ships older versions)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v
```

## 2. Get the code

```bash
sudo mkdir -p /opt && sudo chown "$USER":"$USER" /opt
git clone <your-repo-url> /opt/nexuscc-src
cd /opt/nexuscc-src
```

## 3. Configure environment variables

Vite reads `.env` at build time. Only variables prefixed with `VITE_` are
exposed to the client bundle, so it is safe to bake the Supabase **anon /
publishable** key.

```bash
cp .env.example .env
$EDITOR .env   # fill in VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID
```

`./deploy/start.sh` `source`s this file on every build, so changes persist
across deploys — just rerun the script.

> Never put service-role keys or private secrets in `.env`. Those belong in
> Supabase Edge Function secrets and never reach the browser.

## 4. Install the Nginx site

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/nexuscc
sudo ln -sf /etc/nginx/sites-available/nexuscc /etc/nginx/sites-enabled/nexuscc
sudo rm -f /etc/nginx/sites-enabled/default   # optional, removes the welcome page
sudo nginx -t
sudo systemctl enable --now nginx
```

Nginx listens on `127.0.0.1:8080`. It is **not** exposed to the public
internet; Tor (or another fronting proxy) is what publishes it.

## 5. Build and publish

```bash
chmod +x deploy/start.sh
sudo ./deploy/start.sh
```

What this does:

1. Loads variables from `.env` (`set -a; source .env; set +a`).
2. Installs deps with `npm ci` (falls back to `npm install`).
3. Runs `npm run build` to produce `dist/`.
4. Rsyncs `dist/` into `/opt/nexuscc/dist` owned by `www-data`.
5. Tests and reloads Nginx.

Re-run this every time you pull new code or edit `.env`.

Verify locally:

```bash
curl -I http://127.0.0.1:8080/
```

## 6. (Optional) Tor hidden service

```bash
sudo bash -c 'cat /opt/nexuscc-src/deploy/torrc >> /etc/tor/torrc'
sudo systemctl enable --now tor
sudo systemctl restart tor
sudo cat /var/lib/tor/nexuscc/hostname   # your xxxxxxxx.onion address
```

The Tor daemon forwards `*.onion:80` to `127.0.0.1:8080`, which is exactly
where Nginx is listening. Nothing else needs to change.

If you also want clearnet access, add a second `server { listen 80; ... }`
block (or put a real TLS terminator in front) — but for a hidden-service-only
deployment, keeping Nginx bound to loopback is the safer default.

## 7. Local development on Kali

```bash
npm install
npm run dev        # http://localhost:8080 with HMR
```

`npm run dev` reads the same `.env`, so the local dev server talks to the
same Supabase project as production unless you point it at a different one.

## 8. Updating

```bash
cd /opt/nexuscc-src
git pull
sudo ./deploy/start.sh
```

## 9. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `nginx: [emerg] ... permission denied` on `/opt/nexuscc/dist` | Re-run `start.sh` — it `chown`s the web root to `www-data`. |
| Blank page, 404 on refresh of `/some/route` | The SPA fallback (`try_files ... /index.html`) is missing. Reinstall `deploy/nginx.conf`. |
| Supabase requests fail with `Invalid API key` | `.env` was not loaded before `npm run build`. Use `./deploy/start.sh` instead of running `npm run build` directly. |
| `.onion` resolves but page won't load | Confirm `HiddenServicePort 80 127.0.0.1:8080` matches the Nginx `listen` directive, then `sudo systemctl restart tor nginx`. |

## 10. File map

```
deploy/
├── README.md      ← this file
├── nginx.conf     ← reverse proxy + SPA fallback
├── start.sh       ← single entry point: load .env → build → publish → reload
└── torrc          ← hidden-service snippet to append to /etc/tor/torrc
.env.example       ← template for the build-time Supabase config
```
