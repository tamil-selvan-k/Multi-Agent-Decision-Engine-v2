import json
import uuid
from typing import Any, Dict, List, Optional

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from schemas.recommendation import AgentRecommendation
from app.core.agent_registry import AgentRegistry

# Import agent instances
from agents.inventory_agent import inventory_agent
from agents.sales_agent import sales_agent
from agents.finance_agent import finance_agent
from agents.logistics_agent import logistics_agent


# Initialize the agent registry and register agents
agent_registry = AgentRegistry()

# Register InventoryAgent
agent_registry.register(
    name="InventoryAgent",
    capabilities=["inventory"],
    description="Analyzes inventory levels, warehouse capacity, optimizes inventory, and determines reorder requirements.",
    agent_instance=inventory_agent
)

# Register SalesAgent
agent_registry.register(
    name="SalesAgent",
    capabilities=["sales"],
    description="Analyzes sales data, performs demand forecasting, calculates growth, and recommends production levels.",
    agent_instance=sales_agent
)

# Register FinanceAgent
agent_registry.register(
    name="FinanceAgent",
    capabilities=["finance"],
    description="Analyzes budgets, detects financial anomalies, estimates costs, and analyzes budget impact.",
    agent_instance=finance_agent
)

# Register LogisticsAgent
agent_registry.register(
    name="LogisticsAgent",
    capabilities=["logistics"],
    description="Analyzes shipments, optimizes delivery routes, calculates delivery ETA, and determines warehouse assignment.",
    agent_instance=logistics_agent
)


async def run_adk_agent(
    agent,
    agent_name: str,
    task: str,
    parameters: Dict[str, Any]
) -> AgentRecommendation:
    # ---------------------------------
    # Create ADK session service
    # ---------------------------------

    session_service = InMemorySessionService()

    # ---------------------------------
    # Create ADK Runner
    # ---------------------------------

    # Determine the actual agent to pass to Runner: if the provided agent has an 'agent' attribute (our wrapper), use that.
    # Otherwise, use the agent directly.
    actual_agent = getattr(agent, 'agent', agent)
    runner = Runner(
        agent=actual_agent,
        app_name="enterprise_orchestrator",
        session_service=session_service
    )

    # ---------------------------------
    # Unique session per agent execution
    # ---------------------------------

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

    prompt = f"""
You are the {agent_name}.

You are executing a specific task assigned
by the Planner Agent.

TASK:
{task}

PARAMETERS:
{json.dumps(parameters, default=str)}

Execute the task using your available tools.

Analyze the tool results carefully.

Once you have finished executing all necessary tools, output your final recommendation as a JSON block in this exact format:

{{
    "agent_name": "{agent_name}",
    "recommendation": "Your recommendation",
    "confidence": 0.0,
    "metrics": {{}}
}}

Rules:

- Do not invent data.
- Use the available tools when necessary.
- Base your recommendation on actual tool results.
- Confidence must be a number between 0.0 and 1.0.
"""

    # ---------------------------------
    # Create ADK Message
    # ---------------------------------

    content = types.Content(
        role="user",
        parts=[
            types.Part(
                text=prompt
            )
        ]
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
    # Validate Response
    # ---------------------------------

    if not final_text:

        raise RuntimeError(
            f"{agent_name} did not return "
            f"a response"
        )

    final_text = final_text.strip()

    # ---------------------------------
    # Remove Markdown JSON
    # ---------------------------------

    if final_text.startswith("```json"):

        final_text = final_text[
            len("```json"):
        ]

    elif final_text.startswith("```"):

        final_text = final_text[
            len("```"):
        ]

    if final_text.endswith("```"):

        final_text = final_text[
            :-len("```")
        ]

    final_text = final_text.strip()

    # ---------------------------------
    # Parse JSON
    # ---------------------------------

    try:

        result = json.loads(
            final_text
        )

    except json.JSONDecodeError as e:

        raise RuntimeError(
            f"{agent_name} returned invalid JSON: "
            f"{final_text}"
        ) from e

    # ---------------------------------
    # Return Standard Agent Result
    # ---------------------------------

    return AgentRecommendation(

        agent_name=result.get(
            "agent_name",
            agent_name
        ),

        recommendation=result.get(
            "recommendation",
            ""
        ),

        confidence=float(
            result.get(
                "confidence",
                0.0
            )
        ),

        metrics=result.get(
            "metrics",
            {}
        )
    )


async def run_adk_orchestration(
    session_id: str,
    user_input: str,
    parameters: Dict[str, Any]
) -> Any:
    # Import here to avoid circular import
    from app.agents.planner_agent import PlannerAgent
    from core.decision_engine import generate_decision
    from schemas.decision import EnterpriseDecision

    logger = None  # We'll get the logger later if needed, but for now we can skip logging to avoid import issues

    # Create Planner and Synthesizer instances
    planner_agent = PlannerAgent()

    # Import the logger from core.logging if needed
    try:
        from core.logging import logger
    except ImportError:
        import logging
        logger = logging.getLogger(__name__)

    logger.info(
        f"Starting orchestration for: {user_input}"
    )

    # 1. Planner decides which capabilities are needed
    plan = await planner_agent.plan(
        user_input=user_input,
        parameters=parameters
    )

    logger.info(
        f"Planner returned plan: {plan}"
    )

    # 2. Execute selected agents based on capabilities
    agent_outputs = []

    # The plan now contains a list of required capabilities
    required_capabilities = plan.get("required_capabilities", [])

    for cap_info in required_capabilities:
        capability = cap_info.get("capability")
        task = cap_info.get("task", "")
        cap_parameters = cap_info.get("parameters", {})

        if not capability:
            logger.warning(
                "Plan entry missing 'capability' field: %s", cap_info
            )
            continue

        # Resolve the capability to an agent instance
        agent_instance = agent_registry.get_agent_for_capability(capability)
        if agent_instance is None:
            logger.warning(
                f"No agent found for capability: {capability}"
            )
            continue

        # Get the agent name from the instance
        agent_name = agent_instance.name

        logger.info(
            f"Running {agent_name} for capability '{capability}'"
        )

        result = await run_adk_agent(
            agent=agent_instance,
            agent_name=agent_name,
            task=task,
            parameters=cap_parameters
        )

        agent_outputs.append(result)

    # 3. Enterprise Decision Engine
    return await generate_decision(
        session_id=session_id,
        agent_outputs=agent_outputs,
        original_request=user_input
    )