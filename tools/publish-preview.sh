#!/usr/bin/env bash
# Publish the STAGING preview to GitHub Pages (gh-pages branch of the origin repository).
# Every page is built with noindex and robots.txt disallows crawling; this is for showing the owner, not for launch.
# Usage: bash tools/publish-preview.sh            (from the project root; needs git + a pushable origin)
set -euo pipefail
cd "$(dirname "$0")/.."
ORIGIN_URL=$(git remote get-url origin)
# derive https://<owner>.github.io/<repo> from the origin URL
OWNER_REPO=$(echo "$ORIGIN_URL" | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')
OWNER=${OWNER_REPO%%/*}; REPO=${OWNER_REPO##*/}
export SITE_BASE_URL="https://${OWNER}.github.io/${REPO}"
export SITE_STAGING=1
echo "Building staging preview for $SITE_BASE_URL"
node build.mjs
node tests/check.mjs >/dev/null && echo "checks passed"
WT=$(mktemp -d)
git worktree add -B gh-pages "$WT" >/dev/null 2>&1 || git worktree add --detach "$WT" >/dev/null
rm -rf "$WT"/* "$WT"/.[!.]* 2>/dev/null || true
cp -R dist/. "$WT"/
touch "$WT/.nojekyll"
( cd "$WT" && git checkout -q -B gh-pages && git add -A && git -c core.safecrlf=false commit -q -m "Preview build $(date -u +%Y-%m-%dT%H:%M:%SZ) (staging, noindex)" && git push -f origin gh-pages 2>&1 | tail -1 )
git worktree remove --force "$WT"
# production build back into dist/ so local work is unaffected
unset SITE_BASE_URL SITE_STAGING
node build.mjs >/dev/null
echo "Published. Pages serves it at ${SITE_BASE_URL:-https://${OWNER}.github.io/${REPO}}/ within a minute or two."
