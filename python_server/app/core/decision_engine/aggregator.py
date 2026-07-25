from typing import List, Dict, Any, Union
from schemas.recommendation import AgentRecommendation

class Aggregator:
    @staticmethod
    def normalize(agent_outputs: List[Union[Dict[str, Any], AgentRecommendation]]) -> List[Dict[str, Any]]:
        normalized = []
        for out in agent_outputs:
            if isinstance(out, AgentRecommendation):
                data = {
                    "agent_name": out.agent_name,
                    "recommendation": out.recommendation,
                    "confidence": out.confidence,
                    "metrics": out.metrics or {}
                }
            elif isinstance(out, dict):
                data = {
                    "agent_name": out.get("agent_name", "UnknownAgent"),
                    "recommendation": out.get("recommendation", ""),
                    "confidence": float(out.get("confidence", 0.0)),
                    "metrics": out.get("metrics") or {}
                }
            else:
                data = {
                    "agent_name": getattr(out, "agent_name", "UnknownAgent"),
                    "recommendation": getattr(out, "recommendation", ""),
                    "confidence": float(getattr(out, "confidence", 0.0)),
                    "metrics": getattr(out, "metrics", {}) or {}
                }
            normalized.append(data)
        return normalized
