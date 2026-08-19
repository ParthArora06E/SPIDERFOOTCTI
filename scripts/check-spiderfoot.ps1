$ErrorActionPreference = "Stop"

$Url = "http://127.0.0.1:8080/ping"

Write-Host "Checking if SpiderFoot is reachable at $Url..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "Success: SpiderFoot is ONLINE and reachable." -ForegroundColor Green
        exit 0
    } else {
        Write-Host "Warning: SpiderFoot returned status code $($response.StatusCode)" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "Error: SpiderFoot is OFFLINE or unreachable." -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}
