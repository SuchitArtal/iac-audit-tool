
from typing import Dict, Any, List

WORKLOAD_KINDS = {"Pod","Deployment","StatefulSet","DaemonSet","Job","CronJob"}

def _finding(doc: Dict[str, Any], fid: str, severity: str, title: str, recommendation: str) -> Dict[str, Any]:
	return {
		"id": fid,
		"severity": severity,
		"title": title,
		"file": doc["file"],
		"resource": f'{doc.get("kind")}.{doc.get("name")}',
		"recommendation": recommendation,
	}

def _containers_from(doc: Dict[str, Any]) -> List[Dict[str, Any]]:
	body = doc["body"]
	kind = doc.get("kind")
	spec = body.get("spec", {}) or {}
	if kind in {"Deployment","StatefulSet","DaemonSet","Job"}:
		spec = spec.get("template", {}).get("spec", {}) or {}
	if kind == "CronJob":
		spec = spec.get("jobTemplate", {}).get("spec", {}).get("template", {}).get("spec", {}) or {}
	containers = list(spec.get("containers", []) or [])
	containers += list(spec.get("initContainers", []) or [])
	pod_sc = spec.get("securityContext", {}) or {}
	# Attach effective pod securityContext to each container for evaluation
	for c in containers:
		eff = {}
		eff.update(pod_sc)
		eff.update(c.get("securityContext", {}) or {})
		c["_effective_sc"] = eff
	return containers

def check_run_as_root(doc: Dict[str, Any]) -> List[Dict[str, Any]]:
	findings: List[Dict[str, Any]] = []
	if doc.get("kind") not in WORKLOAD_KINDS:
		return findings

	for c in _containers_from(doc):
		sc = c.get("_effective_sc", {})
		run_as_non_root = sc.get("runAsNonRoot")
		run_as_user = sc.get("runAsUser")
		# Flag if explicit non-root is not enforced
		if run_as_non_root is not True and (run_as_user in (None, 0)):
			findings.append(_finding(
				doc,
				"K8S.RUNASROOT",
				"HIGH",
				f'Container "{c.get("name","<unnamed>")}" may run as root.',
				"Set securityContext.runAsNonRoot: true (and/or runAsUser: a non-zero UID)."
			))
	return findings

def run_k8s_rules(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
	all_findings: List[Dict[str, Any]] = []
	for d in docs:
		all_findings.extend(check_run_as_root(d))
	return all_findings
