
# IaC Security Auditing Tool

The IaC Security Auditing Tool is a Python-based command-line utility for scanning Infrastructure-as-Code (IaC) templates—specifically Terraform and Kubernetes—for common security issues. It is designed for extensibility, automation, and integration into CI/CD pipelines.

## Features

- Scans directories or files for Terraform (`.tf`) and Kubernetes YAML (`.yaml`, `.yml`) templates
- Detects insecure configurations, such as:
	- Open AWS Security Groups (Terraform)
	- Containers running as root (Kubernetes)
- Generates reports in JSON or Markdown format
- Easily extensible with new rules and output formats

## Getting Started

### 1. Install Dependencies

Create and activate a virtual environment, then install requirements:

```bash
python3 -m venv .venv
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Add or Use Sample Files

Sample insecure files are provided in `tests/samples/terraform/sg_open.tf` and `tests/samples/k8s/pod-root.yaml`.

### 3. Run the CLI

```bash
python -m iac_audit.cli scan ./tests/samples --output md
# or for JSON output
python -m iac_audit.cli scan ./tests/samples --output json
```

## Output Example (Markdown)

```
# IaC Audit Report

## Summary
- CRITICAL: 0
- HIGH: 2
- MEDIUM: 0
- LOW: 0
- Total findings: 2

## Findings
- **HIGH** `TF.SG.OPEN` — **Security Group allows ingress from 0.0.0.0/0**
	- File: `tests/samples/terraform/sg_open.tf`  Resource: `aws_security_group.web_sg`
	- Recommendation: Restrict ingress CIDRs to known IP ranges or use load balancers/WAF.

- **HIGH** `K8S.RUNASROOT` — **Container "nginx" may run as root.**
	- File: `tests/samples/k8s/pod-root.yaml`  Resource: `Pod.nginx-root`
	- Recommendation: Set securityContext.runAsNonRoot: true (and/or runAsUser: a non-zero UID).
```

## Project Structure

```
iac-audit-tool/
│── iac_audit/
│   ├── __init__.py
│   ├── cli.py          # CLI entry point
│   ├── parser_tf.py    # Terraform parser
│   ├── parser_k8s.py   # Kubernetes parser
│   ├── rules_tf.py     # Terraform security rules
│   ├── rules_k8s.py    # Kubernetes security rules
│   ├── report.py       # JSON + Markdown report generator
│   └── utils.py        # helper functions
│
│── tests/
│   ├── samples/        # sample IaC templates (secure + insecure)
│   └── test_rules.py   # unit tests
│
│── requirements.txt
│── README.md
```

## Extending the Tool

- Add new rules in `rules_tf.py` or `rules_k8s.py`.
- Add new output formats in `report.py`.
- Add more sample files in `tests/samples/` for testing.

## Next Steps

- Add more security rules for both Terraform and Kubernetes
- Implement automated unit tests in `tests/test_rules.py`
- Improve reporting and CLI user experience
- Expand documentation and usage examples

## License

This project is for educational and demonstration purposes.
