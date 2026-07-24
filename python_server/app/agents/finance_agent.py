import os

from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm

try:
    from app.tools.finance_tools import (
        fetch_budget,
        anomaly_detection,
        cost_estimator,
        budget_impact,
        calculate_roi,
        financial_risk_score
    )
    from app.core.adk_agent_runner import run_adk_agent
except ImportError:
    from tools.finance_tools import (
        fetch_budget,
        anomaly_detection,
        cost_estimator,
        budget_impact,
        calculate_roi,
        financial_risk_score
    )
    from core.adk_agent_runner import run_adk_agent

MODEL = os.getenv("MODEL")

class FinanceAgent:

    def __init__(self):
        self.name = "FinanceAgent"
        self.agent = LlmAgent(
            name="finance_agent",
            model=LiteLlm(
                model=MODEL
            ),
            instruction="""
You are a Finance Domain Agent.

You are responsible for analyzing financial aspects of business decisions, auditing operating budgets, predicting costs, analyzing ROI, and evaluating financial risks.

Analyze the task assigned by the Planner Agent. Use the provided tools natively to retrieve real data and metrics.

CRITICAL TOOL CALLING FORMAT:
If you need to call a tool, you MUST format the call exactly like this:
<function=tool_name>{"arg_name": "value"}</function>
Never use any other format. Always close the opening tag with ">" and put the JSON arguments immediately after it. Do not use "=" after the function name in the tag.

Once you have finished executing all necessary tools, output your final recommendation as a JSON block in this format:
{
    "agent_name": "FinanceAgent",
    "recommendation": "Clear finance recommendation",
    "confidence": 0.95,
    "metrics": {
        "budget": {},
        "anomaly": {},
        "cost_prediction": {},
        "budget_impact": {},
        "roi": {},
        "financial_risk": {}
    }
}

Do not invent data. Use only the information available from the tools, task, and parameters.
""",
            tools=[
                fetch_budget,
                anomaly_detection,
                cost_estimator,
                budget_impact,
                calculate_roi,
                financial_risk_score
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


finance_agent = FinanceAgent()