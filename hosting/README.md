# Hosting files

- `dist/_headers`, `dist/_redirects`: Netlify / Cloudflare Pages (picked up automatically).
- `dist/.htaccess`: Apache shared hosting.
- `hosting/Caddyfile`: Caddy v2 (e.g. a Hetzner VM). Copy the block into /etc/caddy/Caddyfile.
- `hosting/netlify.toml`: Netlify build settings.

All four apply the same security headers and serve `/404.html` with a real 404 status.
- `hosting/github-pages-workflow.yml`: optional Actions workflow for GitHub Pages (needs a token with the `workflow` scope).
- `tools/publish-preview.sh`: builds the staging preview and pushes it to the `gh-pages` branch (what the showcase link uses).
