from typing import List, Dict, Any

class ConflictDetector:
    @staticmethod
    def detect(recommendations: List[Dict[str, Any]], policies: Dict[str, Any]) -> List[Dict[str, Any]]:
        conflicts = []

        # Find individual recommendations by agent
        sales = next((r for r in recommendations if r["agent_name"] == "SalesAgent"), None)
        inventory = next((r for r in recommendations if r["agent_name"] == "InventoryAgent"), None)
        finance = next((r for r in recommendations if r["agent_name"] == "FinanceAgent"), None)
        logistics = next((r for r in recommendations if r["agent_name"] == "LogisticsAgent"), None)

        # 1. Budget Deviation Conflict
        # Parse proposed cost from logistics or inventory recommendations
        proposed_extra_cost = 0.0
        if logistics:
            metrics = logistics.get("metrics") or {}
            trans_cost = metrics.get("transport_cost") or {}
            # If transport cost is a dictionary or float
            cost_val = trans_cost.get("total_cost") or trans_cost.get("cost") or metrics.get("cost") or 0.0
            if isinstance(cost_val, (int, float)):
                proposed_extra_cost += cost_val

        if finance:
            metrics = finance.get("metrics") or {}
            budget_imp = metrics.get("budget_impact") or {}
            remaining_budget = budget_imp.get("remaining_budget", 1000000)
            if proposed_extra_cost > remaining_budget:
                conflicts.append({
                    "type": "Budget Exceeded Conflict",
                    "severity": "High",
                    "description": f"Proposed Logistics transportation cost (${proposed_extra_cost:,}) exceeds remaining Finance budget (${remaining_budget:,}).",
                    "involved_agents": ["LogisticsAgent", "FinanceAgent"]
                })

        # 2. Safety Stock vs Production Capacity Conflict
        if sales and inventory:
            sales_metrics = sales.get("metrics") or {}
            prod_recommendation = sales_metrics.get("production_recommendation") or {}
            # Proposed units to manufacture/order
            proposed_qty = prod_recommendation.get("quantity") or sales_metrics.get("forecast", {}).get("forecast") or 0.0

            inv_metrics = inventory.get("metrics") or {}
            capacity_data = inv_metrics.get("warehouse_capacity") or {}
            utilization = capacity_data.get("utilization", 0.0)
            
            # If warehouse is nearly full (> 95%) and sales requests more production
            if utilization > 95.0 and proposed_qty > 0:
                conflicts.append({
                    "type": "Capacity Overrun Conflict",
                    "severity": "Medium",
                    "description": f"Sales requests production/inventory expansion of {proposed_qty:,} units, but warehouse utilization is at {utilization}%.",
                    "involved_agents": ["SalesAgent", "InventoryAgent"]
                })

        # 3. Policy Constraints (e.g. freight cost limit limit policy)
        max_freight_limit = float(policies.get("max_freight_cost_limit", 5000))
        if proposed_extra_cost > max_freight_limit:
            conflicts.append({
                "type": "Policy Violation Conflict",
                "severity": "High",
                "description": f"Proposed extra shipment cost of ${proposed_extra_cost:,} exceeds the corporate policy limit of ${max_freight_limit:,}.",
                "involved_agents": ["LogisticsAgent"]
            })

        return conflicts
