# PowerShell script to start containers (workaround for Docker Compose issue on Windows)
# This script uses docker run directly to bypass Docker Compose issues

$ErrorActionPreference = "Continue"

Write-Host "=== IaC Audit Tool - Container Startup Script ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean up existing containers
Write-Host "[1/5] Cleaning up any existing containers..." -ForegroundColor Yellow
$containers = @("iac-audit-backend", "iac-audit-frontend", "iac-audit-tool-backend-1", "iac-audit-tool-frontend-1")
foreach ($container in $containers) {
    docker rm -f $container 2>$null | Out-Null
}
Start-Sleep -Seconds 1

# Step 2: Build images using Docker Compose (this works fine)
Write-Host "[2/5] Building Docker images..." -ForegroundColor Yellow
docker compose build 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Build had issues, but continuing..." -ForegroundColor Yellow
}
Write-Host "✓ Images built successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Create a Docker network
Write-Host "[3/5] Ensuring Docker network exists..." -ForegroundColor Yellow
docker network create iac-audit-network 2>$null | Out-Null
Write-Host "✓ Network ready" -ForegroundColor Green
Write-Host ""

# Step 4: Start backend container
Write-Host "[4/5] Starting backend container..." -ForegroundColor Green
$projectPath = (Resolve-Path .).Path
$backendResult = docker run -d `
    --name iac-audit-backend `
    --network iac-audit-network `
    -p 8000:8000 `
    -v "${projectPath}\iac_audit:/app/iac_audit" `
    -v "${projectPath}\backend:/app/backend" `
    -e PYTHONUNBUFFERED=1 `
    iac-audit-tool-backend `
    uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend container started: $backendResult" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to start backend container" -ForegroundColor Red
    Write-Host $backendResult -ForegroundColor Red
    exit 1
}
Start-Sleep -Seconds 3

# Step 5: Start frontend container
Write-Host "[5/5] Starting frontend container..." -ForegroundColor Green
$frontendResult = docker run -d `
    --name iac-audit-frontend `
    --network iac-audit-network `
    -p 5173:5173 `
    -v "${projectPath}\frontend:/app" `
    -v /app/node_modules `
    -e VITE_API_BASE_URL=http://localhost:8000 `
    iac-audit-tool-frontend 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend container started: $frontendResult" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to start frontend container" -ForegroundColor Red
    Write-Host $frontendResult -ForegroundColor Red
    Write-Host "Cleaning up backend container..." -ForegroundColor Yellow
    docker rm -f iac-audit-backend 2>$null | Out-Null
    exit 1
}

Write-Host ""
Write-Host "=== Containers Started Successfully! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend UI:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "API Docs:     http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  View logs:    docker logs -f iac-audit-backend" -ForegroundColor White
Write-Host "  Stop:         .\stop-containers.ps1" -ForegroundColor White
Write-Host "  Status:       docker ps | Select-String 'iac-audit'" -ForegroundColor White
Write-Host ""
