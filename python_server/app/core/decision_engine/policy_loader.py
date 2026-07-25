from sqlalchemy import Column, Integer, String, engine
from sqlalchemy.orm import Session
from app.core.database import Base, SessionLocal, engine as db_engine

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(String, nullable=False)
    description = Column(String, nullable=True)

# Ensure the policies table is created in the DB
Base.metadata.create_all(bind=db_engine)

DEFAULT_POLICIES = [
    {
        "key": "safety_stock_buffer",
        "value": "500",
        "description": "Minimum inventory safety level threshold before triggering urgent reorder."
    },
    {
        "key": "max_budget_deviation",
        "value": "0.10",
        "description": "Max deviation allowed from department budget before flagging (e.g. 10%)."
    },
    {
        "key": "max_freight_cost_limit",
        "value": "5000",
        "description": "Maximum cost allowed for expedited shipment routing."
    },
    {
        "key": "min_agent_confidence",
        "value": "0.70",
        "description": "Minimum acceptable agent confidence before triggering manual review."
    },
    {
        "key": "priority_strategy",
        "value": "inventory_first",
        "description": "Configurable prioritization strategy (e.g. inventory_first, finance_first, growth_first)."
    }
]

class PolicyLoader:
    @staticmethod
    def load_policies() -> dict:
        db: Session = SessionLocal()
        try:
            # Seed default policies if the table is empty
            count = db.query(Policy).count()
            if count == 0:
                for p in DEFAULT_POLICIES:
                    db.add(Policy(key=p["key"], value=p["value"], description=p["description"]))
                db.commit()
            
            policies = db.query(Policy).all()
            return {p.key: p.value for p in policies}
        except Exception as e:
            print(f"Error loading policies: {e}")
            # Graceful fallback to default policies in dict format
            return {p["key"]: p["value"] for p in DEFAULT_POLICIES}
        finally:
            db.close()
