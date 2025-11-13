from typing import Dict, Any, List


def _finding(resource: Dict[str, Any], fid: str, severity: str, title: str, recommendation: str) -> Dict[str, Any]:
    return {
        "id": fid,
        "severity": severity,
        "title": title,
        "file": resource.get("file", "<unknown>"),
        "resource": f'{resource.get("type")}.{resource.get("name")}',
        "recommendation": recommendation,
    }


def _as_list(val):
    if val is None:
        return []
    if isinstance(val, list):
        return val
    return [val]


def check_s3_encryption(resource: Dict[str, Any]) -> List[Dict[str, Any]]:
    findings: List[Dict[str, Any]] = []
    if resource.get("type") == "aws_s3_bucket":
        body = resource.get("body", {}) or {}
        sse = body.get("server_side_encryption_configuration")
        # Different TF providers have varying shapes; minimal presence check
        if not sse:
            findings.append(_finding(
                resource,
                "TF.S3.NO_ENCRYPTION",
                "HIGH",
                "S3 bucket does not enforce server-side encryption",
                "Add server_side_encryption_configuration with SSE-S3 or SSE-KMS."
            ))
    return findings


def check_iam_wildcards(resource: Dict[str, Any]) -> List[Dict[str, Any]]:
    findings: List[Dict[str, Any]] = []
    rtype = resource.get("type")
    if rtype in {"aws_iam_policy", "aws_iam_role_policy"}:
        body = resource.get("body", {}) or {}
        policy = body.get("policy")
        # If policy is string, quick heuristic
        if isinstance(policy, str):
            if "\"*\"" in policy or ":\"*\"" in policy:
                findings.append(_finding(
                    resource,
                    "TF.IAM.WILDCARD",
                    "HIGH",
                    "IAM policy appears to allow wildcard actions or resources",
                    "Restrict actions and resources to least-privilege; avoid '*'."
                ))
        # If dict-like policy_document
        if isinstance(policy, dict):
            stmts = _as_list(policy.get("Statement"))
            for st in stmts:
                act = st.get("Action")
                res = st.get("Resource")
                if act == "*" or res == "*" or (isinstance(act, list) and "*" in act) or (isinstance(res, list) and "*" in res):
                    findings.append(_finding(
                        resource,
                        "TF.IAM.WILDCARD",
                        "HIGH",
                        "IAM policy uses wildcard in Action or Resource",
                        "Replace '*' with specific actions/resources."
                    ))
    return findings


 


def check_missing_logging(resource: Dict[str, Any]) -> List[Dict[str, Any]]:
    findings: List[Dict[str, Any]] = []
    rtype = resource.get("type")
    body = resource.get("body", {}) or {}

    if rtype in {"aws_lb", "aws_alb"}:
        al = body.get("access_logs")
        if not al:
            findings.append(_finding(
                resource,
                "TF.ALB.NO_LOGGING",
                "MEDIUM",
                "ALB has no access logging configured",
                "Configure access_logs with S3 bucket and prefix."
            ))
    elif rtype == "aws_s3_bucket":
        s3log = body.get("logging")
        if not s3log:
            findings.append(_finding(
                resource,
                "TF.S3.NO_LOGGING",
                "LOW",
                "S3 bucket does not have access logging enabled",
                "Enable S3 server access logging to a dedicated bucket."
            ))
    elif rtype == "aws_cloudtrail":
        # Basic check for CloudWatch logs integration
        if not body.get("cloud_watch_logs_group_arn") or not body.get("cloud_watch_logs_role_arn"):
            findings.append(_finding(
                resource,
                "TF.CT.NO_CW_LOGGING",
                "MEDIUM",
                "CloudTrail is not integrated with CloudWatch Logs",
                "Set cloud_watch_logs_group_arn and cloud_watch_logs_role_arn for CloudTrail."
            ))
    return findings


def run_tf_extra_rules(resources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    all_findings: List[Dict[str, Any]] = []
    for r in resources:
        all_findings.extend(check_s3_encryption(r))
        all_findings.extend(check_iam_wildcards(r))
        all_findings.extend(check_missing_logging(r))
    return all_findings
