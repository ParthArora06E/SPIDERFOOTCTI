$ErrorActionPreference = "Stop"

# Configuration
# Path to SpiderFoot relative to the script location (or absolute)
# Default assumes it is installed as a sibling directory to spiderfoot-dashboard
$SpiderFootDir = (Resolve-Path "$PSScriptRoot\..\..\spiderfoot-app").Path
if (-not $SpiderFootDir) {
    $SpiderFootDir = Join-Path -Path $PSScriptRoot -ChildPath "..\..\spiderfoot-app"
}
$HostPort = "127.0.0.1:8080"

Write-Host "Checking for Python..." -ForegroundColor Cyan
try {
    $pythonVersion = (python --version)
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Python is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

Write-Host "Checking for SpiderFoot directory at $SpiderFootDir..." -ForegroundColor Cyan
if (-Not (Test-Path -Path $SpiderFootDir)) {
    Write-Host "Error: SpiderFoot directory not found at $SpiderFootDir" -ForegroundColor Red
    Write-Host "Please clone SpiderFoot first:"
    Write-Host "  git clone https://github.com/smicallef/spiderfoot.git $SpiderFootDir"
    exit 1
}

Write-Host "Checking for sf.py..." -ForegroundColor Cyan
$sfScript = Join-Path -Path $SpiderFootDir -ChildPath "sf.py"
if (-Not (Test-Path -Path $sfScript)) {
    Write-Host "Error: sf.py not found in $SpiderFootDir" -ForegroundColor Red
    exit 1
}

Write-Host "Starting SpiderFoot on $HostPort..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop." -ForegroundColor Yellow

Set-Location -Path $SpiderFootDir
python sf.py -l $HostPort
