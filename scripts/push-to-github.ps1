# Push NiiBooo to GitHub (Windows PowerShell)
# Usage (from the project root):  powershell -ExecutionPolicy Bypass -File scripts\push-to-github.ps1
# Prerequisite: create an EMPTY repo at https://github.com/StevanusGerM/niiboo-app (no README/.gitignore/license).

$ErrorActionPreference = "Stop"
$RemoteUrl = "https://github.com/StevanusGerM/niiboo-app.git"
$Branch = "main"

if (-not (Test-Path ".git")) {
    git init
}

# Never commit secrets
if (Test-Path ".env.local") { Write-Host ".env.local found - it is ignored by .gitignore and will NOT be pushed." }

git add -A
$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "feat: initial NiiBooo app (Next.js + Supabase)"
} else {
    Write-Host "Nothing new to commit."
}

git branch -M $Branch

$existing = git remote
if ($existing -contains "origin") {
    git remote set-url origin $RemoteUrl
} else {
    git remote add origin $RemoteUrl
}

# If the remote already has commits (e.g. a README created on GitHub), integrate them first.
git ls-remote --exit-code --heads origin $Branch | Out-Null
if ($LASTEXITCODE -eq 0) {
    git pull --rebase origin $Branch
}

git push -u origin $Branch
Write-Host "Done! https://github.com/StevanusGerM/niiboo-app"
