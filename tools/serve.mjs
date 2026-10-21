#!/usr/bin/env node
// Local static server that mimics production behaviour: directory indexes, trailing-slash
// redirects, a real 404 status for /404.html, and the security headers from dist/_headers.
// Usage: node tools/serve.mjs [port]   (default 8787)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.argv[2] || process.env.PORT || 8787);
let BASE = ''; try { if (process.env.SITE_BASE_URL) BASE = new URL(process.env.SITE_BASE_URL).pathname.replace(/\/+$/, ''); } catch { }
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

function parseHeaders() {
  const rules = [];
  try {
    let cur = null;
    for (const line of fs.readFileSync(path.join(ROOT, '_headers'), 'utf8').split('\n')) {
      if (!line.trim()) continue;
      if (!/^\s/.test(line)) { cur = { pattern: line.trim(), headers: [] }; rules.push(cur); }
      else if (cur) { const i = line.indexOf(':'); cur.headers.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]); }
    }
  } catch { }
  return rules;
}
const match = (pattern, p) => pattern.endsWith('*') ? p.startsWith(pattern.slice(0, -1)) : pattern === p;

const server = http.createServer((req, res) => {
  const rules = parseHeaders();
  let urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (BASE) { if (urlPath === '/' || urlPath === BASE) { res.writeHead(301, { Location: BASE + '/' }); return res.end(); } if (urlPath.startsWith(BASE + '/')) urlPath = urlPath.slice(BASE.length); }
  const apply = (p) => { for (const r of rules) if (match(r.pattern, p)) for (const [k, v] of r.headers) res.setHeader(k, v); };
  const send = (status, file, p) => {
    apply(p);
    const type = TYPES[path.extname(file)] || 'application/octet-stream';
    res.setHeader('Content-Type', type);
    const gz = new RegExp("^(text/|application/(json|xml|manifest|javascript))").test(type) && /gzip/.test(req.headers["accept-encoding"] || "");
    if (gz) { res.setHeader('Content-Encoding', 'gzip'); res.setHeader('Vary', 'Accept-Encoding'); res.writeHead(status); fs.createReadStream(file).pipe(zlib.createGzip()).pipe(res); }
    else { res.writeHead(status); fs.createReadStream(file).pipe(res); }
  };
  const redirect = (to) => { res.writeHead(301, { Location: to }); res.end(); };
  if (urlPath.endsWith('/index.html')) return redirect(urlPath.slice(0, -'index.html'.length) || '/');
  const fsPath = path.join(ROOT, urlPath);
  if (!fsPath.startsWith(ROOT)) { res.writeHead(400); return res.end(); }
  if (fs.existsSync(fsPath) && fs.statSync(fsPath).isDirectory()) {
    if (!urlPath.endsWith('/')) return redirect(urlPath + '/');
    const idx = path.join(fsPath, 'index.html');
    if (fs.existsSync(idx)) return send(200, idx, urlPath);
  } else if (fs.existsSync(fsPath) && fs.statSync(fsPath).isFile()) {
    return send(200, fsPath, urlPath);
  }
  const nf = path.join(ROOT, '404.html');
  if (fs.existsSync(nf)) return send(404, nf, urlPath);
  res.writeHead(404); res.end('Not found');
});
server.listen(PORT, '127.0.0.1', () => console.log(`Serving dist/ at http://localhost:${PORT}${BASE}/`));
