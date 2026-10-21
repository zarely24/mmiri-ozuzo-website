#!/usr/bin/env node
// Rasterises src/img/favicon.svg into PNG favicons, an ICO, the Apple touch icon, manifest icons,
// and renders the social-sharing image (1200×630) from the hero photograph — with headless Edge/Chrome.
// Output: src/img/icons/*. Run after `python tools/images.py`, then `node build.mjs`.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG = path.join(ROOT, 'src', 'img');
const OUT = path.join(IMG, 'icons');
const TMP = path.join(IMG, '.tmp');
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(TMP, { recursive: true });
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));

const BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
];
const browser = BROWSERS.find(p => fs.existsSync(p));
if (!browser) { console.error('No Edge/Chrome found for headless rendering.'); process.exit(1); }

const toFileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/^\//, '');
function shoot(htmlFile, w, h, out, transparent) {
  const args = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--allow-file-access-from-files',
    '--force-device-scale-factor=1', `--window-size=${w},${h}`, `--screenshot=${out}`, '--virtual-time-budget=4000'];
  if (transparent) args.push('--default-background-color=00000000');
  const userData = path.join(TMP, 'profile'); fs.mkdirSync(userData, { recursive: true });
  args.push(`--user-data-dir=${userData}`);
  args.push(toFileUrl(htmlFile));
  const r = spawnSync(browser, args, { stdio: 'pipe', timeout: 60000 });
  if (!fs.existsSync(out)) { console.error(`Failed to render ${out}\n${r.stderr}`); process.exit(1); }
}

const svg = fs.readFileSync(path.join(IMG, 'favicon.svg'), 'utf8');
const svgData = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
const iconHtml = (size, opaque) => `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:${opaque ? '#C2185B' : 'transparent'};overflow:hidden}img{display:block;width:${size}px;height:${size}px}</style></head><body><img src="${svgData}"></body></html>`;

const sizes = [[16, 'favicon-16.png', false], [32, 'favicon-32.png', false], [48, 'favicon-48.png', false], [192, 'icon-192.png', false], [512, 'icon-512.png', false], [180, 'apple-touch-icon.png', true]];
for (const [s, name, opaque] of sizes) {
  const f = path.join(TMP, `icon-${s}.html`); fs.writeFileSync(f, iconHtml(s, opaque));
  shoot(f, s, s, path.join(OUT, name), !opaque);
  console.log('wrote', name);
}

/* ICO container holding the 16/32/48 PNGs (PNG-in-ICO is supported by all current browsers). */
const pngs = [16, 32, 48].map(s => ({ s, buf: fs.readFileSync(path.join(OUT, `favicon-${s}.png`)) }));
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
let offset = 6 + 16 * pngs.length;
const entries = [], datas = [];
for (const { s, buf } of pngs) {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(offset, 12);
  entries.push(e); datas.push(buf); offset += buf.length;
}
fs.writeFileSync(path.join(OUT, 'favicon.ico'), Buffer.concat([header, ...entries, ...datas]));
console.log('wrote favicon.ico');

/* Social sharing image 1200×630: the hero photograph with the wordmark. Falls back to a plain plate if no hero exists. */
const fontsDir = toFileUrl(path.join(ROOT, 'src', 'fonts')) + '/';
const heroRef = cfg.images && cfg.images.hero && cfg.images.hero.id;
let heroFile = null;
if (heroRef) {
  const gen = path.join(IMG, 'generated');
  const candidates = fs.existsSync(gen) ? fs.readdirSync(gen).filter(f => f.startsWith(heroRef + '-') && f.endsWith('.jpg')).sort((a, b) => parseInt(b.match(/-(\d+)\.jpg$/)[1]) - parseInt(a.match(/-(\d+)\.jpg$/)[1])) : [];
  if (candidates.length) heroFile = toFileUrl(path.join(gen, candidates[0]));
}
const og = `<!doctype html><html lang="el"><head><meta charset="utf-8"><style>
@font-face{font-family:"Commissioner";font-weight:100 900;src:url("${fontsDir}commissioner-latin.woff2") format("woff2");unicode-range:U+0000-00FF}
@font-face{font-family:"Commissioner";font-weight:100 900;src:url("${fontsDir}commissioner-greek.woff2") format("woff2");unicode-range:U+0370-03FF}
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{background:#121315;color:#F3F2EF;font-family:"Commissioner",sans-serif;position:relative}
.ph{position:absolute;inset:0;background:url("${heroFile || ''}") center 40%/cover no-repeat}
.ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,19,21,.35) 0%,rgba(18,19,21,.15) 40%,rgba(18,19,21,.9) 100%)}
.wrap{position:absolute;left:72px;right:72px;bottom:64px}
.eyebrow{display:flex;align-items:center;gap:14px;font-weight:600;font-size:22px;letter-spacing:.16em;text-transform:uppercase;color:#FF8AC2}
.eyebrow::before{content:"";width:34px;height:3px;background:#FF8AC2}
h1{margin:14px 0 0;font-size:150px;line-height:.9;font-weight:800;letter-spacing:-.045em;text-transform:uppercase}
.sub{margin-top:22px;font-size:28px;font-weight:500;color:rgba(243,242,239,.9)}
</style></head><body>
<div class="ph"></div><div class="ov"></div>
<div class="wrap"><div class="eyebrow">Barber Salon · Athens</div><h1>Mmiri Ozuzo</h1><div class="sub">Κολοκοτρώνη 10, Αθήνα &nbsp;·&nbsp; Kolokotroni 10, Athens</div></div>
</body></html>`;
const ogFile = path.join(TMP, 'og.html'); fs.writeFileSync(ogFile, og);
shoot(ogFile, 1200, 630, path.join(OUT, 'og.png'), false);
console.log('wrote og.png' + (heroFile ? ' (from hero photograph)' : ' (plain plate — no hero image found)'));
fs.rmSync(TMP, { recursive: true, force: true });
console.log('Icons written to src/img/icons/. Now run: node build.mjs');
