#!/usr/bin/env bash
# Push NiiBooo to GitHub (macOS / Linux / Git Bash)
# Usage (from the project root):  bash scripts/push-to-github.sh
# Prerequisite: create an EMPTY repo at https://github.com/StevanusGerM/niiboo-app (no README/.gitignore/license).
set -euo pipefail

REMOTE_URL="https://github.com/StevanusGerM/niiboo-app.git"
BRANCH="main"

[ -d .git ] || git init

git add -A
if git diff --cached --quiet; then
  echo "Nothing new to commit."
else
  git commit -m "feat: initial NiiBooo app (Next.js + Supabase)"
fi

git branch -M "$BRANCH"

if git remote | grep -qx origin; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

# If the remote already has commits (e.g. a README created on GitHub), integrate them first.
if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  git pull --rebase origin "$BRANCH"
fi

git push -u origin "$BRANCH"
echo "Done! https://github.com/StevanusGerM/niiboo-app"
