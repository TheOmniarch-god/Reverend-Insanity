# Launching the Reverend Insanity Encyclopedia

The Gateway is a **fully static site**: one `index.html` + `assets/`. No backend, no build
step, no environment variables. That makes edge hosting the right call.

## Recommendation: Vercel

- Free tier covers a static wiki with room to grow.
- Global CDN → fast first paint for readers anywhere (and in Nigeria).
- Automatic HTTPS + cert renewal, atomic deploys, instant rollback.
- Fits your existing subdomain pattern (`ri.…`, `thelegendsofrenzu.…`).

Suggested host name: `gateway.theomniarch.com.ng` (or `wiki.…`).

### Deploy steps (10 minutes)

1. Push this folder to a GitHub repo (e.g. `reverend-insanity-encyclopedia`), or skip git entirely:
   go to **vercel.com/new → Add New… → Static**, and drag-drop the folder.
2. With git: import the repo. Vercel auto-detects *Static/Other*. Framework preset: **None**.
   Root directory: `/`. No build command, no output directory needed (it serves `index.html`).
3. Deploy. You get a `*.vercel.app` preview URL — check it on your phone.
4. **Domain:** Project → Settings → Domains → add `gateway.theomniarch.com.ng`.
5. At your DNS provider (wherever `theomniarch.com.ng` zone lives), add:

   ```
   Type   Name      Value                      Proxy
   CNAME  gateway   cname.vercel-dns.com       DNS-only (grey cloud if on Cloudflare)
   ```

   (Use an A record `76.76.21.21` only if your panel refuses CNAMEs at subdomains.)
6. Vercel issues the TLS cert automatically (~1–2 min). Done.

Every future update: edit `index.html` → push → live. The `vercel.json` in this folder
already sets long-cache headers on `/assets/` and no-cache on the HTML shell, so readers
get new chapters instantly but images stay CDN-cached.

## Old-school alternative (VPS / cPanel + nginx)

Only choose this if you want the wiki on the same box as your other services. You take on
SSL renewal and you lose the CDN unless you add Cloudflare in front.

nginx server block:

```nginx
server {
    listen 443 ssl http2;
    server_name gateway.theomniarch.com.ng;
    root /var/www/ri-encyclopedia;
    index index.html;

    location /assets/ {
        add_header Cache-Control "public, max-age=604800, immutable";
    }
    location = /index.html {
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }
}
```

Cert: `certbot --nginx -d gateway.theomniarch.com.ng`.

## Pre-launch checklist (done ✔ / verify ☐)

- ✔ Title, meta description, OG/twitter tags, crimson favicon
- ✔ Relative asset paths only — no localhost references
- ✔ `vercel.json` cache policy
- ✔ Assets trimmed to 5.8 MB (unused profile crops removed)
- ☐ After domain is live: set `og:image`/`og:url` to the absolute `https://gateway.…` URL
- ☐ Point the wiki's own internal references (footer "About") at the final domain if desired
- ☐ Run one Lighthouse pass on the live URL (aim: Performance ≥ 90 on 4G)

## If you ever outgrow static

The Growth Ledger lives in `index.html` as `OMNIARCH_STATE`. When you want chapter pages
generated server-side or a comments backend, that object is your schema — port it to a
small API (Vercel serverless or the VPS) without touching the front-end design.
