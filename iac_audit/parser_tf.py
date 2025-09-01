
from pathlib import Path
from typing import List, Dict, Any
import hcl2

def parse_terraform_file(path: Path) -> List[Dict[str, Any]]:
	"""
	Return normalized resources:
	{ type, name, body, file }
	"""
	with open(path, "r", encoding="utf-8") as f:
		try:
			data = hcl2.load(f)
		except Exception:
			return []

	results: List[Dict[str, Any]] = []
	for block in data.get("resource", []):
		# block is like {'aws_security_group': [{'web_sg': {...}}]}
		for rtype, rlist in block.items():
			for item in rlist:
				if isinstance(item, dict):
					for name, body in item.items():
						results.append({
							"type": rtype,
							"name": name,
							"body": body,
							"file": str(path),
						})
	return results
