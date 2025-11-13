# PowerShell script to stop and remove containers

Write-Host "=== Stopping IaC Audit Tool Containers ===" -ForegroundColor Cyan
Write-Host ""

$containers = @("iac-audit-backend", "iac-audit-frontend", "iac-audit-tool-backend-1", "iac-audit-tool-frontend-1")
$stopped = 0

foreach ($container in $containers) {
    Write-Host "Stopping and removing $container..." -ForegroundColor Yellow
    docker stop $container 2>$null | Out-Null
    $result = docker rm $container 2>&1
    if ($LASTEXITCODE -eq 0) {
        $stopped++
        Write-Host "✓ Removed $container" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Stopped and removed $stopped container(s)" -ForegroundColor Green
Write-Host ""

# Optionally remove the network (commented out to preserve for future use)
# Write-Host "Removing network..." -ForegroundColor Yellow
# docker network rm iac-audit-network 2>$null | Out-Null
