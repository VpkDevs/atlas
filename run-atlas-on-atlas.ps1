# Atlas-on-Atlas Launcher
# Just double-click this file (or run it from PowerShell). That's it.

$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot ".atlas-state\atlas-self\score-atlas-with-atlas.mjs"

if (-not (Test-Path $scriptPath)) {
    Write-Host ""
    Write-Host "ERROR: Atlas-on-Atlas script not found at:" -ForegroundColor Red
    Write-Host "  $scriptPath" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to close"
    exit 1
}

# Check node is available
try {
    $nodeVersion = node --version 2>&1
    Write-Host "Using Node.js $nodeVersion" -ForegroundColor DarkGray
} catch {
    Write-Host ""
    Write-Host "ERROR: Node.js is not installed or not on PATH." -ForegroundColor Red
    Write-Host "Install from: https://nodejs.org" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to close"
    exit 1
}

# Run it
node $scriptPath

Write-Host ""
Write-Host "Done. Results saved to: .atlas-state\atlas-self\latest-report.json" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to close"
