
# IaC Security Auditing Tool

Infrastructure-as-Code (IaC) security scanner supporting both a Python CLI and a full web/API experience (FastAPI backend + React frontend). It analyzes Terraform (`.tf`) and Kubernetes manifests (`.yaml` / `.yml`) for common misconfigurations, produces JSON / Markdown / SARIF output, and is designed to plug into CI pipelines or manual reviews.

## Features

**Core**
- Parse Terraform & Kubernetes manifests (including multi-doc YAML)
- Security rule engine (base + extended rule sets)
- Global Kubernetes posture check (missing `NetworkPolicy`)
- Severity classification (LOW, MEDIUM, HIGH, CRITICAL) + filtering

**Outputs**
- JSON (raw findings + counters)
- Markdown summary (human-readable report)
- SARIF 2.1.0 (compatible with GitHub code scanning)

**Interfaces**
- CLI (`python -m iac_audit.cli scan ...`)
- REST API (`POST /scan`) with multi-file and zip archive upload
- Web UI (drag & drop, charts, interactive filtering, downloads)

**Extensibility & Observability**
- Pluggable rule modules (`rules_tf.py`, `rules_k8s.py`, extended rule packages)
- Rich debug metadata (discovered files, resource counts, scan time)
- Docker Compose dev environment

## Tech Stack

Backend: FastAPI, Pydantic v2, python-hcl2, PyYAML
Frontend: React 18, Vite, TailwindCSS, Recharts, Framer Motion, Axios, Sonner
Language: Python 3.11 (container), JavaScript/JSX

## Quick Start (Docker Compose)

```bash
docker compose up --build
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
```

Upload one of the insecure samples (e.g. `tests/samples/k8s/pod-root.yaml`) via the UI and view findings.

## Manual Dev Setup (Backend + Frontend)

```bash
# Backend
python -m venv .venv
source .venv/Scripts/activate  # Windows bash / Git Bash
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev  # launches on http://localhost:5173
```

Set `VITE_API_BASE_URL=http://localhost:8000` in `frontend/.env` if needed.

## CLI Usage

```bash
python -m iac_audit.cli scan ./tests/samples --output json
python -m iac_audit.cli scan ./tests/samples --output md --min-severity HIGH
```

## API Usage

`POST /scan` (multipart/form-data)

Parameters:
- `files`: one or more `.tf`, `.yaml`, `.yml` files
- `archive`: optional `.zip` containing IaC files
- `severity`: optional minimum severity threshold (LOW|MEDIUM|HIGH|CRITICAL)

Response (keys):
- `summary`: severity counts
- `count`: findings count after filtering
- `findings`: list of finding objects `{ id, severity, title, file, resource, recommendation }`
- `total_files`, `terraform_resources`, `k8s_documents`
- `scan_time` (seconds)
- `sarif` (SARIF dict)
- `markdown` (string)
- `debug` (upload + discovery diagnostics)

Example curl (single file):
```bash
curl -X POST -F "files=@tests/samples/k8s/pod-root.yaml" http://localhost:8000/scan
```

## Frontend Usage

1. Drag & drop files or a zip.
2. Optional severity filter restricts results client-side via server threshold.
3. View charts (pie + bar) and metrics panel.
4. Download JSON / Markdown / SARIF with one click.

## Rules (Current Set Highlights)

Terraform:
- `TF.SG.OPEN` – Security Group allows ingress from `0.0.0.0/0`
- `TF.S3.NO_ENCRYPTION` – S3 bucket without encryption block
- `TF.S3.NO_LOGGING` – S3 bucket missing access logging configuration
- `TF.IAM.WILDCARD` – IAM policy uses `*` principal or action
- `TF.ALB.NO_LOGGING` – Load balancer missing access logs
- `TF.CT.NO_CW_LOGGING` – CloudTrail not delivering logs to CloudWatch

Kubernetes:
- `K8S.RUNASROOT` – Container may run as root
- `K8S.PRIVILEGED` – Privileged container
- `K8S.HOSTPATH` – Pod uses HostPath volume
- `K8S.NO_LIMITS` – Missing resource limits/requests
- `K8S.NO_READONLY_ROOTFS` – Root filesystem not read-only
- `K8S.NO_NETWORKPOLICY` – No NetworkPolicy present in scan set

## SARIF Output

The SARIF document (`sarif` in response or downloaded from UI) enables integration with GitHub Advanced Security / code scanning. Each finding maps to a SARIF `result` with severity translated.

## Running Tests

```bash
pytest -q
```

Tests live in `tests/` and cover both secure and insecure sample IaC demonstrating rule triggers.

## Extending Rules

1. Add logic in `iac_audit/rules_tf.py` or `iac_audit/rules_k8s.py` (or extended modules under `backend/services/`).
2. Return dict objects with fields: `id`, `severity`, `title`, `file`, `resource`, `recommendation`.
3. Add sample insecure + secure fixtures in `tests/samples/`.
4. Add/adjust test cases in the pytest suite.

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `git add .` fails on `frontend/node_modules/.bin/*` | Trying to track generated npm shims on Windows | Added `.gitignore`; run `git rm -r --cached frontend/node_modules` then commit |
| TypeScript errors `@ljharb/tsconfig not found` | VSCode indexing dependency tsconfigs | Workspace `.vscode/settings.json` + `frontend/jsconfig.json` exclude `node_modules` |
| No findings shown in UI (previous bug) | Toast promise misuse returned numeric toast ID instead of JSON | Fixed `FileUpload` to await original scan promise |
| Empty SARIF | Upload contained only secure resources | Confirm with a known insecure sample (e.g. `pod-root.yaml`) |
| CORS warnings | Backend not running / wrong port | Ensure backend at `http://localhost:8000` (docker compose or manual) |

## Directory Overview

```
iac-audit-tool/
├── backend/                  # FastAPI app, API routes, services, models
├── iac_audit/                # Core parsing + rule engine + CLI + report formatting
├── frontend/                 # React/Vite UI
├── tests/                    # Pytest suite + samples (Terraform + K8s)
├── docker-compose.yml        # Dev orchestration
├── README.md
└── .gitignore
```

## Contributing

1. Fork & branch (`feat/<topic>`).
2. Add or update rules + tests.
3. Run `pytest` and manual scan via `/scan`.
4. Submit PR with description + sample output.

## Suggested Commit Message (for recent fixes)

```
feat: web UI + API scan improvements, SARIF export, debug metadata and rule extensions

Includes:
- Upload & severity filter UI
- Extended Terraform/K8s rules + global NetworkPolicy check
- SARIF generation + markdown export
- Debug discovery metadata, scan timing
- Fix frontend toast misuse returning numeric state
- Add .gitignore, jsconfig, VSCode settings to reduce noise
```

## License

This project is for educational and demonstration purposes. Add a license file (e.g. MIT) for broader distribution.

