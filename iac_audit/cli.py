
import argparse
import os
import sys
from pathlib import Path
from typing import List, Dict, Any

from .utils import discover_files
from .parser_tf import parse_terraform_file
from .parser_k8s import parse_k8s_file
from .rules_tf import run_tf_rules
from .rules_k8s import run_k8s_rules
from .report import to_json, to_markdown

def scan_path(target: str) -> List[Dict[str, Any]]:
    files = discover_files(target)
    tf_resources: List[Dict[str, Any]] = []
    k8s_docs: List[Dict[str, Any]] = []

    for f in files:
        if f.suffix == ".tf":
            tf_resources.extend(parse_terraform_file(f))
        elif f.suffix in {".yaml", ".yml"}:
            k8s_docs.extend(parse_k8s_file(f))

    findings: List[Dict[str, Any]] = []
    findings.extend(run_tf_rules(tf_resources))
    findings.extend(run_k8s_rules(k8s_docs))
    return findings

def main():
    parser = argparse.ArgumentParser(description="IaC Security Auditing Tool")
    subparsers = parser.add_subparsers(dest="command", required=True)

    scan_parser = subparsers.add_parser("scan", help="Scan IaC templates for security issues.")
    scan_parser.add_argument("path", type=str, help="Path to IaC templates.")
    scan_parser.add_argument("--output", choices=["json", "md"], default="json", help="Output format (json or md). Default: json.")
    scan_parser.add_argument("--out-file", help="Write report to a file instead of stdout")

    args = parser.parse_args()

    if args.command == "scan":
        path = args.path
        if not os.path.exists(path):
            print(f"[ERROR] Path {path} does not exist.", file=sys.stderr)
            sys.exit(1)

        findings = scan_path(path)
        report = to_json(findings) if args.output == "json" else to_markdown(findings)

        if args.out_file:
            Path(args.out_file).write_text(report, encoding="utf-8")
            print(f"Report written to {args.out_file}")
        else:
            print(report)

if __name__ == "__main__":
    main()
