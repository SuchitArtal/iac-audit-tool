from pathlib import Path
from typing import List, Dict, Any
import datetime
import logging

from iac_audit.utils import discover_files, summarize
from iac_audit.parser_tf import parse_terraform_file
from iac_audit.parser_k8s import parse_k8s_file
from iac_audit.rules_tf import run_tf_rules
from iac_audit.rules_k8s import run_k8s_rules
from backend.services.rules_tf_ext import run_tf_extra_rules
from backend.services.rules_k8s_ext import run_k8s_extra_rules
from backend.services.sarif import generate_sarif

from backend.models.report import ReportModel, FindingModel

logger = logging.getLogger(__name__)

def scan_directory(target_dir: Path) -> ReportModel:
    started_at = datetime.datetime.utcnow()
    files = discover_files(str(target_dir))
    sample = [str(p) for p in files[:10]]
    logger.info(
        "Discovered %d candidate IaC files in %s | sample=%s%s",
        len(files),
        target_dir,
        sample,
        " ..." if len(files) > 10 else "",
    )

    tf_resources: List[Dict[str, Any]] = []
    k8s_docs: List[Dict[str, Any]] = []

    for f in files:
        if f.suffix == ".tf":
            tf_resources.extend(parse_terraform_file(f))
        elif f.suffix in {".yaml", ".yml"}:
            k8s_docs.extend(parse_k8s_file(f))
    logger.info("Parsed resources | terraform=%d k8s_docs=%d", len(tf_resources), len(k8s_docs))

    findings: List[Dict[str, Any]] = []
    base_tf = run_tf_rules(tf_resources)
    ext_tf = run_tf_extra_rules(tf_resources)
    base_k8s = run_k8s_rules(k8s_docs)
    ext_k8s = run_k8s_extra_rules(k8s_docs)
    findings.extend(base_tf)
    findings.extend(ext_tf)
    findings.extend(base_k8s)
    findings.extend(ext_k8s)
    logger.info("Rule findings breakdown | tf_base=%d tf_ext=%d k8s_base=%d k8s_ext=%d", len(base_tf), len(ext_tf), len(base_k8s), len(ext_k8s))

    # Global K8s rule: if K8s docs exist but no NetworkPolicy found
    if k8s_docs:
        has_np = any((d.get("kind") == "NetworkPolicy") for d in k8s_docs)
        if not has_np:
            findings.append({
                "id": "K8S.NO_NETWORKPOLICY",
                "severity": "LOW",
                "title": "No Kubernetes NetworkPolicy resources detected",
                "file": "-",
                "resource": "Kubernetes.NetworkPolicy",
                "recommendation": "Define NetworkPolicy to restrict pod ingress/egress by default (deny-all baseline).",
            })
            logger.info("Added global finding K8S.NO_NETWORKPOLICY")

    finding_models = [FindingModel(**f) for f in findings]
    summary = summarize(findings)

    sarif = generate_sarif(findings)
    logger.info("Generated SARIF with %d results", len(findings))
    elapsed = (datetime.datetime.utcnow() - started_at).total_seconds()

    report = ReportModel(
        summary=summary,
        count=len(findings),
        findings=finding_models,
        metadata={
            "scanned_at": datetime.datetime.utcnow().isoformat() + "Z",
            "total_files": len(files),
            "terraform_resources": len(tf_resources),
            "k8s_documents": len(k8s_docs),
            "scan_time": elapsed,
            "sarif": sarif,
            "scanned_files": [str(p) for p in files[:50]],
        },
    )
    logger.info("ReportModel created | count=%d summary=%s", report.count, report.summary)
    return report
