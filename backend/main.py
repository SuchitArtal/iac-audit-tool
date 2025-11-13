import sys
import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

# Ensure repo root (where iac_audit resides) is on sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.api.scan import router as scan_router  # noqa: E402

# Configure root logging to ensure app logs are visible in container output
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logging.getLogger("backend").setLevel(logging.INFO)
logging.getLogger("iac_audit").setLevel(logging.INFO)

app = FastAPI(title="IaC Security Auditing API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "IaC Security Auditing API",
        "version": "0.1.0",
        "endpoints": {
            "health": "/health",
            "scan": "/scan",
            "docs": "/docs",
            "openapi": "/openapi.json"
        }
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/favicon.ico")
def favicon():
    """Return empty response for favicon requests to prevent 404 errors."""
    return Response(status_code=204)

app.include_router(scan_router)

# Run with: uvicorn backend.main:app --reload
