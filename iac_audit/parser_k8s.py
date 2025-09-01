
from pathlib import Path
from typing import List, Dict, Any
import yaml

def parse_k8s_file(path: Path) -> List[Dict[str, Any]]:
	"""
	Return normalized docs:
	{ kind, name, body, file }
	"""
	items: List[Dict[str, Any]] = []
	with open(path, "r", encoding="utf-8") as f:
		try:
			docs = yaml.safe_load_all(f)
			for doc in docs:
				if not isinstance(doc, dict):
					continue
				kind = doc.get("kind")
				meta = doc.get("metadata", {}) or {}
				name = meta.get("name", "<unknown>")
				items.append({
					"kind": kind,
					"name": name,
					"body": doc,
					"file": str(path),
				})
		except Exception:
			return []
	return items
