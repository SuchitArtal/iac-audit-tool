from typing import List, Dict, Any
import datetime

SARIF_VERSION = "2.1.0"
TOOL_NAME = "IaC Security Auditing Tool"

SEVERITY_TO_LEVEL = {
    "CRITICAL": "error",
    "HIGH": "error",
    "MEDIUM": "warning",
    "LOW": "note",
}


def generate_sarif(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    results = []
    rules_index: Dict[str, Dict[str, Any]] = {}
    for f in findings:
        rule_id = f["id"]
        if rule_id not in rules_index:
            rules_index[rule_id] = {
                "id": rule_id,
                "name": f.get("title", rule_id),
                "shortDescription": {"text": f.get("title", rule_id)},
                "fullDescription": {"text": f.get("recommendation", "")},
                "help": {"text": f.get("recommendation", "")},
            }
        level = SEVERITY_TO_LEVEL.get(f.get("severity", "LOW"), "note")
        results.append({
            "ruleId": rule_id,
            "level": level,
            "message": {"text": f.get("title")},
            "properties": {
                "severity": f.get("severity"),
                "recommendation": f.get("recommendation"),
            },
            "locations": [
                {
                    "physicalLocation": {
                        "artifactLocation": {"uri": f.get("file")},
                        "region": {"startLine": 1},  # line info not parsed yet
                    },
                }
            ],
        })
    sarif = {
        "version": SARIF_VERSION,
        "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
        "runs": [
            {
                "tool": {
                    "driver": {
                        "name": TOOL_NAME,
                        "informationUri": "https://example.com/iac-audit",
                        "rules": list(rules_index.values()),
                    }
                },
                "results": results,
                "automationDetails": {"description": "IaC scan"},
                "invocation": {"executionSuccessful": True},
                "properties": {"generatedAt": datetime.datetime.utcnow().isoformat() + "Z"},
            }
        ],
    }
    return sarif
