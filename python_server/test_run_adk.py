import sys
import os
import asyncio
import json
from unittest.mock import MagicMock, AsyncMock

# Add python_server and app directories to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
sys.path.insert(0, os.path.join(current_dir, "app"))

# Set database URL to in-memory SQLite
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

# Patch create_engine to ignore pool parameters for SQLite
import sqlalchemy
original_create_engine = sqlalchemy.create_engine
def patched_create_engine(*args, **kwargs):
    if args[0].startswith("sqlite:"):
        kwargs.pop("pool_size", None)
        kwargs.pop("max_overflow", None)
    return original_create_engine(*args, **kwargs)
sqlalchemy.create_engine = patched_create_engine

class MockEvent:
    def __init__(self, text):
        self.text = text
    def is_final_response(self):
        return True
    @property
    def content(self):
        class ContentWrapper:
            parts = [self]
        return ContentWrapper()

async def mock_run_async_generator(self, *args, **kwargs):
    agent_name = getattr(self.agent, "name", "")
    
    # Check if this is the Planner Agent
    if agent_name == "planner_agent":
        plan_json = {
            "agents": [
                {
                    "agent_name": "SalesAgent",
                    "task": "Analyze sales and recommend production.",
                    "parameters": {}
                },
                {
                    "agent_name": "FinanceAgent",
                    "task": "Analyze budget and cost estimates.",
                    "parameters": {}
                }
            ]
        }
        yield MockEvent(json.dumps(plan_json))
        
    # Check if this is the Sales Agent
    elif agent_name == "sales_agent":
        sales_recommendation = {
            "agent_name": "SalesAgent",
            "recommendation": "Capitalize on Q3 demand with target sales forecast of 25,000 units.",
            "confidence": 0.92,
            "metrics": {
                "sales_records": 8,
                "forecast": {"forecast": 25000, "confidence": 0.95},
                "growth": {"growth": 12.5},
                "production_recommendation": {"recommendation": "Increase production by 15%"}
            }
        }
        yield MockEvent(json.dumps(sales_recommendation))
        
    # Check if this is the Finance Agent
    elif agent_name == "finance_agent":
        finance_recommendation = {
            "agent_name": "FinanceAgent",
            "recommendation": "Finance approves $50,000 promotional budget.",
            "confidence": 0.95,
            "metrics": {
                "budget": {"department_budgets": {"sales": 500000}, "current_spending": {"sales": 450000}},
                "anomaly": {"anomaly": False, "score": 0.05},
                "cost_prediction": {"extra_cost": 120000},
                "budget_impact": {"budget_exceeded": False, "remaining_budget": 50000, "cashflow": "Positive"}
            }
        }
        yield MockEvent(json.dumps(finance_recommendation))

    # Check if this is the Synthesis Agent
    elif agent_name == "synthesis_agent":
        synthesis_recommendation = {
            "overall_situation": "Optimized budget allocation aligns with Q3 demand growth.",
            "key_findings": ["Sales forecast demands 25,000 units.", "Finance approves promotional expenditure."],
            "agent_recommendations": ["Sales: Increase production.", "Finance: Budget approved."],
            "conflicting_recommendations": [],
            "recommended_action": "Increase production by 15% and launch Q3 campaign.",
            "risks": ["Supply chain delay risks are low."],
            "overall_confidence": 0.93
        }
        yield MockEvent(json.dumps(synthesis_recommendation))
        
    # Default fallback
    else:
        yield MockEvent("{}")

async def test_main():
    try:
        from app.core.database import engine, Base
        from app.core.adk_runner import run_adk_orchestration
        
        # Initialize tables
        Base.metadata.create_all(bind=engine)
        print("Database schema successfully generated.")

        # Patch the ADK Runner run_async method to bypass Groq calls
        from google.adk.runners import Runner
        Runner.run_async = mock_run_async_generator
        print("Runner.run_async successfully patched.")

        # Execute orchestration through runner

        print("Triggering run_adk_orchestration...")
        decision = await run_adk_orchestration(
            session_id="test_session_adk_123",
            user_input="Run cross-functional Q3 plan rebalancing",
            parameters={}
        )

        print("\nOrchestration verification succeeded!")
        print(f"Session ID: {decision.session_id}")
        print(f"Status: {decision.status}")
        print(f"Final Decision: {decision.final_decision}")
        print(f"Merged At: {decision.merged_at}")
        print("Agent Results:")
        for res in decision.agent_outputs:
            print(f" - {res.agent_name}: {res.recommendation} (Conf: {res.confidence})")

    except Exception as e:
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(test_main())
