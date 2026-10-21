#!/usr/bin/env node
// Post-build checks for dist/. Zero dependencies. Exit code 1 on any failure.
//   node tests/check.mjs            → offline checks
//   node tests/check.mjs --online   → also fetch every external link and report its HTTP status
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const ONLINE = process.argv.includes('--online');
if (process.env.SITE_BASE_URL) cfg.baseUrl = process.env.SITE_BASE_URL.replace(/\/+$/, '');
const STAGING = process.env.SITE_STAGING === '1' || cfg.staging === true;
const BASE = (() => { try { return new URL(cfg.baseUrl).pathname.replace(/\/+$/, ''); } catch { return ''; } })();
const ORIGIN = cfg.baseUrl.slice(0, cfg.baseUrl.length - BASE.length);
const strip = p => (BASE && p.startsWith(BASE + '/')) ? p.slice(BASE.length) : p;
let fails = 0, passes = 0;
const ok = m => { passes++; console.log('  ok   ' + m); };
const bad = m => { fails++; console.log('  FAIL ' + m); };
const check = (cond, m) => cond ? ok(m) : bad(m);

const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const htmlFiles = walk(DIST).filter(f => f.endsWith('.html'));
const rel = f => '/' + path.relative(DIST, f).replace(/\\/g, '/');
const urlOf = f => rel(f).replace(/index\.html$/, '');
const exists = p => fs.existsSync(path.join(DIST, strip(p.split('?')[0].split('#')[0])));
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));

