
from pathlib import Path
from typing import List, Dict, Any
import hcl2

def parse_terraform_file(path: Path) -> List[Dict[str, Any]]:
	"""
	Return normalized resources:
	{ type, name, body, file }
	Supports hcl2 load shapes where resource block values may be a list of dicts
	or a dict mapping name -> body.
	"""
	with open(path, "r", encoding="utf-8") as f:
		try:
			data = hcl2.load(f)
		except Exception:
			return []

	results: List[Dict[str, Any]] = []
	for block in data.get("resource", []):
		for rtype, rval in block.items():
			# Case A: list of dicts: [{'name': {...}}, ...]
			if isinstance(rval, list):
				for item in rval:
					if isinstance(item, dict):
						for name, body in item.items():
							results.append({
								"type": rtype,
								"name": name,
								"body": body,
								"file": str(path),
							})
			# Case B: dict mapping name -> body
			elif isinstance(rval, dict):
				for name, body in rval.items():
					results.append({
						"type": rtype,
						"name": name,
						"body": body,
						"file": str(path),
					})
	return results
