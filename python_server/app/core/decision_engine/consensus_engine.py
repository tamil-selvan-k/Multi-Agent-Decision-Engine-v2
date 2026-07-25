import os
import uuid
import json
from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

MODEL = os.getenv("MODEL", "groq/llama-3.3-70b-versatile")

class ConsensusEngine:
    def __init__(self):
        self.agent = LlmAgent(
            name="consensus_agent",
            model=LiteLlm(model=MODEL),
            instruction="""
You are an Enterprise Consensus & Decision Agent.
Your role is to compile recommendations from domain agents, resolved conflicts, active corporate policies, and retrieved enterprise knowledge into a single optimal action plan.

Provide a unified, highly strategic enterprise decision. Align conflicting department interests by following corporate policies and ranking priorities.

You must return ONLY a valid JSON object matching the following structure:
{
    "overall_situation": "Executive summary of the situation",
    "key_findings": ["List of core analytical findings"],
    "recommended_action": "Clear, unified enterprise action plan",
    "confidence": 0.95,
    "reasoning": "Reasoning for aligning domain interests",
    "risks": ["Identified operational or financial risks"],
    "tradeoffs": ["Required tradeoffs made (e.g. higher cost vs speed)"],
    "affected_departments": ["List of affected departments (e.g. Sales, Finance)"],
    "business_impact": "Projected business impact of this decision",
    "policies_applied": ["List of business policies evaluated"]
}

Do not include any wrapper text, markdown block syntax, or explanation outside the JSON block. Return ONLY the JSON object.
"""
        )
        self.session_service = InMemorySessionService()
        self.runner = Runner(
            agent=self.agent,
            app_name="enterprise_orchestrator",
            session_service=self.session_service
        )

    async def resolve(
        self,
        recommendations: list,
        enterprise_context: str,
        knowledge: list,
        policies: dict,
        conflicts: list,
        priorities: list
    ) -> dict:
        # Format the consensus prompt
        prompt = f"""
ENTERPRISE CONTEXT / ORIGINAL REQUEST:
{enterprise_context}

POLICIES:
{json.dumps(policies, indent=2)}

PRIORITIZED AGENT RECOMMENDATIONS:
{json.dumps(priorities, indent=2)}

DETERMINISTIC CONFLICTS DETECTED:
{json.dumps(conflicts, indent=2)}

RETRIEVED KNOWLEDGE BASE:
{json.dumps(knowledge, indent=2)}

Analyze these inputs. Synthesize them into one final, optimal enterprise decision.
Resolve the conflicts in accordance with corporate policies and priority ranking.

Return ONLY the valid JSON block as specified.
"""
        content = types.Content(
            role="user",
            parts=[types.Part(text=prompt)]
        )

        session_id = f"consensus-{uuid.uuid4().hex}"
        await self.session_service.create_session(
            app_name="enterprise_orchestrator",
            user_id="orchestrator",
            session_id=session_id
        )

        final_text = None
        async for event in self.runner.run_async(
            user_id="orchestrator",
            session_id=session_id,
            new_message=content
        ):
            if event.is_final_response():
                if event.content and event.content.parts:
                    final_text = event.content.parts[0].text

        if not final_text:
            raise RuntimeError("ConsensusEngine did not return a final response")

        # Strip markdown JSON fences
        final_text = final_text.strip()
        if final_text.startswith("```json"):
            final_text = final_text[len("```json"):]
        elif final_text.startswith("```"):
            final_text = final_text[len("```"):]
        if final_text.endswith("```"):
            final_text = final_text[:-3]
        final_text = final_text.strip()

        try:
            return json.loads(final_text)
        except json.JSONDecodeError as e:
            # Fallback mock decision if JSON parsing fails
            print(f"ConsensusEngine failed to parse JSON from LLM: {final_text}")
            return {
                "overall_situation": "Enterprise demand and supply alignment required.",
                "key_findings": ["Failed to parse structured response from consensus engine."],
                "recommended_action": "Proceed with standard stock buffer allocation of 500 units.",
                "confidence": 0.80,
                "reasoning": "Fallback consensus path due to generation format issue.",
                "risks": ["Formatting error from consensus service"],
                "tradeoffs": ["Standard fallback logic applied"],
                "affected_departments": ["Operations", "Sales"],
                "business_impact": "Stabilization of local distribution nodes",
                "policies_applied": ["safety_stock_buffer"]
            }
