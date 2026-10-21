# Deployment checklist

The site is static: `dist/` is the whole deliverable. Any host that serves files over HTTPS works. Nothing is deployed yet; follow this list when the owner gives the go-ahead.

## 1. Before building for production

1. Register/confirm the domain and set `baseUrl` in `site.config.json` (`https://www.example.gr`, no trailing slash).
2. Fill `legal.controllerLegalName`, `legal.hostingProvider`, `legal.logRetention_*`, optionally `legal.gemi`, `legal.vat`, `contact.email`.
3. Confirm `hours`, `services`, `services.asOf`, `legal.lastUpdated`.
4. Add approved photographs (see `docs/SHOT-LIST.md`), run `python tools/images.py`, reference them under `images`.
5. If the official logo is supplied, replace `src/img/favicon.svg` and `src/img/mark.svg`, then run `node tools/make-icons.mjs`.
6. Build and test:

```bash
node build.mjs && node tests/check.mjs --online && python -I tests/validate.py
```

The build must finish with **no `ERROR` lines**; the three current warnings (placeholder domain, legal name, hosting) must be gone.

## 2. Hosting options (pick one)

| Host | What to upload | Headers / redirects / 404 |
|---|---|---|
| **Caddy on a VM** (for example the existing Hetzner server) | `dist/` to `/var/www/mmiri-ozuzo/dist` (rsync) | `hosting/Caddyfile` — paste the site block into `/etc/caddy/Caddyfile`, `caddy validate`, `systemctl reload caddy`. TLS via Let's Encrypt is automatic; the apex redirects to `www`. |
| **Netlify / Cloudflare Pages** | Connect the repository; build command `node build.mjs`, publish directory `dist` (`hosting/netlify.toml`) | `dist/_headers` and `dist/_redirects` are picked up automatically, including the 404. |
| **Apache shared hosting** | Contents of `dist/` to the web root | `dist/.htaccess` (needs `mod_headers` and `mod_rewrite`). |

All three apply the same policy: HSTS, CSP (`default-src 'self'`, map frame from openstreetmap.org only), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, one-year immutable caching for `/assets/*`, real 404 status for unknown URLs, and `/index.html` → `/`, `/en` → `/en/` redirects.

## 3. DNS and HTTPS

- `A`/`AAAA` for `www` to the server (or `CNAME` to the platform); apex either `ALIAS`/`ANAME` or a redirect to `www`.
- Only one canonical host: `https://www.<domain>/`. HTTP and the apex must 301 to it. Check:

```bash
curl -sI http://<domain>/ | head -3 && curl -sI https://<domain>/ | head -3 && curl -sI https://www.<domain>/en | head -3
```

- Confirm the certificate chain with `curl -vI https://www.<domain>/ 2>&1 | grep -E "subject|issuer|expire"`.

## 4. Staging (if used)

- Protect staging with HTTP basic auth (Caddy: `basic_auth`), **and** send `X-Robots-Tag: noindex, nofollow` on every response. `robots.txt` is not access control.
- Build staging with the staging `baseUrl` so canonicals never point at staging from production and vice versa. Never copy a staging build to production without rebuilding.

## 5. Post-deploy verification

```bash
BASE=https://www.<domain>
for p in / /en/ /aporrito/ /oroi/ /en/privacy/ /en/terms/ /sitemap.xml /robots.txt /favicon.ico /assets/img/og.png /nope; do printf "%-22s " $p; curl -s -o /dev/null -w "%{http_code}\n" $BASE$p; done
curl -sI $BASE/ | grep -iE "content-security|strict-transport|x-content|referrer|permissions"
```

Expected: 200 for every page and asset, 404 for `/nope`, all headers present. Then open the site on a phone and a desktop, both languages, and click every booking button: each must open `https://www.ebarber.gr/en/barbershops/mmiri-ozuzo` in a new tab.

Optional validators (public tools, run by hand): Google Rich Results Test on `/` and `/en/` (expects `HairSalon`), Facebook Sharing Debugger / X Card Validator for the OG image, the W3C Nu HTML checker, and Lighthouse in Chrome DevTools.

## 6. Google Search Console

1. Open https://search.google.com/search-console/about and add a **Domain property** for the bare domain (covers www and non-www, http and https).
2. Verify with the DNS TXT record Google shows (add it at the registrar; propagation can take an hour).
3. Sitemaps → submit `https://www.<domain>/sitemap.xml`.
4. URL Inspection → inspect `https://www.<domain>/` and `https://www.<domain>/en/`, then "Request indexing" for each.
5. After a few days check Pages (indexing) and the "International targeting / hreflang" report for errors. Indexing timing is Google's decision; nothing here guarantees ranking, rich results or an appointment button in search.

## 7. Google Business Profile

1. Sign in at https://business.google.com with the account that already manages the shop's profile. **Do not create a second profile**; if access is lost, use "Request access" on the existing listing.
2. Info → Website: `https://www.<domain>/`.
3. Info → Appointment links: `https://www.ebarber.gr/en/barbershops/mmiri-ozuzo` (Google may or may not surface it; that is Google's call).
4. Make sure name ("Mmiri Ozuzo"), address (Κολοκοτρώνη 10, Αθήνα 105 61), phone (+30 210 331 1323) and hours match the website and ebarber exactly. Update all three places together whenever anything changes.
5. Reference: https://support.google.com/business/answer/3039617 (edit business information).

## 8. Keeping it current

- Change facts in `site.config.json` only, rebuild, redeploy. The build refuses inline styles, external scripts, plain-HTTP links and booking links that differ from the config.
- When prices or hours change on ebarber, update `services`/`hours` and `services.asOf`, or hide prices (`showPrices: false`).
- Review the privacy page whenever hosting or any third-party element changes; update `legal.lastUpdated`.
