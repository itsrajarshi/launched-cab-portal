# Installs a local git pre-commit hook that runs `gitleaks protect --staged`
# before every commit. Skips gracefully if gitleaks is not installed.
#
# Usage (PowerShell):
#   powershell -ExecutionPolicy Bypass -File scripts/install-gitleaks-hook.ps1
#
# Requirements: gitleaks on PATH (https://github.com/gitleaks/gitleaks)

$repoRoot = Split-Path -Parent $PSScriptRoot
$hooksDir = Join-Path $repoRoot ".git\hooks"
$hookFile = Join-Path $hooksDir "pre-commit"

if (-not (Test-Path $hooksDir)) {
  Write-Error "This script must run inside the repository (no .git/hooks found)."
  exit 1
}

$hookContent = @'
#!/usr/bin/env bash
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks protect --staged --source="$PWD" --config="$PWD/.gitleaks.toml"
else
  echo "gitleaks not found - skipping secret scan. Install it from https://github.com/gitleaks/gitleaks"
fi
'@

Set-Content -Path $hookFile -Value $hookContent -Encoding UTF8NoBOM
Write-Host "Installed pre-commit hook at $hookFile"
Write-Host "Note: on Windows, bash must be available (Git Bash). Set core.hooksPath if needed."