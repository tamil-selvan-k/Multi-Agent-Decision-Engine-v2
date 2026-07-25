import json
import uuid
from typing import Any, Dict

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types


def extract_and_parse_json(text: str, agent_name: str) -> Dict[str, Any]:
    """
    Extracts and parses a JSON object from text, handling markdown fences and surrounding explanation text.
    """
    if not text:
        raise RuntimeError(f"{agent_name} did not return a response")

    text_clean = text.strip()

    # 1. Try splitting on ```json ... ```
    if "```json" in text_clean:
        try:
            parts = text_clean.split("```json")
            if len(parts) > 1:
                subparts = parts[1].split("```")
                text_clean = subparts[0].strip()
        except Exception:
            pass
    # 2. Try splitting on ``` ... ``` if ```json is not there
    elif "```" in text_clean:
        try:
            parts = text_clean.split("```")
            if len(parts) > 1:
                subparts = parts[1].split("```")
                text_clean = subparts[0].strip()
        except Exception:
            pass

    # 3. Try to locate the JSON boundaries using { and }
    if not (text_clean.startswith("{") and text_clean.endswith("}")):
        start = text_clean.find("{")
        end = text_clean.rfind("}")
        if start != -1 and end != -1 and end > start:
            text_clean = text_clean[start:end+1].strip()

    try:
        return json.loads(text_clean)
    except json.JSONDecodeError as e:
        raise RuntimeError(
            f"{agent_name} returned invalid JSON: {text}"
        ) from e


async def run_adk_agent(
    agent,
    agent_name: str,
    task: str,
    parameters: Dict[str, Any],
    attempt: int = 1
) -> Dict[str, Any]:

    # ---------------------------------
    # Create ADK session service
    # ---------------------------------

    session_service = InMemorySessionService()

    # ---------------------------------
    # Create ADK Runner
    # ---------------------------------

    runner = Runner(
        agent=agent,
        app_name="enterprise_orchestrator",
        session_service=session_service
    )

    # Unique session per agent execution
    session_id = (
        f"{agent_name.lower()}-"
        f"{uuid.uuid4().hex}"
    )

    # ---------------------------------
    # Create ADK Session
    # ---------------------------------

    await session_service.create_session(
        app_name="enterprise_orchestrator",
        user_id="orchestrator",
        session_id=session_id
    )

    # ---------------------------------
    # Build Prompt
    # ---------------------------------

    retry_info = ""
    if attempt > 1:
        retry_info = f"""
RETRY ATTEMPT: {attempt}
Previous attempt failed validation. Please address the validation feedback in your analysis.
"""

    prompt = f"""
You are the {agent_name}.

You are executing a specific task assigned by the Planner Agent.

TASK:
{task}

PARAMETERS:
{json.dumps(parameters, default=str)}
{retry_info}
Execute the task using your available tools.

Analyze the tool results carefully.

Once you have finished executing all necessary tools, output your final recommendation as a JSON block in this exact format:

{{
    "agent_name": "{agent_name}",
    "status": "completed",
    "recommendation": "Your recommendation",
    "confidence": 0.0,
    "metrics": {{}},
    "task": "{task}",
    "attempt": {attempt}
}}

Rules:
- Do not invent data.
- Use the available tools when necessary.
- Base your recommendation on actual tool results.
- Confidence must be a number between 0.0 and 1.0.
- attempt field must match the provided attempt number.
"""

    # ---------------------------------
    # Create ADK Message
    # ---------------------------------

    content = types.Content(
        role="user",
        parts=[types.Part(text=prompt)]
    )

    # ---------------------------------
    # Run ADK Agent
    # ---------------------------------

    final_text = None

    async for event in runner.run_async(
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

    # ---------------------------------
    # Parse and Validate Response
    # ---------------------------------

    result = extract_and_parse_json(final_text, agent_name)

    # ---------------------------------
    # Return Standard Worker Result
    # ---------------------------------

    return {
        "agent_name": result.get("agent_name", agent_name),
        "status": result.get("status", "completed"),
        "recommendation": result.get("recommendation", ""),
        "confidence": float(result.get("confidence", 0.0)),
        "metrics": result.get("metrics", {}),
        "task": result.get("task", task),
        "attempt": result.get("attempt", attempt)
    }