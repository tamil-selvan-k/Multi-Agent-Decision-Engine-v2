import asyncio
import json
import os
import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.agents.planner_agent import PlannerAgent
from app.agents.validation_agent import validation_agent
from app.agents.registry import AGENT_REGISTRY
from app.core.adk_agent_runner import run_adk_agent

logger = logging.getLogger(__name__)

MAX_ATTEMPTS = 10
MODEL = os.getenv("MODEL")

class Orchestrator:

    def __init__(self):
        self.planner = PlannerAgent()

    async def run(
        self,
        user_input: str,
        parameters: Dict[str, Any],
        session_id: str
    ) -> Dict[str, Any]:

        logger.info(f"Starting orchestration for session: {session_id}")

        # ------------------------------------
        # STEP 1: Planner Agent - Create Execution Plan
        # ------------------------------------
        plan = await self.planner.plan(
            user_input=user_input,
            parameters=parameters
        )

        logger.info(f"Planner created plan with {len(plan.get('agents', []))} agents")

        # Track attempts per agent
        attempts: Dict[str, int] = {}
        for agent_plan in plan.get("agents", []):
            agent_name = agent_plan.get("agent_name")
            if agent_name:
                attempts[agent_name] = 1

        # Store final results
        final_results: Dict[str, Dict[str, Any]] = {}
        completed_agents: set = set()

        # Track the active tasks/parameters for retries
        plan_agents = plan.get("agents", [])

        # ------------------------------------
        # MAIN ORCHESTRATION LOOP
        # ------------------------------------
        while True:
            # Determine which agents need to run (not yet validated successfully)
            agents_to_run = []
            for agent_plan in plan_agents:
                agent_name = agent_plan.get("agent_name")
                if agent_name and agent_name not in completed_agents:
                    agents_to_run.append(agent_plan)

            if not agents_to_run:
                # All agents completed successfully or reached max attempts
                break

            # ------------------------------------
            # STEP 2: Execute Workers in PARALLEL
            # ------------------------------------
            logger.info(f"Executing {len(agents_to_run)} workers in parallel")

            worker_tasks = []
            for agent_plan in agents_to_run:
                agent_name = agent_plan.get("agent_name")
                task = agent_plan.get("task", "")
                agent_parameters = agent_plan.get("parameters", {})

                # Merge with global parameters
                merged_params = {**parameters, **agent_parameters}
                merged_params["retry"] = attempts.get(agent_name, 1) > 1
                merged_params["attempt"] = attempts.get(agent_name, 1)

                agent = AGENT_REGISTRY.get(agent_name)
                if not agent:
                    logger.error(f"Agent not found in registry: {agent_name}")
                    # Construct dummy failed task to handle error gracefully
                    async def dummy_fail():
                        raise RuntimeError(f"Agent {agent_name} not found in registry")
                    worker_tasks.append(dummy_fail())
                    continue

                # Create task for parallel execution
                worker_tasks.append(self._run_worker(
                    agent=agent,
                    agent_name=agent_name,
                    task=task,
                    parameters=merged_params,
                    attempt=attempts.get(agent_name, 1)
                ))

            # Run all workers concurrently
            worker_results = await asyncio.gather(*worker_tasks, return_exceptions=True)

            # Process results
            worker_outputs = {}
            for i, result in enumerate(worker_results):
                agent_name = agents_to_run[i].get("agent_name")
                if isinstance(result, Exception):
                    logger.error(f"{agent_name} failed with error: {result}")
                    worker_outputs[agent_name] = {
                        "agent_name": agent_name,
                        "status": "error",
                        "recommendation": "",
                        "confidence": 0.0,
                        "metrics": {},
                        "task": agents_to_run[i].get("task", ""),
                        "attempt": attempts.get(agent_name, 1),
                        "error": str(result)
                    }
                else:
                    worker_outputs[agent_name] = result

            # ------------------------------------
            # STEP 3: Validate Workers in PARALLEL
            # ------------------------------------
            logger.info(f"Validating {len(worker_outputs)} workers in parallel")

            validation_tasks = []
            # We want to maintain order of agents being validated
            validated_agent_names = list(worker_outputs.keys())
            for agent_name in validated_agent_names:
                worker_output = worker_outputs[agent_name]
                # Find the current plan task for this agent
                plan_task = next(
                    (ap for ap in plan_agents if ap.get("agent_name") == agent_name),
                    {}
                )
                validation_tasks.append(
                    validation_agent.validate(
                        user_input=user_input,
                        plan_task=plan_task,
                        worker_output=worker_output
                    )
                )

            validation_results = await asyncio.gather(*validation_tasks, return_exceptions=True)

            # Process validation results
            validation_outputs = {}
            for i, result in enumerate(validation_results):
                agent_name = validated_agent_names[i]
                if isinstance(result, Exception):
                    logger.error(f"Validation failed for {agent_name}: {result}")
                    validation_outputs[agent_name] = {
                        "agent_name": agent_name,
                        "valid": False,
                        "score": 0.0,
                        "issues": [f"Validation exception: {result}"],
                        "missing_requirements": [],
                        "feedback": f"Validation failed with error: {result}"
                    }
                else:
                    validation_outputs[agent_name] = result

            # ------------------------------------
            # STEP 4: Separate PASS and FAIL
            # ------------------------------------
            failed_agents = []
            for agent_name in validated_agent_names:
                validation = validation_outputs[agent_name]
                worker_output = worker_outputs[agent_name]
                current_attempt = attempts.get(agent_name, 1)

                if validation.get("valid", False):
                    completed_agents.add(agent_name)
                    # Store final validated result
                    final_results[agent_name] = {
                        "agent_name": agent_name,
                        "status": "validated",
                        "attempt": current_attempt,
                        "validation": {
                            "valid": True,
                            "score": validation.get("score", 0.0),
                            "issues": validation.get("issues", []),
                            "feedback": validation.get("feedback", "")
                        },
                        "output": {
                            "recommendation": worker_output.get("recommendation", ""),
                            "confidence": worker_output.get("confidence", 0.0),
                            "metrics": worker_output.get("metrics", {})
                        }
                    }
                    logger.info(f"{agent_name} PASSED validation (attempt {current_attempt})")
                else:
                    # Validation failed - check if we should retry
                    if current_attempt < MAX_ATTEMPTS:
                        failed_agents.append(agent_name)
                        logger.warning(
                            f"{agent_name} FAILED validation (attempt {current_attempt}/{MAX_ATTEMPTS}): "
                            f"{validation.get('issues', [])}"
                        )
                    else:
                        # Max attempts reached - mark as completed but include in results
                        completed_agents.add(agent_name)
                        final_results[agent_name] = {
                            "agent_name": agent_name,
                            "status": "validation_failed_max_attempts",
                            "attempt": current_attempt,
                            "validation": {
                                "valid": False,
                                "score": validation.get("score", 0.0),
                                "issues": validation.get("issues", []),
                                "feedback": validation.get("feedback", "")
                            },
                            "output": {
                                "recommendation": worker_output.get("recommendation", ""),
                                "confidence": worker_output.get("confidence", 0.0),
                                "metrics": worker_output.get("metrics", {})
                            }
                        }
                        logger.error(
                            f"{agent_name} FAILED validation after {MAX_ATTEMPTS} attempts"
                        )

            if not failed_agents:
                # All agents passed or hit max attempts
                break

            # ------------------------------------
            # STEP 5: Planner Creates Corrected Tasks for Failed Agents Concurrently
            # ------------------------------------
            logger.info(f"Querying Planner for corrected tasks for failed agents: {failed_agents}")
            planner_tasks = []

            for agent_name in failed_agents:
                current_attempt = attempts.get(agent_name, 1)
                attempts[agent_name] = current_attempt + 1

                # Find the original plan for this agent
                original_plan = next(
                    (ap for ap in plan_agents if ap.get("agent_name") == agent_name),
                    {}
                )

                retry_info = {
                    "agent_name": agent_name,
                    "original_task": original_plan.get("task", ""),
                    "parameters": original_plan.get("parameters", {}),
                    "previous_output": worker_outputs[agent_name],
                    "validation_result": validation_outputs[agent_name],
                    "attempt": attempts[agent_name]
                }

                planner_tasks.append(
                    self.planner.plan(
                        user_input=user_input,
                        parameters=parameters,
                        retry_info=retry_info
                    )
                )

            # Get all corrected tasks from Planner concurrently
            planner_results = await asyncio.gather(*planner_tasks, return_exceptions=True)

            for idx, agent_name in enumerate(failed_agents):
                corrected_task = planner_results[idx]

                if isinstance(corrected_task, Exception):
                    logger.error(f"Planner failed to generate corrected task for {agent_name}: {corrected_task}")
                    # If Planner failed, we preserve the previous task but update parameters for the retry
                    for i, ap in enumerate(plan_agents):
                        if ap.get("agent_name") == agent_name:
                            plan_agents[i] = {
                                "agent_name": agent_name,
                                "task": ap.get("task", ""),
                                "parameters": {
                                    **(ap.get("parameters", {})),
                                    "retry": True,
                                    "attempt": attempts[agent_name]
                                }
                            }
                            break
                else:
                    # Update the plan with corrected task
                    for i, ap in enumerate(plan_agents):
                        if ap.get("agent_name") == agent_name:
                            plan_agents[i] = {
                                "agent_name": agent_name,
                                "task": corrected_task.get("task", ""),
                                "parameters": corrected_task.get("parameters", {})
                            }
                            break

        # ------------------------------------
        # STEP 6: Return Final Aggregated JSON
        # ------------------------------------
        # Use initial plan_agents order to construct the result
        final_output = {
            "session_id": session_id,
            "status": "completed",
            "plan": {
                "agents": [
                    {
                        "agent_name": ap.get("agent_name"),
                        "task": ap.get("task"),
                        "parameters": ap.get("parameters", {})
                    }
                    for ap in plan.get("agents", [])  # Use the original agent names/order
                ]
            },
            "agent_results": [
                final_results[ap.get("agent_name")]
                for ap in plan.get("agents", [])
                if ap.get("agent_name") in final_results
            ]
        }

        logger.info(f"Orchestration completed for session: {session_id}")
        return final_output

    async def _run_worker(
        self,
        agent,
        agent_name: str,
        task: str,
        parameters: Dict[str, Any],
        attempt: int
    ) -> Dict[str, Any]:
        """Run a single worker agent with the given parameters."""
        return await run_adk_agent(
            agent=agent.agent,
            agent_name=agent_name,
            task=task,
            parameters=parameters,
            attempt=attempt
        )


orchestrator = Orchestrator()