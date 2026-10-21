#!/usr/bin/env node
// Static site generator for the Mmiri Ozuzo website. Zero dependencies (Node ≥ 18).
// Usage: node build.mjs            → writes dist/
//        node build.mjs --check    → build, then run tests/check.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { renderHome, renderLegal, renderNotFound } from './src/template.mjs';
import el from './src/content/el.mjs';
import en from './src/content/en.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
// Environment overrides for staging deploys (e.g. GitHub Pages under a sub-path):
//   SITE_BASE_URL=https://user.github.io/repo SITE_STAGING=1 node build.mjs
if (process.env.SITE_BASE_URL) cfg.baseUrl = process.env.SITE_BASE_URL.replace(/\/+$/, '');
cfg.staging = process.env.SITE_STAGING === '1' || cfg.staging === true;
const BASE = (() => { try { return new URL(cfg.baseUrl).pathname.replace(/\/+$/, ''); } catch { return ''; } })(); // '' at the root, '/repo' on a project Pages site
const ORIGIN = cfg.baseUrl.slice(0, cfg.baseUrl.length - BASE.length);
const warnings = [];
const warn = m => { warnings.push(m); console.warn('WARN  ' + m); };
const fail = m => { console.error('ERROR ' + m); process.exitCode = 1; };

/* ---------- config sanity ---------- */
if (!/^https:\/\/[^/]+(\/[A-Za-z0-9._-]+)*$/.test(cfg.baseUrl)) fail(`baseUrl must be https://host[/path] with no trailing slash (got "${cfg.baseUrl}")`);
if (cfg.staging) warn(`STAGING build: every page carries noindex and robots.txt disallows crawling (base ${cfg.baseUrl}).`);
if (cfg.baseUrl === 'https://www.mmiriozuzo.gr') warn('baseUrl is still the UNCONFIRMED placeholder domain. Set the real domain in site.config.json before deploying.');
if (!cfg.booking.url.startsWith('https://www.ebarber.gr/')) fail('booking.url must be the ebarber listing URL');
if (!cfg.legal.controllerLegalName) warn('legal.controllerLegalName is empty — the privacy/terms pages show only the trade name. Launch blocker (see docs/LAUNCH-CHECKLIST.md).');
if (!cfg.legal.hostingProvider) warn('legal.hostingProvider is empty — privacy page uses generic wording for server logs.');

/* ---------- helpers ---------- */
const read = p => fs.readFileSync(p, 'utf8');
const write = (rel, content) => { const p = path.join(DIST, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content); };
const copy = (from, rel) => { const p = path.join(DIST, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.copyFileSync(from, p); };
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 8);
const todayISO = new Date().toISOString().slice(0, 10);
const year = new Date().getFullYear();

function fmtDateFactory(t) {
  return iso => { const [y, m, d] = iso.split('-').map(Number); return t.code === 'el' ? `${d} ${t.months[m - 1]} ${y}` : `${d} ${t.months[m - 1]} ${y}`; };
}

function openDaysText(t) {
  const order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const open = order.filter(d => cfg.hours.week[d]);
  const closed = order.filter(d => !cfg.hours.week[d]);
  // contiguous?
  const idx = open.map(d => order.indexOf(d));
  const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  const sh = t.days.short;
  const openDays = contiguous && open.length > 1 ? `${sh[open[0]]}–${sh[open[open.length - 1]]}` : open.map(d => sh[d]).join(', ');
  const joiner = t.code === 'el' ? ' & ' : ' & ';
  const closedDays = closed.map(d => sh[d]).join(joiner);
  return { openDays, closedDays };
}

