from typing import Dict, Any

from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm

try:
    from app.tools.logistics_tools import (
        fetch_shipments,
        warehouse_assignment,
        optimize_routes,
        delivery_eta,
        calculate_transport_cost,
        delivery_risk_analysis
    )
    from app.core.adk_agent_runner import run_adk_agent
except ImportError:
    from tools.logistics_tools import (
        fetch_shipments,
        warehouse_assignment,
        optimize_routes,
        delivery_eta,
        calculate_transport_cost,
        delivery_risk_analysis
    )
    from core.adk_agent_runner import run_adk_agent


class LogisticsAgent:

    def __init__(self):
        self.name = "LogisticsAgent"
        self.agent = LlmAgent(
            name="logistics_agent",
            model=LiteLlm(
                model="groq/llama-3.3-70b-versatile"
            ),
            instruction="""
You are a Logistics Domain Agent.

Your responsibility is to analyze logistics, supply-chain routing, transit times, transportation costs, and delivery delays.

Analyze the task assigned by the Planner Agent. Use the provided tools natively to retrieve real data and metrics.

CRITICAL TOOL CALLING FORMAT:
If you need to call a tool, you MUST format the call exactly like this:
<function=tool_name>{"arg_name": "value"}</function>
Never use any other format. Always close the opening tag with ">" and put the JSON arguments immediately after it. Do not use "=" after the function name in the tag.

Consider:
- Active shipments and their statuses
- Warehouse assignment recommendations
- Best delivery route list & total distance in km
- Estimated delivery times & delay risk probability
- Transport costs (average and total)
- Delivery risk scores & levels

Once you have finished executing all necessary tools, output your final recommendation as a JSON block in this format:
{
    "agent_name": "LogisticsAgent",
    "recommendation": "Clear logistics recommendation",
    "confidence": 0.90,
    "metrics": {
        "shipments": {},
        "warehouse_assignment": {},
        "routes": {},
        "eta": {},
        "transport_cost": {},
        "delivery_risk": {}
    }
}

Do not invent data. Use only information returned by the tools, the assigned task, and provided parameters.
""",
            tools=[
                fetch_shipments,
                warehouse_assignment,
                optimize_routes,
                delivery_eta,
                calculate_transport_cost,
                delivery_risk_analysis
            ]
        )

    async def run(self, task: str, parameters: Dict[str, Any]):
        return await run_adk_agent(
            agent=self.agent,
            agent_name=self.name,
            task=task,
            parameters=parameters
        )


logistics_agent = LogisticsAgent()