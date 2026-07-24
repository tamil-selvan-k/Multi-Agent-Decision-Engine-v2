from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm

try:
    from app.tools.sales_tools import (
        fetch_sales_data,
        forecast_demand,
        calculate_growth,
        revenue_analysis,
        top_selling_products,
        recommend_production
    )
    from app.core.adk_agent_runner import run_adk_agent
except ImportError:
    from tools.sales_tools import (
        fetch_sales_data,
        forecast_demand,
        calculate_growth,
        revenue_analysis,
        top_selling_products,
        recommend_production
    )
    from core.adk_agent_runner import run_adk_agent


class SalesAgent:

    def __init__(self):
        self.name = "SalesAgent"
        self.agent = LlmAgent(
            name="sales_agent",
            model=LiteLlm(
                model="groq/llama-3.3-70b-versatile"
            ),
            instruction="""
You are a Sales Domain Agent.

You are responsible for analyzing sales, demand forecasting, business growth, revenue, top products, and production requirements.

Analyze the task assigned by the Planner Agent. Use the provided tools natively to retrieve real data and metrics.

CRITICAL TOOL CALLING FORMAT:
If you need to call a tool, you MUST format the call exactly like this:
<function=tool_name>{"arg_name": "value"}</function>
Never use any other format. Always close the opening tag with ">" and put the JSON arguments immediately after it. Do not use "=" after the function name in the tag.

Consider:
- Current sales
- Demand forecast
- Forecast confidence
- Sales growth
- Revenue details
- Top selling products
- Production requirements

Once you have finished executing all necessary tools, output your final recommendation as a JSON block in this format:
{
    "agent_name": "SalesAgent",
    "recommendation": "Clear sales recommendation",
    "confidence": 0.90,
    "metrics": {
        "sales_data": {},
        "forecast": {},
        "growth": {},
        "revenue": {},
        "top_selling_product": {},
        "production_recommendation": {}
    }
}

Do not invent data. Use only information returned by the tools, the assigned task, and provided parameters.
""",
            tools=[
                fetch_sales_data,
                forecast_demand,
                calculate_growth,
                revenue_analysis,
                top_selling_products,
                recommend_production
            ]
        )

    async def run(self, task: str, parameters: dict):
        return await run_adk_agent(
            agent=self.agent,
            agent_name=self.name,
            task=task,
            parameters=parameters
        )


sales_agent = SalesAgent()