function tokenMap(t) {
  const isEl = t.code === 'el';
  const fmt = fmtDateFactory(t);
  const email = cfg.contact.email || '';
  const { openDays, closedDays } = openDaysText(t);
  const address = isEl
    ? `${cfg.address.street_el}, ${cfg.address.locality_el} ${cfg.address.postalCode}`
    : `${cfg.address.street_en}, ${cfg.address.locality_en} ${cfg.address.postalCode}, ${cfg.address.country_en}`;
  const row = (k, v) => v ? `<dt>${k}</dt><dd>${v}</dd>` : '';
  return {
    brand: cfg.brand.name,
    phone: cfg.contact.phoneDisplay,
    phoneHref: `tel:${cfg.contact.phoneE164}`,
    address,
    bookingUrl: cfg.booking.url,
    providerPrivacy: isEl ? (cfg.booking.providerPrivacy_el || cfg.booking.providerPrivacy) : cfg.booking.providerPrivacy,
    legalName: cfg.legal.controllerLegalName || cfg.brand.name,
    email,
    emailLine: email ? `, email ${email}` : '',
    emailRow: row('Email', email),
    gemiRow: row(isEl ? 'Αρ. ΓΕΜΗ' : 'GEMI no.', cfg.legal.gemi),
    vatRow: row(isEl ? 'ΑΦΜ' : 'VAT no.', cfg.legal.vat),
    hosting: cfg.legal.hostingProvider || (isEl ? 'ο πάροχος φιλοξενίας μας' : 'our hosting provider'),
    logRetention: (isEl ? cfg.legal.logRetention_el : cfg.legal.logRetention_en) ? `, ${isEl ? cfg.legal.logRetention_el : cfg.legal.logRetention_en}` : '',
    dpaAddress: isEl ? 'Λ. Κηφισίας 1-3, 115 23 Αθήνα' : '1-3 Kifisias Avenue, 115 23 Athens, Greece',
    updated: fmt(cfg.legal.lastUpdated),
    asOf: fmt(cfg.services.asOf),
    surcharge: cfg.services.holidaySurcharge ? `€${cfg.services.holidaySurcharge}` : '',
    baseUrl: cfg.baseUrl,
    year: String(year),
    openDays, closedDays
  };
}
function fillTokens(obj, map) {
  if (typeof obj === 'string') return obj.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in map ? map[k] : m));
  if (Array.isArray(obj)) return obj.map(x => fillTokens(x, map));
  if (obj && typeof obj === 'object') { const o = {}; for (const k of Object.keys(obj)) o[k] = fillTokens(obj[k], map); return o; }
  return obj;
}

/* ---------- images (optional, from tools/images.py) ---------- */
let manifest = {};
const manPath = path.join(SRC, 'img', 'generated', 'manifest.json');
if (fs.existsSync(manPath)) manifest = JSON.parse(read(manPath));
function resolveImage(ref, lang, sizes) {
  if (!ref) return null;
  const m = manifest[ref.id];
  if (!m) { warn(`images: "${ref.id}" is referenced in site.config.json but not found in src/img/generated/manifest.json — slot shown instead`); return null; }
  const srcset = fmt => m.widths.map(w => `${BASE}/assets/img/${ref.id}-${w}.${fmt} ${w}w`).join(', ');
  const order = ['avif', 'webp']; // best format first: browsers take the first <source> they support
  const sources = order.filter(f => m.formats.includes(f)).map(f => ({ type: f === 'avif' ? 'image/avif' : 'image/webp', srcset: srcset(f) }));
  const largest = m.widths[m.widths.length - 1];
  return {
    sources, sizes,
    fallback: { src: `${BASE}/assets/img/${ref.id}-${m.widths[Math.min(1, m.widths.length - 1)]}.jpg`, srcset: srcset('jpg') },
    full: `${BASE}/assets/img/${ref.id}-${largest}.jpg`,
    width: m.width, height: m.height,
    alt: ref['alt_' + lang] || ref.alt_el || '',
    caption: ref['caption_' + lang] || ref.caption_el || ''
  };
}

