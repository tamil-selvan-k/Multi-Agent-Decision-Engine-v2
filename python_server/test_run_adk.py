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

# Global state tracker for mocking validation attempts
finance_validation_calls = 0

async def mock_run_async_generator(self, *args, **kwargs):
    global finance_validation_calls
    agent_name = getattr(self.agent, "name", "")
    
    # 1. Planner Agent
    if agent_name == "planner_agent":
        new_message = kwargs.get("new_message")
        prompt_text = ""
        if new_message and new_message.parts:
            prompt_text = new_message.parts[0].text
            
        if "RETRY CONTEXT" in prompt_text or "corrected task" in prompt_text:
            retry_task = {
                "agent_name": "FinanceAgent",
                "task": "Re-analyze budget and Cost Estimate. Ensure cost prediction anomaly check is explicitly run.",
                "parameters": {"retry": True, "attempt": 2}
            }
            yield MockEvent(json.dumps(retry_task))
        else:
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
            
    # 2. Sales Agent
    elif agent_name == "sales_agent":
        sales_recommendation = {
            "agent_name": "SalesAgent",
            "status": "completed",
            "recommendation": "Capitalize on Q3 demand with target sales forecast of 25,000 units.",
            "confidence": 0.92,
            "metrics": {
                "sales_records": 8,
                "forecast": {"forecast": 25000, "confidence": 0.95},
                "growth": {"growth": 12.5},
                "production_recommendation": {"recommendation": "Increase production by 15%"}
            },
            "task": "Analyze sales and recommend production.",
            "attempt": 1
        }
        yield MockEvent(json.dumps(sales_recommendation))
        
    # 3. Finance Agent
    elif agent_name == "finance_agent":
        new_message = kwargs.get("new_message")
        prompt_text = ""
        if new_message and new_message.parts:
            prompt_text = new_message.parts[0].text
        
        attempt = 1
        if "RETRY ATTEMPT: 2" in prompt_text or "attempt\": 2" in prompt_text:
            attempt = 2
            
        finance_recommendation = {
            "agent_name": "FinanceAgent",
            "status": "completed",
            "recommendation": "Finance approves $50,000 promotional budget with detailed impact assessment.",
            "confidence": 0.95,
            "metrics": {
                "budget": {"department_budgets": {"sales": 500000}, "current_spending": {"sales": 450000}},
                "anomaly": {"anomaly": False, "score": 0.05},
                "cost_prediction": {"extra_cost": 120000},
                "budget_impact": {"budget_exceeded": False, "remaining_budget": 50000, "cashflow": "Positive"}
            },
            "task": "Analyze budget and cost estimates.",
            "attempt": attempt
        }
        yield MockEvent(json.dumps(finance_recommendation))
        
    # 4. Validation Agent
    elif agent_name == "validation_agent":
        new_message = kwargs.get("new_message")
        prompt_text = ""
        if new_message and new_message.parts:
            prompt_text = new_message.parts[0].text
            
        if "Agent: SalesAgent" in prompt_text or '"agent_name": "SalesAgent"' in prompt_text:
            validation_result = {
                "agent_name": "SalesAgent",
                "valid": True,
                "score": 0.95,
                "issues": [],
                "missing_requirements": [],
                "feedback": "The worker correctly analyzed sales records, growth, demand forecasting, and production recommendations."
            }
            yield MockEvent(json.dumps(validation_result))
        elif "Agent: FinanceAgent" in prompt_text or '"agent_name": "FinanceAgent"' in prompt_text:
            finance_validation_calls += 1
            if finance_validation_calls == 1:
                # Return failure on first attempt
                validation_result = {
                    "agent_name": "FinanceAgent",
                    "valid": False,
                    "score": 0.55,
                    "issues": [
                        "Budget impact check was incomplete",
                        "Risk score missing"
                    ],
                    "missing_requirements": [
                        "budget_impact",
                        "financial_risk"
                    ],
                    "feedback": "The worker did not complete budget impact and financial risk calculations."
                }
            else:
                # Return pass on second attempt
                validation_result = {
                    "agent_name": "FinanceAgent",
                    "valid": True,
                    "score": 0.91,
                    "issues": [],
                    "missing_requirements": [],
                    "feedback": "The worker corrected the issues. Cost estimate and budget impact calculations are fully verified."
                }
            yield MockEvent(json.dumps(validation_result))
        else:
            yield MockEvent('{"valid": true, "score": 1.0, "issues": [], "feedback": "Fallback valid response"}')
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
        print(json.dumps(decision, indent=2))

    except Exception as e:
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(test_main())
