
from typing import Dict, Any, List

def _finding(resource: Dict[str, Any], fid: str, severity: str, title: str, recommendation: str) -> Dict[str, Any]:
	return {
		"id": fid,
		"severity": severity,
		"title": title,
		"file": resource["file"],
		"resource": f'{resource["type"]}.{resource["name"]}',
		"recommendation": recommendation,
	}

def check_open_sg(resource: Dict[str, Any]) -> List[Dict[str, Any]]:
	"""
	Flags:
	  - aws_security_group with ingress cidr_blocks containing 0.0.0.0/0
	  - aws_security_group_rule (ingress) with 0.0.0.0/0
	"""
	findings: List[Dict[str, Any]] = []
	rtype = resource["type"]
	body = resource["body"]

	def cidr_list(rule: Dict[str, Any]) -> List[str]:
		cidrs = []
		v = rule.get("cidr_blocks", [])
		if isinstance(v, list):
			cidrs.extend(v)
		elif isinstance(v, str):
			cidrs.append(v)
		v6 = rule.get("ipv6_cidr_blocks", [])
		if isinstance(v6, list):
			cidrs.extend(v6)
		return cidrs

	if rtype == "aws_security_group":
		ing = body.get("ingress", [])
		if isinstance(ing, dict):
			ing = [ing]
		for rule in ing:
			if "0.0.0.0/0" in cidr_list(rule):
				findings.append(_finding(
					resource,
					"TF.SG.OPEN",
					"HIGH",
					"Security Group allows ingress from 0.0.0.0/0",
					"Restrict ingress CIDRs to known IP ranges or use load balancers/WAF."
				))
	elif rtype == "aws_security_group_rule":
		# explicit rule resources
		if (body.get("type") == "ingress") and ("0.0.0.0/0" in cidr_list(body)):
			findings.append(_finding(
				resource,
				"TF.SG.OPEN",
				"HIGH",
				"Security Group Rule allows ingress from 0.0.0.0/0",
				"Restrict ingress CIDRs to known IP ranges or use load balancers/WAF."
			))

	return findings

def run_tf_rules(resources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
	all_findings: List[Dict[str, Any]] = []
	for r in resources:
		all_findings.extend(check_open_sg(r))
	return all_findings
