import json
import uuid
from typing import Dict, Any

from agents.orchestrator import orchestrator


async def run_adk_orchestration(
    session_id: str,
    user_input: str,
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Run the three-tier parallel multi-agent orchestration:
    1. PlannerAgent creates execution plan
    2. Worker agents (Inventory, Logistics, Sales, Finance) execute in parallel
    3. ValidationAgent validates all worker outputs in parallel
    4. Retry failed workers (max 10 attempts each) with Planner corrections
    5. Return final aggregated JSON
    """
    return await orchestrator.run(
        user_input=user_input,
        parameters=parameters,
        session_id=session_id
    )