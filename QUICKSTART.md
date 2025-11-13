# Quick Start Guide

## Starting the Application

Due to a known Docker Desktop issue on Windows that causes "No such container" errors with `docker compose`, we provide a workaround script.

### Option 1: Use the Workaround Script (Recommended for Windows)

```powershell
.\start-containers.ps1
```

This script:
- Builds the Docker images
- Starts both backend and frontend containers
- Uses `docker run` directly to bypass Docker Compose issues

### Option 2: Use Docker Compose (If it works on your system)

```bash
docker compose up --build
```

### Option 3: Manual Start (If scripts don't work)

```powershell
# Build images
docker compose build

# Start backend
docker run -d --name iac-audit-backend -p 8000:8000 -v "${PWD}\iac_audit:/app/iac_audit" -v "${PWD}\backend:/app/backend" -e PYTHONUNBUFFERED=1 iac-audit-tool-backend uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Start frontend
docker run -d --name iac-audit-frontend -p 5173:5173 -v "${PWD}\frontend:/app" -e VITE_API_BASE_URL=http://localhost:8000 iac-audit-tool-frontend
```

## Stopping the Application

```powershell
.\stop-containers.ps1
```

Or manually:
```powershell
docker stop iac-audit-backend iac-audit-frontend
docker rm iac-audit-backend iac-audit-frontend
```

## Accessing the Application

- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Frontend UI**: http://localhost:5173

## Troubleshooting

### "No such container" error with Docker Compose

This is a known Docker Desktop bug on Windows. Solutions:
1. **Restart Docker Desktop** - Right-click the Docker icon in system tray → Restart
2. **Use the workaround script** - `.\start-containers.ps1`
3. **Use manual docker run commands** - See Option 3 above

### Containers not starting

1. Check if ports 8000 and 5173 are already in use:
   ```powershell
   netstat -ano | findstr "8000 5173"
   ```

2. Check Docker logs:
   ```powershell
   docker logs iac-audit-backend
   docker logs iac-audit-frontend
   ```

3. Verify images are built:
   ```powershell
   docker images | Select-String "iac-audit"
   ```

### Volume mount issues

If you see permission errors or files not updating:
- Ensure Docker Desktop has access to the project directory
- Check Docker Desktop Settings → Resources → File Sharing
- Try using absolute paths instead of relative paths

