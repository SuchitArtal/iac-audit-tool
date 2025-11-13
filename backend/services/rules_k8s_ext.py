from typing import Dict, Any, List

WORKLOAD_KINDS = {"Pod","Deployment","StatefulSet","DaemonSet","Job","CronJob"}

def _finding(doc: Dict[str, Any], fid: str, severity: str, title: str, recommendation: str) -> Dict[str, Any]:
    return {
        "id": fid,
        "severity": severity,
        "title": title,
        "file": doc.get("file", "<unknown>"),
        "resource": f'{doc.get("kind")}.{doc.get("name")}',
        "recommendation": recommendation,
    }


def _containers_from(doc: Dict[str, Any]):
    body = doc.get("body", {})
    kind = doc.get("kind")
    spec = (body.get("spec") or {})
    if kind in {"Deployment","StatefulSet","DaemonSet","Job"}:
        spec = ((spec.get("template") or {}).get("spec") or {})
    if kind == "CronJob":
        spec = (((spec.get("jobTemplate") or {}).get("spec") or {}).get("template") or {}).get("spec") or {}
    containers = list(spec.get("containers") or []) + list(spec.get("initContainers") or [])
    pod_sc = spec.get("securityContext") or {}
    for c in containers:
        eff = {}
        eff.update(pod_sc)
        eff.update(c.get("securityContext") or {})
        c["_effective_sc"] = eff
    return containers, spec


def check_privileged(doc: Dict[str, Any]) -> List[Dict[str, Any]]:
    findings: List[Dict[str, Any]] = []
    if doc.get("kind") not in WORKLOAD_KINDS:
        return findings
    containers, _ = _containers_from(doc)
    for c in containers:
        sc = c.get("_effective_sc", {})
        if sc.get("privileged") is True:
            findings.append(_finding(
                doc,
                "K8S.PRIVILEGED",
                "HIGH",
                f'Container "{c.get("name","<unnamed>")}" runs privileged.',
                "Avoid privileged containers; grant only required capabilities."
            ))
    return findings


def check_hostpath(doc: Dict[str, Any]) -> List[Dict[str, Any]]:
    findings: List[Dict[str, Any]] = []
    body = doc.get("body", {})
    kind = doc.get("kind")
    spec = body.get("spec") or {}
    if kind in {"Deployment","StatefulSet","DaemonSet","Job"}:
        spec = ((spec.get("template") or {}).get("spec") or {})
    if kind == "CronJob":
        spec = (((spec.get("jobTemplate") or {}).get("spec") or {}).get("template") or {}).get("spec") or {}
    volumes = spec.get("volumes") or []
    for v in volumes:
        if v.get("hostPath"):
            findings.append(_finding(
                doc,
                "K8S.HOSTPATH",
                "MEDIUM",
                f'hostPath volume used: "{v.get("name","<unnamed>")}"',
                "Avoid hostPath when possible; use PVCs or projected volumes."
            ))
    return findings


def check_resources_limits(doc: Dict[str, Any]) -> List[Dict[str, Any]]:
    findings: List[Dict[str, Any]] = []
    if doc.get("kind") not in WORKLOAD_KINDS:
        return findings
    containers, _ = _containers_from(doc)
    for c in containers:
        res = c.get("resources") or {}
        limits = res.get("limits") or {}
        if not ("cpu" in limits and "memory" in limits):
            findings.append(_finding(
                doc,
                "K8S.NO_LIMITS",
                "MEDIUM",
                f'Container "{c.get("name","<unnamed>")}" has no CPU/memory limits.',
                "Set resources.limits for cpu and memory to avoid noisy neighbors."
            ))
    return findings


def check_readonly_rootfs(doc: Dict[str, Any]) -> List[Dict[str, Any]]:
    findings: List[Dict[str, Any]] = []
    if doc.get("kind") not in WORKLOAD_KINDS:
        return findings
    containers, _ = _containers_from(doc)
    for c in containers:
        sc = c.get("_effective_sc", {})
        if sc.get("readOnlyRootFilesystem") is not True:
            findings.append(_finding(
                doc,
                "K8S.NO_READONLY_ROOTFS",
                "MEDIUM",
                f'Container "{c.get("name","<unnamed>")}" does not set readOnlyRootFilesystem.',
                "Set securityContext.readOnlyRootFilesystem: true."
            ))
    return findings


def run_k8s_extra_rules(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    all_findings: List[Dict[str, Any]] = []
    for d in docs:
        all_findings.extend(check_privileged(d))
        all_findings.extend(check_hostpath(d))
        all_findings.extend(check_resources_limits(d))
        all_findings.extend(check_readonly_rootfs(d))
    return all_findings
