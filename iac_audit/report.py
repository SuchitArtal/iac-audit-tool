
from typing import List, Dict, Any
import json
from .utils import summarize

def to_json(findings: List[Dict[str, Any]]) -> str:
	data = {
		"summary": summarize(findings),
		"count": len(findings),
		"findings": findings,
	}
	return json.dumps(data, indent=2)

def to_markdown(findings: List[Dict[str, Any]]) -> str:
	s = summarize(findings)
	lines = []
	lines.append("# IaC Audit Report")
	lines.append("")
	lines.append("## Summary")
	lines.append(f"- CRITICAL: {s['CRITICAL']}")
	lines.append(f"- HIGH: {s['HIGH']}")
	lines.append(f"- MEDIUM: {s['MEDIUM']}")
	lines.append(f"- LOW: {s['LOW']}")
	lines.append(f"- Total findings: {len(findings)}")
	lines.append("")
	lines.append("## Findings")
	if not findings:
		lines.append("_No issues found._")
	else:
		for f in findings:
			lines.append(f"- **{f['severity']}** `{f['id']}` — **{f['title']}**")
			lines.append(f"  - File: `{f['file']}`  Resource: `{f['resource']}`")
			lines.append(f"  - Recommendation: {f['recommendation']}")
			lines.append("")
	return "\n".join(lines)
