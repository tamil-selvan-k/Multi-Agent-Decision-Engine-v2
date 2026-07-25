from typing import Dict, Any

class Explainability:
    @staticmethod
    def generate_report(consensus_data: Dict[str, Any], rules_applied: list) -> Dict[str, Any]:
        # Ensure all required keys exist and provide default values
        report = {
            "overall_situation": consensus_data.get("overall_situation") or "Situation summary not provided.",
            "key_findings": consensus_data.get("key_findings") or [],
            "recommendation": consensus_data.get("recommended_action") or consensus_data.get("recommendation") or "Action plan not defined.",
            "confidence": float(consensus_data.get("confidence") or 0.90),
            "reasoning": consensus_data.get("reasoning") or "Consensus reasoning not specified.",
            "risks": consensus_data.get("risks") or [],
            "tradeoffs": consensus_data.get("tradeoffs") or [],
            "affected_departments": consensus_data.get("affected_departments") or [],
            "business_impact": consensus_data.get("business_impact") or "Impact details not specified.",
            "policies_applied": consensus_data.get("policies_applied") or []
        }

        # Enrich policies applied with details from the rules engine
        if rules_applied:
            # Flatten rules into the policies list if not already present
            for rule in rules_applied:
                if rule not in report["policies_applied"]:
                    report["policies_applied"].append(rule)

        return report
