
from pathlib import Path
from typing import List, Dict, Any

IAC_EXTS = {".tf", ".yaml", ".yml"}

def discover_files(target: str) -> List[Path]:
	p = Path(target)
	if p.is_file() and p.suffix in IAC_EXTS:
		return [p]
	return [f for f in p.rglob("*") if f.is_file() and f.suffix in IAC_EXTS]

def summarize(findings: List[Dict[str, Any]]) -> Dict[str, int]:
	counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
	for f in findings:
		sev = f.get("severity", "LOW").upper()
		if sev in counts:
			counts[sev] += 1
	return counts
