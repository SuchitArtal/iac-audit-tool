from typing import List, Optional
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Query
from fastapi.responses import JSONResponse
import tempfile
from pathlib import Path
import zipfile
import shutil
import time

from backend.models.report import ReportModel
from backend.services.scanner import scan_directory
from backend.utils.file_handler import save_uploads
from iac_audit.report import to_markdown

router = APIRouter()
logger = logging.getLogger(__name__)

SEVERITY_ORDER = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}


@router.post("/scan", tags=["scan"])
async def scan_endpoint(
    files: Optional[List[UploadFile]] = File(default=None, description="Multiple IaC files (.tf, .yaml, .yml)"),
    archive: Optional[UploadFile] = File(default=None, description="Single .zip archive of IaC files"),
    severity: Optional[str] = Query(default=None, description="Minimum severity to include (LOW|MEDIUM|HIGH|CRITICAL)"),
):
    if not files and not archive:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Provide 'files' or 'archive' to scan.")
    t0 = time.perf_counter()
    logger.info("/scan called | severity=%s | files=%s | archive=%s",
                severity, [getattr(f, 'filename', None) for f in (files or [])],
                getattr(archive, 'filename', None))

    with tempfile.TemporaryDirectory(prefix="iac_scan_") as tmpdir:
        temp_dir = Path(tmpdir)

        saved_files: List[Path] = []
        if files:
            saved_files = await save_uploads(files, temp_dir)
            logger.info("Saved %d uploaded files to %s: %s", len(saved_files), temp_dir, [p.name for p in saved_files])

        total_archived = 0
        if archive:
            if not archive.filename or not archive.filename.lower().endswith(".zip"):
                raise HTTPException(status_code=400, detail="Archive must be a .zip file.")
            zip_path = temp_dir / archive.filename
            with open(zip_path, "wb") as zf:
                shutil.copyfileobj(archive.file, zf)
            try:
                with zipfile.ZipFile(zip_path, "r") as z:
                    z.extractall(temp_dir)
                    total_archived = len(z.namelist())
                    logger.info("Extracted %d entries from archive %s", total_archived, archive.filename)
            except zipfile.BadZipFile:
                raise HTTPException(status_code=400, detail="Invalid ZIP archive.")

        # Run the scan while temp_dir still exists
        logger.info("Scanning directory: %s", temp_dir)
        report = scan_directory(temp_dir)
        logger.info(
            "Scan complete | total_files=%s tf_resources=%s k8s_documents=%s findings=%s",
            report.metadata.get("total_files"),
            report.metadata.get("terraform_resources"),
            report.metadata.get("k8s_documents"),
            report.count,
        )

        report.metadata["upload_files"] = len(saved_files)
        report.metadata["archive_entries"] = total_archived
        elapsed = round(time.perf_counter() - t0, 4)
        report.metadata["elapsed_seconds"] = elapsed

        # Convert to dict
        data = report.model_dump()
        findings = data.get("findings", [])

        # Severity filtering (threshold)
        if severity:
            sev = severity.upper()
            if sev not in SEVERITY_ORDER:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid severity. Use one of LOW, MEDIUM, HIGH, CRITICAL",
                )
            findings = [
                f for f in findings
                if SEVERITY_ORDER.get(f.get("severity", "LOW"), 1) >= SEVERITY_ORDER[sev]
            ]

        # Rebuild summary after filtering
        from iac_audit.utils import summarize
        summary = summarize(findings)
        logger.info("Post-filter summary: %s", summary)

        # SARIF and Markdown
        sarif = data.get("metadata", {}).get("sarif")
        markdown = to_markdown(findings)

        # Include useful counters for the frontend
        response = {
            "summary": summary,
            "count": len(findings),
            "findings": findings,
            "total_files": data.get("metadata", {}).get("total_files", 0),
            "terraform_resources": data.get("metadata", {}).get("terraform_resources", 0),
            "k8s_documents": data.get("metadata", {}).get("k8s_documents", 0),
            "scan_time": elapsed,
            "sarif": sarif,
            "markdown": markdown,
            "debug": {
                "uploaded_files": len(saved_files),
                "archive_entries": total_archived,
                "saved_filenames": [p.name for p in saved_files][:20],
                "discovered_files": data.get("metadata", {}).get("total_files", 0),
            },
        }

    # Let FastAPI handle JSON serialization to avoid any proxy/serialization oddities
    return response
