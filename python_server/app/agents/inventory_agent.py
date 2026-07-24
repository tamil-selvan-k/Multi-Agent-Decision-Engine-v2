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


class InventoryAgent:

    def __init__(self):
        self.name = "InventoryAgent"
        self.agent = LlmAgent(
            name="inventory_agent",
            model=LiteLlm(
                model="groq/llama-3.3-70b-versatile"
            ),
            instruction="""
You are an Inventory Domain Agent.

You are responsible for analyzing inventory, warehouse utilization, demand forecasts, and supplier performance to manage warehouse stock levels and replenishment risks.

Analyze the task assigned by the Planner Agent. Use the provided tools natively to retrieve real data and metrics.

CRITICAL TOOL CALLING FORMAT:
If you need to call a tool, you MUST format the call exactly like this:
<function=tool_name>{"arg_name": "value"}</function>
Never use any other format. Always close the opening tag with ">" and put the JSON arguments immediately after it. Do not use "=" after the function name in the tag.

Consider:
- Current stock vs safety stock
- Warehouse utilization & congestion risk
- Predicted demand vs current stock
- Reorder requirements (quantities & priorities)
- Supplier reliability & rating
- Risk scores & summary actions

Once you have finished executing all necessary tools, output your final recommendation as a JSON block in this format:
{
    "agent_name": "InventoryAgent",
    "recommendation": "Clear inventory recommendation",
    "confidence": 0.90,
    "metrics": {
        "inventory": {},
        "forecast": {},
        "capacity": {},
        "reorder_recommendation": {},
        "supplier_recommendation": {},
        "inventory_risk": {},
        "inventory_summary": {}
    }
}

Do not invent data. Use only information returned by the tools, the assigned task, and provided parameters.
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

    async def run(self, task: str, parameters: dict):
        return await run_adk_agent(
            agent=self.agent,
            agent_name=self.name,
            task=task,
            parameters=parameters
        )


inventory_agent = InventoryAgent()