
from pathlib import Path
from typing import List, Dict, Any
import logging

# Accepted IaC extensions (lowercase). Always compare using lower() to be case-insensitive.
IAC_EXTS = {".tf", ".yaml", ".yml"}
logger = logging.getLogger(__name__)

def discover_files(target: str) -> List[Path]:
	p = Path(target)
	if p.is_file() and p.suffix.lower() in IAC_EXTS:
		logger.info("discover_files: single file %s accepted", p)
		return [p]
	files = [
		f for f in p.rglob("*")
		if f.is_file() and f.suffix.lower() in IAC_EXTS
	]
	logger.info("discover_files: %d files under %s", len(files), target)
	return files

def summarize(findings: List[Dict[str, Any]]) -> Dict[str, int]:
	counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
	for f in findings:
		sev = f.get("severity", "LOW").upper()
		if sev in counts:
			counts[sev] += 1
	return counts
