import json
import os
import uuid
from typing import Dict, Any, Optional

from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

try:
    from app.core.adk_agent_runner import extract_and_parse_json
except ImportError:
    from core.adk_agent_runner import extract_and_parse_json

MODEL = os.getenv("MODEL")

class PlannerAgent:

    def __init__(self):

        self.name = "PlannerAgent"

        # ----------------------------------
        # ADK Planner Agent
        # ----------------------------------

        self.agent = LlmAgent(

            name="planner_agent",

            # Groq through LiteLLM
            model=LiteLlm(
                model=MODEL
            ),

            instruction="""
You are the Planner Agent in an Enterprise Multi-Agent Decision System.

Your responsibility is to analyze the user's business request and create an execution plan.

You must determine:
1. Which domain agents need to be invoked.
2. What exact task should be assigned to each agent.
3. What parameters should be passed to each agent.

You also must be able to receive a failed validation result and generate a corrected task assignment for the specific failed worker.

Available Agents:

InventoryAgent:
- Analyzes inventory levels.
- Analyzes warehouse capacity.
- Optimizes inventory.
- Determines reorder requirements.

LogisticsAgent:
- Analyzes shipments.
- Optimizes delivery routes.
- Calculates delivery ETA.
- Determines warehouse assignment.

SalesAgent:
- Analyzes sales data.
- Performs demand forecasting.
- Calculates growth.
- Recommends production levels.

FinanceAgent:
- Analyzes budgets.
- Detects financial anomalies.
- Estimates costs.
- Analyzes budget impact.

Planning Rules:
- Only select agents relevant to the user's request.
- If multiple domains are involved, select multiple agents.
- The task must be specific and actionable.
- Pass relevant information from the user request through the parameters.
- Do not invent parameters that are not provided.
- Do not perform the domain analysis yourself.
- Your job is ONLY to create the execution plan.

When generating a RETRY task for a failed worker:
- You receive the original task, previous output, validation feedback, and attempt number.
- Generate a CORRECTED task that addresses the validation issues.
- Include "retry": true and "attempt": N in parameters.

Return ONLY valid JSON.

Required format for INITIAL PLAN:
{
    "agents": [
        {
            "agent_name": "InventoryAgent",
            "task": "Analyze current inventory and determine reorder requirements.",
            "parameters": {}
        }
    ]
}

Required format for RETRY TASK:
{
    "agent_name": "InventoryAgent",
    "task": "Re-analyze inventory including warehouse capacity and reorder requirements. Ensure both metrics are explicitly included.",
    "parameters": {
        "retry": true,
        "attempt": 2
    }
}
"""
        )

        # ----------------------------------
        # ADK Session Service
        # ----------------------------------

        self.session_service = InMemorySessionService()

        # ----------------------------------
        # ADK Runner
        # ----------------------------------

        self.runner = Runner(

            agent=self.agent,

            app_name="enterprise_orchestrator",

            session_service=self.session_service
        )

    async def plan(
        self,
        user_input: str,
        parameters: Dict[str, Any],
        retry_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:

        # ----------------------------------
        # Unique Session
        # ----------------------------------

        session_id = f"planner-{uuid.uuid4().hex}"

        # ----------------------------------
        # Create ADK Session
        # ----------------------------------

        await self.session_service.create_session(

            app_name="enterprise_orchestrator",

            user_id="orchestrator",

            session_id=session_id
        )

        # ----------------------------------
        # Build Planner Prompt
        # ----------------------------------

        if retry_info:
            # Retry mode - generate corrected task for specific failed agent
            prompt = f"""
ORIGINAL USER REQUEST:
{user_input}

ADDITIONAL PARAMETERS:
{json.dumps(parameters, default=str, indent=2)}

RETRY CONTEXT - Previous validation failed for this agent:
- Agent: {retry_info.get('agent_name')}
- Original Task: {retry_info.get('original_task')}
- Parameters: {json.dumps(retry_info.get('parameters', {}), default=str, indent=2)}
- Previous Output: {json.dumps(retry_info.get('previous_output', {}), default=str, indent=2)}
- Validation Result: {json.dumps(retry_info.get('validation_result', {}), default=str, indent=2)}
- Attempt: {retry_info.get('attempt', 2)}

The validation failed with these issues:
{chr(10).join(f"- {issue}" for issue in retry_info.get('validation_result', {}).get('issues', []))}

Missing requirements:
{chr(10).join(f"- {req}" for req in retry_info.get('validation_result', {}).get('missing_requirements', []))}

Generate a CORRECTED task for this specific agent that addresses all validation failures.
Return ONLY the retry task JSON (not the full plan).
"""
        else:
            # Initial planning mode
            prompt = f"""
USER REQUEST:
{user_input}

ADDITIONAL PARAMETERS:
{json.dumps(parameters, default=str, indent=2)}

Create an execution plan for this request.

Determine:
1. Which agents should be invoked.
2. The exact task assigned to each agent.
3. The parameters passed to each agent.

Return ONLY valid JSON.
"""

        # ----------------------------------
        # ADK Message
        # ----------------------------------

        content = types.Content(

            role="user",

            parts=[
                types.Part(
                    text=prompt
                )
            ]
        )

        # ----------------------------------
        # Run Planner Agent
        # ----------------------------------

        final_text = None

        async for event in self.runner.run_async(

            user_id="orchestrator",

            session_id=session_id,

            new_message=content
        ):

            if event.is_final_response():

                if (
                    event.content
                    and event.content.parts
                ):

                    final_text = (
                        event.content.parts[0].text
                    )

        # ----------------------------------
        # Validate Response
        # ----------------------------------

        if not final_text:

            raise RuntimeError(
                "PlannerAgent did not return "
                "a final response"
            )

        final_text = final_text.strip()

        # ----------------------------------
        # Parse and Validate Response
        # ----------------------------------

        plan = extract_and_parse_json(final_text, "PlannerAgent")

        # ----------------------------------
        # Validate Plan Structure
        # ----------------------------------

        if not isinstance(plan, dict):

            raise RuntimeError(
                "PlannerAgent response "
                "must be a JSON object"
            )

        if retry_info:
            # Retry task - expect single agent task object
            if "agent_name" not in plan or "task" not in plan:
                raise RuntimeError(
                    "Retry task must contain 'agent_name' and 'task'"
                )
            return plan
        else:
            # Initial plan - expect agents array
            if "agents" not in plan:

                raise RuntimeError(
                    "PlannerAgent response "
                    "does not contain 'agents'"
                )

            return plan


planner_agent = PlannerAgent()