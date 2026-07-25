from typing import List, Dict, Any

class PriorityEngine:
    @staticmethod
    def rank(recommendations: List[Dict[str, Any]], policies: Dict[str, Any]) -> List[Dict[str, Any]]:
        strategy = policies.get("priority_strategy", "inventory_first")
        
        # Define priority scores for each strategy (lower score = higher priority rank)
        if strategy == "inventory_first":
            agent_priority = {
                "InventoryAgent": 1,
                "LogisticsAgent": 2,
                "FinanceAgent": 3,
                "SalesAgent": 4
            }
        elif strategy == "finance_first":
            agent_priority = {
                "FinanceAgent": 1,
                "LogisticsAgent": 2,
                "SalesAgent": 3,
                "InventoryAgent": 4
            }
        elif strategy == "growth_first" or strategy == "sales_first":
            agent_priority = {
                "SalesAgent": 1,
                "InventoryAgent": 2,
                "FinanceAgent": 3,
                "LogisticsAgent": 4
            }
        else:
            # Sort by confidence descending
            return sorted(recommendations, key=lambda x: x["confidence"], reverse=True)

        def get_rank_key(rec):
            agent = rec.get("agent_name", "")
            # Return tuple (agent_priority, confidence_descending) so confidence acts as secondary sort
            priority = agent_priority.get(agent, 99)
            confidence = rec.get("confidence", 0.0)
            return (priority, -confidence)

        # Sort based on priority rankings
        ranked = sorted(recommendations, key=get_rank_key)
        for idx, rec in enumerate(ranked):
            rec["priority_rank"] = idx + 1
            
        return ranked