/* ---------- assets ---------- */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
const fontsCss = read(path.join(SRC, 'fonts', 'fonts.css')).replace(/url\("([^"]+)"\)/g, 'url("/assets/fonts/$1")');
const css = fontsCss + '\n' + read(path.join(SRC, 'styles.css'));
const js = read(path.join(SRC, 'main.js'));
// Conservative minifiers: strip comments, collapse whitespace, trim around structural characters.
function minifyCss(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').replace(/:\s+/g, ':').trim();
}
function minifyJs(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(l => l.replace(/^\s+/, '')).filter(l => l && !l.startsWith('//')).join('\n');
}
const cssMin = minifyCss(css), jsMin = minifyJs(js);
const assets = { css: `${BASE}/assets/styles.css?v=${hash(cssMin)}`, js: `${BASE}/assets/main.js?v=${hash(jsMin)}` };
write('assets/styles.css', cssMin); write('assets/main.js', jsMin);
for (const f of fs.readdirSync(path.join(SRC, 'fonts'))) if (/\.(woff2|txt)$/.test(f)) copy(path.join(SRC, 'fonts', f), `assets/fonts/${f}`);
copy(path.join(SRC, 'img', 'favicon.svg'), 'assets/img/favicon.svg');
const iconsDir = path.join(SRC, 'img', 'icons');
const iconFiles = ['favicon-16.png', 'favicon-32.png', 'favicon-48.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'og.png', 'favicon.ico'];
for (const f of iconFiles) {
  const p = path.join(iconsDir, f);
  if (!fs.existsSync(p)) { warn(`icons: missing ${f} — run "node tools/make-icons.mjs"`); continue; }
  copy(p, f === 'favicon.ico' ? 'favicon.ico' : `assets/img/${f}`);
}
const genDir = path.join(SRC, 'img', 'generated');
if (fs.existsSync(genDir)) for (const f of fs.readdirSync(genDir)) if (/\.(avif|webp|jpg)$/.test(f)) copy(path.join(genDir, f), `assets/img/${f}`);

/* ---------- pages ---------- */
const PAGES = [
  { key: 'home', el: el.paths.home, en: en.paths.home },
  { key: 'privacy', el: el.paths.privacy, en: en.paths.privacy },
  { key: 'terms', el: el.paths.terms, en: en.paths.terms }
];
const lat = cfg.address.geo.lat, lon = cfg.address.geo.lon;
const hasGallery = Array.isArray(cfg.images.gallery) && cfg.images.gallery.length > 0;

function makeCtx(lang, pageKey) {
  const base = lang === 'el' ? el : en;
  const map = tokenMap(base);
  const t = fillTokens(base, map);
  const page = PAGES.find(p => p.key === pageKey) || { key: pageKey, el: el.paths.home, en: en.paths.home };
  const self = page[lang];
  const strings = {
    menuOpen: t.a11y.menuOpen, menuClose: t.a11y.menuClose, status: t.visit.hours.status, days: t.days.long,
    mapLoaded: t.visit.map.loaded, copied: t.visit.phone.copied, copyFail: t.visit.phone.copyFail
  };
  const siteData = { phoneDisplay: cfg.contact.phoneDisplay, hours: { tz: cfg.hours.timezone, week: cfg.hours.week }, strings };
  const addrQ = encodeURIComponent(lang === 'el' ? `${cfg.address.street_el}, ${cfg.address.locality_el} ${cfg.address.postalCode}` : `${cfg.address.street_en}, ${cfg.address.locality_en} ${cfg.address.postalCode}, ${cfg.address.country_en}`);
  const d = 0.004;
  t.paths = Object.fromEntries(Object.entries(base.paths).map(([k, v]) => [k, BASE + v]));
  const urls = {
    self: BASE + self, home: BASE + base.paths.home,
    alternates: { el: BASE + page.el, en: BASE + page.en },
    abs: p => ORIGIN + p,
    base: BASE, staging: !!cfg.staging,
    googleDirections: `https://www.google.com/maps/dir/?api=1&destination=${addrQ}`,
    osmLink: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`,
    osmEmbed: `https://www.openstreetmap.org/export/embed.html?bbox=${(lon - d).toFixed(5)}%2C${(lat - d * 0.65).toFixed(5)}%2C${(lon + d).toFixed(5)}%2C${(lat + d * 0.65).toFixed(5)}&layer=mapnik&marker=${lat}%2C${lon}`
  };
  const images = {
    hero: resolveImage(cfg.images.hero, lang, '100vw'),
    heroMobile: resolveImage(cfg.images.heroMobile, lang, '100vw'),
    band: resolveImage(cfg.images.band, lang, '100vw'),
    bandMobile: resolveImage(cfg.images.bandMobile, lang, '100vw'),
    story: resolveImage(cfg.images.story, lang, '(max-width: 1080px) 92vw, 540px'),
    gallery: (cfg.images.gallery || []).map(g => resolveImage(g, lang, '(max-width: 760px) 46vw, 30vw')).filter(Boolean)
  };
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const keys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': cfg.baseUrl + '/#business',
    name: cfg.brand.name,
    alternateName: `${cfg.brand.name} Barber Salon`,
    url: cfg.baseUrl + '/',
    image: [cfg.baseUrl + '/assets/img/og.png'].concat(images.hero ? [ORIGIN + images.hero.full] : []),
    telephone: cfg.contact.phoneE164,
    address: { '@type': 'PostalAddress', streetAddress: lang === 'el' ? cfg.address.street_el : cfg.address.street_en, addressLocality: lang === 'el' ? cfg.address.locality_el : cfg.address.locality_en, postalCode: cfg.address.postalCode, addressCountry: cfg.address.countryCode },
    geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lon },
    hasMap: urls.osmLink,
    openingHoursSpecification: keys.filter(k => cfg.hours.week[k]).map((k, i) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: dayNames[keys.indexOf(k)], opens: cfg.hours.week[k][0], closes: cfg.hours.week[k][1] })),
    founder: { '@type': 'Person', name: cfg.brand.founder[lang] },
    sameAs: [cfg.booking.url],
    inLanguage: lang
  };
  const sh = (() => { const { openDays, closedDays } = openDaysText(base); return lang === 'el' ? `${openDays} · ${closedDays} κλειστά` : `${openDays} · closed ${closedDays}`; })();
  return { cfg, t, lang, urls, assets, images, hasGallery, jsonld, siteDataJson: JSON.stringify(siteData).replace(/</g, '\\u003c'), fmtDate: fmtDateFactory(base), scheduleShort: sh };
}

