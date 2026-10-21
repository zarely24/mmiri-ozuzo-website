#!/usr/bin/env bash
# Publish the STAGING preview to GitHub Pages (gh-pages branch of the origin repository).
# Every page is built with noindex and robots.txt disallows crawling; this is for showing the owner, not for launch.
# Usage: bash tools/publish-preview.sh            (from the project root; needs git + a pushable origin)
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$(pwd)
ORIGIN_URL=$(git remote get-url origin)
OWNER_REPO=$(echo "$ORIGIN_URL" | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')
OWNER=${OWNER_REPO%%/*}; REPO=${OWNER_REPO##*/}
PREVIEW_URL="https://${OWNER}.github.io/${REPO}"

echo "Building staging preview for $PREVIEW_URL"
SITE_BASE_URL="$PREVIEW_URL" SITE_STAGING=1 node build.mjs
SITE_BASE_URL="$PREVIEW_URL" SITE_STAGING=1 node tests/check.mjs >/dev/null && echo "checks passed"

git worktree prune
WT=$(mktemp -d)
git worktree add --detach "$WT" HEAD >/dev/null
(
  cd "$WT"
  git checkout -q --orphan preview-tmp
  git rm -rfq --cached . >/dev/null 2>&1 || true
  find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
  cp -R "$ROOT/dist/." .
  touch .nojekyll
  git add -A
  git -c core.safecrlf=false commit -q -m "Preview build $(date -u +%Y-%m-%dT%H:%M:%SZ) (staging, noindex)"
  git push -f origin preview-tmp:gh-pages 2>&1 | tail -1
)
git worktree remove --force "$WT"
git branch -D preview-tmp >/dev/null 2>&1 || true

# production build back into dist/ so local work is unaffected
node build.mjs >/dev/null
echo "Published to the gh-pages branch. Pages serves it at ${PREVIEW_URL}/ within a minute or two."
