#!/usr/bin/env bash
# Rebuild the data and publish site/ to the gh-pages branch.
# Run from anywhere:  work/scripts/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
python3 work/scripts/build_data.py
tmp=$(mktemp -d)
trap 'git worktree remove --force "$tmp"' EXIT
git fetch -q origin gh-pages
git worktree add -q -B gh-pages "$tmp" origin/gh-pages
find "$tmp" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -r site/. "$tmp"/
touch "$tmp/.nojekyll"
git -C "$tmp" add -A
if ! git -C "$tmp" diff --cached --quiet; then
  git -C "$tmp" commit -q -m "Publish site from $(git rev-parse --short HEAD)"
  git -C "$tmp" push -q origin gh-pages
fi
