# Mmiri Ozuzo — website

Bilingual (Greek primary, English) static website for the Mmiri Ozuzo barber salon, Κολοκοτρώνη 10, Athens. No framework, no runtime dependencies, no cookies, no third-party requests; booking is a direct link to ebarber.

**Design (2026-10-21 redesign, palette v3):** concrete-white canvas `#F3F2EF`, graphite ink `#121315`, one accent: raspberry `#C2185B`, the pink of the shop's own "Shave / Haircut" signs (lighter `#FF8AC2` on dark sections). Commissioner for display and UI, Literata italic for editorial emphasis. Full-bleed photographic hero with an art-directed portrait variant on phones and a one-time razor reveal of the headline (CSS only, disabled under reduced motion). All photographs are from the shop's ebarber listing and are **pending owner confirmation** (see `docs/ASSET-REGISTER.md`).

## Layout

```
site.config.json      business facts, booking URL, hours, services, images, legal fields (single source of truth)
build.mjs             zero-dependency generator → dist/
src/
  content/el.mjs      all Greek strings, copy and legal text
  content/en.mjs      all English strings, copy and legal text
  template.mjs        HTML templates (home, legal pages, 404)
  styles.css          design system (concrete white / graphite / raspberry accent) incl. the razor reveal
  main.js             progressive enhancement (menu, status, click-to-load map, lightbox)
  fonts/              self-hosted Literata + Commissioner (OFL 1.1)
  img/                favicon.svg, mark.svg, icons/, originals/ (source photos + SOURCES.txt), generated/ (responsive sets)
tools/
  serve.mjs           local server with production-like redirects, 404 and headers (port 8787)
  make-icons.mjs      favicons, ICO, Apple touch icon, manifest icons, OG image (headless Edge/Chrome)
  images.py           responsive AVIF/WebP/JPEG sets from src/img/originals (Pillow)
tests/
  check.mjs           post-build checks (links, hreflang, sitemap, JSON-LD, CSP hygiene, contrast; --online for external links)
  validate.py         structural HTML validation
  reports/            Lighthouse reports from the last local run
hosting/              Caddyfile, netlify.toml
docs/                 HANDOVER, ASSET-REGISTER, SHOT-LIST, LAUNCH-CHECKLIST, DEPLOYMENT
dist/                 build output (generated; deploy this folder)
mmiri-ozuzo-website.html   the original prototype, kept for reference only
```

## Commands

```bash
node tools/make-icons.mjs        # once, or after changing the logo
python tools/images.py           # when photographs are added to src/img/originals/
node build.mjs                   # build dist/
node tests/check.mjs --online    # checks (omit --online for offline)
python -I tests/validate.py      # HTML structure
node tools/serve.mjs             # preview at http://localhost:8787/
```

Requires Node 18+ and Python 3 with Pillow (only for `images.py`). Headless Edge or Chrome is used for icon rendering.

## Routes

| Greek | English |
|---|---|
| `/` | `/en/` |
| `/aporrito/` (privacy & cookies) | `/en/privacy/` |
| `/oroi/` (terms & operator info) | `/en/terms/` |
| `/404.html` (bilingual, noindex) | — |

Plus `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/favicon.ico`.
