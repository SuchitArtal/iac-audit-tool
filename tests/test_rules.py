# test_rules.py
# Unit tests for IaC security rules

from pathlib import Path

from backend.services.scanner import scan_directory

BASE = Path(__file__).resolve().parent


def findings_ids(report):
	return {f.id for f in report.findings}


def scan(rel):
	return scan_directory(BASE / rel)


def test_tf_open_sg():
	r = scan("samples/terraform")
	ids = findings_ids(r)
	assert "TF.SG.OPEN" in ids


def test_k8s_run_as_root():
	r = scan("samples/k8s")
	ids = findings_ids(r)
	assert "K8S.RUNASROOT" in ids


def test_extended_tf_rules_present():
	r = scan("samples/terraform")
	ids = findings_ids(r)
	assert "TF.S3.NO_ENCRYPTION" in ids
	assert "TF.IAM.WILDCARD" in ids
	assert ("TF.CT.NO_CW_LOGGING" in ids) or ("TF.ALB.NO_LOGGING" in ids)


def test_secure_samples_zero_findings():
	r = scan("samples/secure")
	assert r.count == 0, f"Expected 0 findings, got {r.count}: {[f.id for f in r.findings]}"


def test_pack_has_mixture():
	r = scan("samples/pack")
	assert r.count >= 5
	assert any(f.id.startswith("TF.") for f in r.findings)

