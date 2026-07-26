import os

from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm

try:
    from app.tools.inventory_tools import (
        fetch_inventory,
        demand_forecast,
        warehouse_capacity,
        reorder_recommendation,
        supplier_recommendation,
        inventory_risk_score,
        inventory_summary
    )
    from app.core.adk_agent_runner import run_adk_agent
except ImportError:
    from tools.inventory_tools import (
        fetch_inventory,
        demand_forecast,
        warehouse_capacity,
        reorder_recommendation,
        supplier_recommendation,
        inventory_risk_score,
        inventory_summary
    )
    from core.adk_agent_runner import run_adk_agent

MODEL = os.getenv("MODEL")

class InventoryAgent:

    def __init__(self):
        self.name = "InventoryAgent"
        self.agent = LlmAgent(
            name="inventory_agent",
            model=LiteLlm(
                model=MODEL
            ),
            instruction="""
You are an Inventory Domain Agent.

You are responsible for analyzing inventory, warehouse utilization, demand forecasts, and supplier performance to manage warehouse stock levels and replenishment risks.

Analyze the task assigned by the Planner Agent. Use the provided tools natively to retrieve real data and metrics.

Once you have finished executing all necessary tools, output your final recommendation as a JSON block in this format:
{
    "agent_name": "InventoryAgent",
    "recommendation": "Clear inventory recommendation",
    "confidence": 0.95,
    "metrics": {
        "inventory": {},
        "forecast": {},
        "warehouse": {},
        "reorder": {},
        "supplier": {},
        "risk": {},
        "summary": {}
    }
}

Do not invent data. Use only the information available from the tools, task, and parameters.
""",
            tools=[
                fetch_inventory,
                demand_forecast,
                warehouse_capacity,
                reorder_recommendation,
                supplier_recommendation,
                inventory_risk_score,
                inventory_summary
            ]
        )

    async def run(self, task: str, parameters: dict, attempt: int = 1):
        return await run_adk_agent(
            agent=self.agent,
            agent_name=self.name,
            task=task,
            parameters=parameters,
            attempt=attempt
        )


inventory_agent = InventoryAgent()