console.log(`\n== Pages (${htmlFiles.length}) ==`);
const titles = new Map(), descs = new Map();
const pageMeta = {};
for (const f of htmlFiles) {
  const h = fs.readFileSync(f, 'utf8'), u = urlOf(f);
  const is404 = rel(f) === '/404.html';
  console.log(`-- ${u}`);
  const lang = (h.match(/<html lang="([^"]+)"/) || [])[1];
  check(lang === 'el' || lang === 'en', `html lang="${lang}"`);
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  check(title.length > 10 && title.length <= 70, `title (${title.length} chars): ${title}`);
  if (titles.has(title)) bad(`duplicate title also on ${titles.get(title)}`); titles.set(title, u);
  const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!is404) { check(desc && desc.length >= 50 && desc.length <= 170, `meta description (${desc ? desc.length : 0} chars)`); if (descs.has(desc)) bad(`duplicate description also on ${descs.get(desc)}`); descs.set(desc, u); }
  const h1s = (h.match(/<h1[\s>]/g) || []).length; check(is404 ? h1s === 2 : h1s === 1, `h1 count = ${h1s}`);
  // heading order
  const levels = [...h.matchAll(/<h([1-6])[\s>]/g)].map(m => +m[1]); let skip = false;
  for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) skip = true;
  check(!skip, `no skipped heading levels (${levels.join(',')})`);
  if (!is404) {
    const canon = (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    check(canon === cfg.baseUrl + u, `canonical ${canon}`);
    const alts = Object.fromEntries([...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(m => [m[1], m[2]]));
    check(alts.el && alts.en && alts['x-default'] === alts.el, `hreflang el/en/x-default present`);
    check(alts[lang] === cfg.baseUrl + u, `hreflang self-reference for ${lang}`);
    pageMeta[u] = { lang, alts, canon };
    check(STAGING ? /<meta name="robots" content="noindex, nofollow">/.test(h) : !/<meta name="robots" content="[^"]*noindex/.test(h), STAGING ? 'staging noindex present' : 'no noindex');
    const og = attrs(h.match(/<meta property="og:image"[^>]*>/)[0]).content;
    check(og.startsWith(cfg.baseUrl + '/') && exists(og.slice(ORIGIN.length)), `og:image exists (${og})`);
  } else {
    check(/<meta name="robots" content="noindex(, nofollow)?">/.test(h), '404 has noindex');
    check(!/rel="canonical"/.test(h), '404 has no canonical');
  }
  // JSON-LD
  const ld = h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (ld) { try { const j = JSON.parse(ld[1]); check(j['@type'] === 'HairSalon' && j.telephone === cfg.contact.phoneE164 && j.address.postalCode === cfg.address.postalCode && !j.aggregateRating && !j.review, 'JSON-LD HairSalon valid, no rating/review markup'); } catch (e) { bad('JSON-LD parse error ' + e.message); } }
  else if (u === '/' || u === '/en/') bad('JSON-LD missing on home');
  // links
  const anchors = [...h.matchAll(/<a\s[^>]*>/g)].map(m => attrs(m[0]));
  const ids = new Set([...h.matchAll(/ id="([^"]+)"/g)].map(m => m[1]));
  const dupIds = [...h.matchAll(/ id="([^"]+)"/g)].map(m => m[1]).filter((v, i, a) => a.indexOf(v) !== i);
  check(dupIds.length === 0, `no duplicate ids${dupIds.length ? ': ' + [...new Set(dupIds)].join(',') : ''}`);
  let internalBad = 0, anchorBad = 0, extBad = 0, booking = 0, tel = 0;
  for (const a of anchors) {
    const href = a.href || '';
    if (href.startsWith('tel:')) { tel++; if (href !== 'tel:' + cfg.contact.phoneE164) bad(`tel link ${href}`); continue; }
    if (href.startsWith('mailto:')) continue;
    if (/^https?:/.test(href)) {
      if (a.target !== '_blank' || !/noopener/.test(a.rel || '') || !/noreferrer/.test(a.rel || '')) { extBad++; bad(`external link without target/_blank+noopener+noreferrer: ${href}`); }
      if ('data-booking' in a) { booking++; if (href !== cfg.booking.url) bad(`booking href ${href}`); }
      continue;
    }
    const [p0, hashPart] = href.split('#');
    const p = p0 ? strip(p0) : p0;
    if (p) { const target = p.endsWith('/') ? p + 'index.html' : p; if (!exists(target)) { internalBad++; bad(`internal link target missing: ${href}`); } }
    if (hashPart !== undefined && hashPart !== '') {
      if (!p || p === u) { if (!ids.has(hashPart)) { anchorBad++; bad(`anchor #${hashPart} not found on page`); } }
      else { const th = fs.readFileSync(path.join(DIST, p.endsWith('/') ? p + 'index.html' : p), 'utf8'); if (!th.includes(` id="${hashPart}"`)) { anchorBad++; bad(`anchor ${href} not found on target page`); } }
    }
  }
  check(internalBad === 0, 'internal links resolve');
  check(anchorBad === 0, 'section anchors resolve');
  check(extBad === 0, 'external links open safely');
  if (!is404 && (u === '/' || u === '/en/')) { check(booking >= 6, `booking CTAs on home: ${booking}`); check(tel >= 3, `tel links on home: ${tel}`); }
  // images
  const imgs = [...h.matchAll(/<img\s[^>]*>/g)].map(m => attrs(m[0]));
  check(imgs.every(i => 'alt' in i), `all ${imgs.length} <img> have alt`);
  // assets referenced exist
  const assets = [...h.matchAll(/(?:href|src)="(\/[^"]+)"/g)].map(m => m[1]).filter(p => /\.(css|js|woff2|png|svg|ico|webmanifest|jpg|webp|avif)(\?|$)/.test(p));
  for (const m of h.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) for (const part of m[1].split(',')) { const u = part.trim().split(/\s+/)[0]; if (u.startsWith('/')) assets.push(u); }
  for (const m of h.matchAll(/data-full="(\/[^"]+)"/g)) assets.push(m[1]);
  const missing = assets.filter(p => !exists(p));
  check(missing.length === 0, `referenced assets exist${missing.length ? ': missing ' + missing.join(', ') : ''}`);
  check(!/https?:\/\/fonts\.|picsum|placeholder\.com|unsplash/.test(h), 'no third-party font/placeholder hosts');
  check(!/<iframe/.test(h), 'no iframe at load (map is click-to-load)');
  check(!/localStorage|sessionStorage|document\.cookie/.test(h), 'no storage APIs in page');
}

console.log('\n== Hreflang reciprocity ==');
for (const [u, m] of Object.entries(pageMeta)) {
  for (const [l, target] of Object.entries(m.alts)) {
    if (l === 'x-default') continue;
    const tu = target.replace(cfg.baseUrl, '');
    const tm = pageMeta[tu];
    check(tm && tm.alts[m.lang] === cfg.baseUrl + u, `${u} ⇄ ${tu} (${l})`);
  }
}

console.log('\n== Scripts / storage ==');
const js = fs.readFileSync(path.join(DIST, 'assets', 'main.js'), 'utf8');
check(!/localStorage|sessionStorage|document\.cookie|indexedDB/.test(js), 'main.js uses no browser storage');
check(!/fetch\(|XMLHttpRequest|navigator\.sendBeacon/.test(js), 'main.js makes no network requests');
check(/openstreetmap\.org/.test(fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')) && /js-load-map/.test(js), 'map is click-to-load');

console.log('\n== Sitemap / robots / manifest / headers ==');
const sm = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
check(locs.length === Object.keys(pageMeta).length && locs.every(l => pageMeta[l.replace(cfg.baseUrl, '')]), `sitemap lists ${locs.length} canonical pages`);
check(locs.every(l => l.startsWith('https://') && l.endsWith('/')), 'sitemap URLs are https with trailing slash');
check(!locs.some(l => l.includes('404')), 'sitemap excludes 404');
const robots = fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8');
check(STAGING ? /Disallow:\s*\/\s*$/m.test(robots) : (robots.includes(`Sitemap: ${cfg.baseUrl}/sitemap.xml`) && !/Disallow:\s*\/\s*$/m.test(robots)), STAGING ? 'robots.txt disallows crawling (staging)' : 'robots.txt references sitemap and allows crawling');
const man = JSON.parse(fs.readFileSync(path.join(DIST, 'manifest.webmanifest'), 'utf8'));
check(man.icons.every(i => exists(i.src)), 'manifest icons exist');
check(exists('/favicon.ico') && exists('/assets/img/favicon.svg') && exists('/assets/img/apple-touch-icon.png'), 'favicon.ico, favicon.svg, apple-touch-icon present');
const headers = fs.readFileSync(path.join(DIST, '_headers'), 'utf8');
check(/Content-Security-Policy/.test(headers) && /Strict-Transport-Security/.test(headers) && /X-Content-Type-Options/.test(headers), 'security headers configured');

console.log('\n== Colour contrast (WCAG AA) ==');
const css = fs.readFileSync(path.join(DIST, 'assets', 'styles.css'), 'utf8');
const tokens = Object.fromEntries([...css.matchAll(/--([\w-]+):(#[0-9A-Fa-f]{6})/g)].map(m => [m[1], m[2]]));
const lum = hex => { const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
const pairs = [
  ['ink', 'bg', 4.5, 'body text on bone'], ['ink-2', 'bg', 4.5, 'muted text on bone'], ['ink-3', 'bg', 4.5, 'notes on bone'], ['accent', 'bg', 4.5, 'accent text on bone'],
  ['ink', 'bg-2', 4.5, 'body text on bone-2'], ['ink-2', 'bg-2', 4.5, 'muted text on bone-2'], ['ink-3', 'bg-2', 4.5, 'notes on bone-2'], ['accent', 'bg-2', 4.5, 'accent text on bone-2'],
  ['bone', 'accent', 4.5, 'button text on accent'], ['bone', 'accent-hover', 4.5, 'button text on accent hover'],
  ['bone', 'dark', 4.5, 'text on dark'], ['bone-2', 'dark', 4.5, 'muted on dark'], ['bone-3', 'dark', 4.5, 'notes on dark'], ['accent-soft', 'dark', 4.5, 'accent on dark'],
  ['accent', 'bone', 3, 'accent UI on bone (non-text)'], ['bone', 'ink', 4.5, 'toast / ghost hover']
];
for (const [fg, bg, min, label] of pairs) { const r = ratio(tokens[fg], tokens[bg]); check(r >= min, `${label}: ${tokens[fg]} on ${tokens[bg]} = ${r.toFixed(2)}:1 (min ${min})`); }

if (ONLINE) {
  console.log('\n== External links (online) ==');
  const ext = new Set();
  for (const f of htmlFiles) for (const m of fs.readFileSync(f, 'utf8').matchAll(/href="(https?:[^"]+)"/g)) ext.add(m[1].replace(/&amp;/g, '&'));
  for (const u of ext) {
    if (u.startsWith(cfg.baseUrl)) continue; // own canonical/hreflang URLs are checked as files above

    try {
      const r = await fetch(u, { method: 'GET', redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (link check)' }, signal: AbortSignal.timeout(20000) });
      check(r.ok, `${r.status} ${u}`);
    } catch (e) { bad(`${u}: ${e.message}`); }
  }
}

console.log(`\n${passes} passed, ${fails} failed.`);
process.exit(fails ? 1 : 0);
