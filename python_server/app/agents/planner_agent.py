import json
import uuid
from typing import Dict, Any

from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types


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
                model="groq/llama-3.3-70b-versatile"
            ),

            instruction="""
You are the Planner Agent in an Enterprise
Multi-Agent Decision System.

Your responsibility is to analyze the user's
business request and create an execution plan.

You must determine:

1. Which domain capabilities need to be invoked.
2. What exact task should be assigned to each capability.
3. What parameters should be passed to each capability.

Available Capabilities:

inventory:
- Analyzes inventory levels.
- Analyzes warehouse capacity.
- Optimizes inventory.
- Determines reorder requirements.

logistics:
- Analyzes shipments.
- Optimizes delivery routes.
- Calculates delivery ETA.
- Determines warehouse assignment.

sales:
- Analyzes sales data.
- Performs demand forecasting.
- Calculates growth.
- Recommends production levels.

finance:
- Analyzes budgets.
- Detects financial anomalies.
- Estimates costs.
- Analyzes budget impact.

Planning Rules:

- Only select capabilities relevant to the user's request.
- If multiple domains are involved, select multiple capabilities.
- The task must be specific and actionable.
- Pass relevant information from the user request
  through the parameters.
- Do not invent parameters that are not provided.
- Do not perform the domain analysis yourself.
- Your job is ONLY to create the execution plan.

Return ONLY valid JSON.

Required format:

{
    "required_capabilities": [
        {
            "capability": "inventory",
            "task": "Analyze current inventory and determine reorder requirements.",
            "parameters": {}
        }
    ]
}
"""
        )

        # ----------------------------------
        # ADK Session Service
        # ----------------------------------

        self.session_service = (
            InMemorySessionService()
        )

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
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:

        # ----------------------------------
        # Unique Session
        # ----------------------------------

        session_id = (
            f"planner-{uuid.uuid4().hex}"
        )

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

        prompt = f"""
USER REQUEST:

{user_input}


ADDITIONAL PARAMETERS:

{json.dumps(
    parameters,
    default=str,
    indent=2
)}


Create an execution plan for this request.

Determine:

1. Which capabilities should be invoked.
2. The exact task assigned to each capability.
3. The parameters passed to each capability.

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
        # Remove Markdown JSON Fences
        # ----------------------------------

        if final_text.startswith(
            "```json"
        ):

            final_text = final_text[
                len("```json"):
            ]

        elif final_text.startswith(
            "```"
        ):

            final_text = final_text[
                len("```"):
            ]

        if final_text.endswith(
            "```"
        ):

            final_text = final_text[
                :-len("```")
            ]

        final_text = final_text.strip()

        # ----------------------------------
        # Extract JSON from the response (in case of extra text)
        # ----------------------------------
        import re
        # Try to find a JSON object in the text
        json_match = re.search(r'\{.*\}', final_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            try:
                plan = json.loads(json_str)
            except json.JSONDecodeError as e:
                # Fallback: try to find the first { and last }
                start = final_text.find('{')
                end = final_text.rfind('}')
                if start != -1 and end != -1 and start < end:
                    json_str = final_text[start:end+1]
                    try:
                        plan = json.loads(json_str)
                    except json.JSONDecodeError as e2:
                        raise RuntimeError(
                            f"PlannerAgent returned invalid JSON (regex matched but json.loads failed, fallback also failed): {final_text}"
                        ) from e2
                else:
                    raise RuntimeError(
                        f"PlannerAgent returned invalid JSON (regex matched but no valid braces found): {final_text}"
                    )
        else:
            # If no braces found, it's not valid JSON
            raise RuntimeError(
                f"PlannerAgent returned invalid JSON (no braces found): {final_text}"
            )

        # ----------------------------------
        # Parse JSON (already done above, but we keep the structure for clarity)
        # ----------------------------------
        # Note: the parsing is done in the block above, so we skip the original try-except.

        # ----------------------------------
        # Validate Plan Structure
        # ----------------------------------

        if not isinstance(
            plan,
            dict
        ):

            raise RuntimeError(
                "PlannerAgent response "
                "must be a JSON object"
            )

        if "required_capabilities" not in plan:

            raise RuntimeError(
                "PlannerAgent response "
                "does not contain 'required_capabilities'"
            )

        # Validate each capability entry
        for cap_entry in plan["required_capabilities"]:
            if not isinstance(cap_entry, dict):
                raise RuntimeError(
                    "Each required_capability entry must be a dictionary"
                )
            required_keys = {"capability", "task", "parameters"}
            if not required_keys.issubset(cap_entry.keys()):
                missing = required_keys - cap_entry.keys()
                raise RuntimeError(
                    f"Missing required keys in capability entry: {missing}"
                )
            if not isinstance(cap_entry["capability"], str):
                raise RuntimeError("Capability must be a string")
            if not isinstance(cap_entry["task"], str):
                raise RuntimeError("Task must be a string")
            if not isinstance(cap_entry["parameters"], dict):
                raise RuntimeError("Parameters must be a dictionary")

        return plan