const outputs = [];
for (const lang of ['el', 'en']) {
  for (const p of PAGES) {
    const ctx = makeCtx(lang, p.key);
    const html = p.key === 'home' ? renderHome(ctx) : renderLegal(ctx, p.key);
    const rel = path.posix.join(p[lang].replace(/^\//, ''), 'index.html');
    write(rel, html); outputs.push({ url: p[lang], rel, lang, alternates: { el: p.el, en: p.en } });
  }
}
write('404.html', renderNotFound(makeCtx('el', 'notFound'), makeCtx('en', 'notFound')));

/* ---------- sitemap, robots, manifest ---------- */
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${outputs.map(o => `  <url>
    <loc>${cfg.baseUrl}${o.url}</loc>
    <lastmod>${todayISO}</lastmod>
    <xhtml:link rel="alternate" hreflang="el" href="${cfg.baseUrl}${o.alternates.el}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${cfg.baseUrl}${o.alternates.en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${cfg.baseUrl}${o.alternates.el}"/>
  </url>`).join('\n')}
</urlset>
`;
write('sitemap.xml', sitemap);
write('robots.txt', cfg.staging ? `User-agent: *\nDisallow: /\n` : `User-agent: *\nAllow: /\n\nSitemap: ${cfg.baseUrl}/sitemap.xml\n`);
write('manifest.webmanifest', JSON.stringify({
  name: `${cfg.brand.name} — Barber Salon`, short_name: cfg.brand.name, start_url: BASE + '/', display: 'browser', lang: 'el',
  background_color: '#532200', theme_color: '#532200',
  icons: [{ src: BASE + '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: BASE + '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png' }]
}, null, 2));

/* ---------- hosting files (security headers, redirects, 404) ---------- */
const CSP = "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; frame-src https://www.openstreetmap.org; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests";
const HEADERS = [
  ['Content-Security-Policy', CSP],
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'],
  ['Cross-Origin-Opener-Policy', 'same-origin'],
  ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains']
];
write('_headers', `/*\n${HEADERS.map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n  Cache-Control: no-cache\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/assets/img/og.png\n  Cache-Control: public, max-age=86400\n`);
write('_redirects', `/index.html / 301\n/en /en/ 301\n/en/index.html /en/ 301\n/aporrito /aporrito/ 301\n/oroi /oroi/ 301\n/en/privacy /en/privacy/ 301\n/en/terms /en/terms/ 301\n/* /404.html 404\n`);
write('.htaccess', `# Apache — equivalent of _headers/_redirects
ErrorDocument 404 /404.html
Options -Indexes
<IfModule mod_headers.c>
${HEADERS.map(([k, v]) => `  Header always set ${k} "${v.replace(/"/g, '\\"')}"`).join('\n')}
  <FilesMatch "\\.(css|js|woff2|png|jpg|webp|avif|svg|ico)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  RewriteRule ^index\\.html$ / [R=301,L]
  RewriteRule ^(.+)/index\\.html$ /$1/ [R=301,L]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteCond %{REQUEST_URI} !/$
  RewriteRule ^(.*)$ /$1/ [R=301,L]
</IfModule>
`);
fs.mkdirSync(path.join(ROOT, 'hosting'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'hosting', 'Caddyfile'), `# Caddy v2 — replace the hostname and the root path. TLS is automatic (Let's Encrypt).
${cfg.baseUrl.replace('https://', '')} {
	root * /var/www/mmiri-ozuzo/dist
	encode zstd gzip
	file_server
	handle_errors {
		@404 expression {http.error.status_code} == 404
		rewrite @404 /404.html
		file_server
	}
	redir /index.html / permanent
	@dirNoSlash path_regexp noslash ^/(en|aporrito|oroi|en/privacy|en/terms)$
	redir @dirNoSlash {http.request.uri.path}/ permanent
	header {
${HEADERS.map(([k, v]) => `\t\t${k} "${v}"`).join('\n')}
		-Server
	}
	header /assets/* Cache-Control "public, max-age=31536000, immutable"
	header /assets/img/og.png Cache-Control "public, max-age=86400"
}
${cfg.baseUrl.replace('https://www.', '')} {
	redir https://${cfg.baseUrl.replace('https://', '')}{uri} permanent
}
`);
fs.writeFileSync(path.join(ROOT, 'hosting', 'netlify.toml'), `[build]\n  command = "node build.mjs"\n  publish = "dist"\n`);
fs.writeFileSync(path.join(ROOT, 'hosting', 'README.md'), `# Hosting files\n\n- \`dist/_headers\`, \`dist/_redirects\`: Netlify / Cloudflare Pages (picked up automatically).\n- \`dist/.htaccess\`: Apache shared hosting.\n- \`hosting/Caddyfile\`: Caddy v2 (e.g. a Hetzner VM). Copy the block into /etc/caddy/Caddyfile.\n- \`hosting/netlify.toml\`: Netlify build settings.\n\nAll four apply the same security headers and serve \`/404.html\` with a real 404 status.\n`);

/* ---------- output guards ---------- */
const htmlFiles = outputs.map(o => o.rel).concat(['404.html']);
for (const rel of htmlFiles) {
  const h = read(path.join(DIST, rel));
  if (/ style="/.test(h)) fail(`${rel}: inline style attribute found (breaks CSP style-src 'self')`);
  if (/ on\w+="/.test(h)) fail(`${rel}: inline event handler found`);
  if (/<script[^>]+src="https?:/.test(h) || /<link[^>]+href="https?:[^"]*"[^>]*rel="(stylesheet|preconnect|preload|dns-prefetch)"/.test(h) || /rel="(stylesheet|preconnect|dns-prefetch)"[^>]*href="https?:/.test(h)) fail(`${rel}: external script/style/preconnect found`);
  if (/http:\/\//.test(h.replace(/http:\/\/www\.w3\.org\/[\w\/.-]*/g, ''))) fail(`${rel}: plain http:// URL found`);
  const bookingHrefs = [...h.matchAll(/<a[^>]*data-booking="1"[^>]*href="([^"]+)"|<a[^>]*href="([^"]+)"[^>]*data-booking="1"/g)].map(m => m[1] || m[2]);
  for (const b of bookingHrefs) if (b !== cfg.booking.url) fail(`${rel}: booking link "${b}" differs from config`);
  if (rel !== '404.html' && bookingHrefs.length < 3) fail(`${rel}: expected several booking CTAs, found ${bookingHrefs.length}`);
}
fs.mkdirSync(path.join(ROOT, 'tests', 'reports'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'tests', 'reports', 'BUILD-INFO.txt'), `Built ${new Date().toISOString()}\nbaseUrl ${cfg.baseUrl}\nbooking ${cfg.booking.url}\nwarnings:\n${warnings.map(w => ' - ' + w).join('\n') || ' (none)'}\n`);
console.log(`Built ${outputs.length + 1} pages into dist/ (${warnings.length} warning${warnings.length === 1 ? '' : 's'}).`);
if (process.argv.includes('--check')) {
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync(process.execPath, [path.join(ROOT, 'tests', 'check.mjs')], { stdio: 'inherit' });
  process.exitCode = r.status || process.exitCode;
}
