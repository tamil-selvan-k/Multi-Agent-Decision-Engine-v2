import os

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

MODEL = os.getenv("MODEL")

class LogisticsAgent:

    def __init__(self):
        self.name = "LogisticsAgent"
        self.agent = LlmAgent(
            name="logistics_agent",
            model=LiteLlm(
                model=MODEL
            ),
            instruction="""
You are a Logistics Domain Agent.

Your responsibility is to analyze logistics, supply-chain routing, transit times, transportation costs, and delivery delays.

Analyze the task assigned by the Planner Agent. Use the provided tools natively to retrieve real data and metrics.

CRITICAL TOOL CALLING FORMAT:
If you need to call a tool, you MUST format the call exactly like this:
<function=tool_name>{"arg_name": "value"}

Once you have finished executing all necessary tools, output your final recommendation as a JSON block in this format:
{
    "agent_name": "LogisticsAgent",
    "recommendation": "Clear logistics recommendation",
    "confidence": 0.95,
    "metrics": {
        "shipments": {},
        "routes": {},
        "eta": {},
        "warehouse_assignment": {},
        "transport_cost": {},
        "risk": {}
    }
}

Do not invent data. Use only the information available from the tools, task, and parameters.
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

    async def run(self, task: str, parameters: dict, attempt: int = 1):
        return await run_adk_agent(
            agent=self.agent,
            agent_name=self.name,
            task=task,
            parameters=parameters,
            attempt=attempt
        )


logistics_agent = LogisticsAgent()