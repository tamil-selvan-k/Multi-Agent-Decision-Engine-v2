from typing import List, Dict, Any

class RuleEngine:
    @staticmethod
    def apply_rules(recommendations: List[Dict[str, Any]], policies: Dict[str, Any]) -> List[Dict[str, Any]]:
        processed_recommendations = []
        min_confidence = float(policies.get("min_agent_confidence", 0.70))
        safety_buffer = float(policies.get("safety_stock_buffer", 500))
        max_deviation = float(policies.get("max_budget_deviation", 0.10))

        for rec in recommendations:
            mod_rec = rec.copy()
            rules_triggered = []

            # Rule 1: Minimum Confidence Check
            if mod_rec["confidence"] < min_confidence:
                rules_triggered.append(f"Confidence is below corporate threshold of {min_confidence * 100}%. Flagged for manual audit.")
                mod_rec["flagged_audit"] = True

            # Rule 2: Safety Stock Enforcement
            if mod_rec["agent_name"] == "InventoryAgent":
                metrics = mod_rec.get("metrics") or {}
                current_stock = metrics.get("inventory_data", {}).get("current_stock") or metrics.get("current_stock") or 0
                if current_stock < safety_buffer:
                    rules_triggered.append(f"Enforced Safety Stock Rule: Current inventory level ({current_stock}) is below safety buffer ({safety_buffer}). Auto-initiating emergency procurement order.")
                    mod_rec["emergency_reorder"] = True

            # Rule 3: Budget Overage Threshold
            if mod_rec["agent_name"] == "FinanceAgent":
                metrics = mod_rec.get("metrics") or {}
                budget_imp = metrics.get("budget_impact") or {}
                # Calculate deviation if budget exceeding is true
                if budget_imp.get("budget_exceeded"):
                    rules_triggered.append(f"Enforced Budget Constraint Rule: Financial spending exceeds target limits by more than {max_deviation * 100}%.")
                    mod_rec["requires_vp_signoff"] = True

            if rules_triggered:
                mod_rec["rules_applied"] = rules_triggered
                # Append to original recommendation text for visibility
                mod_rec["recommendation"] = f"{mod_rec['recommendation']} (Applied Rules: {'; '.join(rules_triggered)})"
            
            processed_recommendations.append(mod_rec)

        return processed_recommendations
