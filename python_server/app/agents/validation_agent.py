import json
import os
import uuid
from typing import Dict, Any

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

class ValidationAgent:

    def __init__(self):

        self.name = "ValidationAgent"

        # ----------------------------------
        # ADK Validation Agent
        # ----------------------------------

        self.agent = LlmAgent(

            name="validation_agent",

            # Groq through LiteLLM
            model=LiteLlm(
                model=MODEL
            ),

            instruction="""
You are a Validation Agent in an Enterprise Multi-Agent Decision System.

Your responsibility is to VALIDATE whether a worker agent's output correctly satisfies:
1. The original user request.
2. The Planner's assigned task.
3. The assigned parameters.
4. Required domain-specific metrics.
5. Correct usage of available tool results.
6. Output completeness.
7. Internal consistency.
8. No hallucinated or invented data.
9. Valid recommendation.
10. Confidence value between 0.0 and 1.0.

You do NOT redo the domain task. You only EVALUATE the worker's output.

For each worker, you receive:
- The original user request
- The Planner's assigned task
- The assigned parameters
- The worker's output (including metrics, recommendation, confidence)

Return ONLY valid JSON in this format:

For VALID output:
{
    "agent_name": "InventoryAgent",
    "valid": true,
    "score": 0.95,
    "issues": [],
    "missing_requirements": [],
    "feedback": "The worker correctly analyzed inventory, capacity, optimization and reorder requirements."
}

For INVALID output:
{
    "agent_name": "InventoryAgent",
    "valid": false,
    "score": 0.55,
    "issues": [
        "Warehouse capacity was not analyzed",
        "Reorder recommendation is missing"
    ],
    "missing_requirements": [
        "warehouse_capacity",
        "reorder_recommendation"
    ],
    "feedback": "The worker must rerun the inventory analysis and explicitly include warehouse capacity and reorder recommendation."
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

    async def validate(
        self,
        user_input: str,
        plan_task: Dict[str, Any],
        worker_output: Dict[str, Any]
    ) -> Dict[str, Any]:

        # ----------------------------------
        # Unique Session
        # ----------------------------------

        session_id = f"validation-{uuid.uuid4().hex}"

        # ----------------------------------
        # Create ADK Session
        # ----------------------------------

        await self.session_service.create_session(

            app_name="enterprise_orchestrator",

            user_id="orchestrator",

            session_id=session_id
        )

        # ----------------------------------
        # Build Validation Prompt
        # ----------------------------------

        prompt = f"""
ORIGINAL USER REQUEST:
{user_input}

PLANNER ASSIGNED TASK:
Agent: {plan_task.get('agent_name', 'Unknown')}
Task: {plan_task.get('task', '')}
Parameters: {json.dumps(plan_task.get('parameters', {}), default=str, indent=2)}

WORKER OUTPUT:
{json.dumps(worker_output, default=str, indent=2)}

Validate the worker output against the original request, assigned task, and parameters.
Check all 10 validation criteria. Return ONLY valid JSON.
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
        # Run Validation Agent
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
                "ValidationAgent did not return "
                "a final response"
            )

        final_text = final_text.strip()

        # ----------------------------------
        # Parse and Validate Response
        # ----------------------------------

        validation = extract_and_parse_json(final_text, "ValidationAgent")

        return validation


validation_agent = ValidationAgent()