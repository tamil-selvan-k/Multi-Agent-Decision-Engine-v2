import json
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine as db_engine
from app.models import Embedding

DEFAULT_KNOWLEDGE_DOCS = [
    {
        "content": "Enterprise Logistics Standard: Standard delivery routes are optimized for cost, but any delay probability exceeding 35% on standard lanes should trigger automatic routing evaluation to alternative freight carrier lanes.",
        "metadata_": json.dumps({"source": "logistics_policy_v2", "category": "Logistics"}),
    },
    {
        "content": "Safety Stock Directive: To preserve operations security and prevent supply chain stockouts, the inventory reorder threshold is 500 units. Any item dipping below 500 units must be immediately replenishment-requested.",
        "metadata_": json.dumps({"source": "inventory_directive_2026", "category": "Inventory"}),
    },
    {
        "content": "Finance Cost Allocation Protocol: Budget reallocations between departments (e.g. Sales to Logistics) are permitted up to 10% of total budget deviation. Any deviation exceeding 10% must be flagged for manual review.",
        "metadata_": json.dumps({"source": "finance_sop_q3", "category": "Finance"}),
    },
    {
        "content": "Sales Demand Forecasting Standard: Q3 targets are aligned to sales projections. Standard promotions are prioritized when inventory health is above 90%, else promotions should focus on high-stock items.",
        "metadata_": json.dumps({"source": "sales_alignment_sop", "category": "Sales"}),
    }
]

class KnowledgeRetriever:
    @staticmethod
    def retrieve(query_text: str) -> list:
        db: Session = SessionLocal()
        retrieved = []
        try:
            # Seed default knowledge base entries if empty
            count = db.query(Embedding).count()
            if count == 0:
                # We seed embeddings with a dummy 1024-float vector to satisfy pgvector constraint
                dummy_vector = "[" + ",".join(["0.0"] * 1024) + "]"
                for doc in DEFAULT_KNOWLEDGE_DOCS:
                    # Execute raw SQL insert to avoid prisma/sqlalchemy pgvector wrapper parsing issues
                    insert_stmt = text(
                        "INSERT INTO embeddings (content, embedding, metadata_, created_at) "
                        "VALUES (:content, CAST(:embedding AS vector), :metadata_, :created_at)"
                    )
                    db.execute(insert_stmt, {
                        "content": doc["content"],
                        "embedding": dummy_vector,
                        "metadata_": doc["metadata_"],
                        "created_at": datetime.now()
                    })
                db.commit()

            # Retrieve records using keyword matches from database
            words = [w.lower().strip() for w in query_text.split() if len(w) > 3]
            if not words:
                words = ["enterprise"]
            
            # Retrieve all rows and match or use ILIKE queries
            clause = " OR ".join([f"content ILIKE :w_{i}" for i in range(len(words))])
            params = {f"w_{i}": f"%{w}%" for i, w in enumerate(words)}
            
            sql = text(f"SELECT content, metadata_ FROM embeddings WHERE {clause} LIMIT 4")
            result = db.execute(sql, params).fetchall()
            
            for row in result:
                retrieved.append({
                    "content": row[0],
                    "metadata": json.loads(row[1]) if isinstance(row[1], str) else row[1]
                })

            # If nothing matched, retrieve first 2 docs as general context fallback
            if not retrieved:
                fallback_result = db.execute(text("SELECT content, metadata_ FROM embeddings LIMIT 2")).fetchall()
                for row in fallback_result:
                    retrieved.append({
                        "content": row[0],
                        "metadata": json.loads(row[1]) if isinstance(row[1], str) else row[1]
                    })

        except Exception as e:
            print(f"Error retrieving knowledge base: {e}")
            # Fallback to local default docs matching
            retrieved = [
                {
                    "content": doc["content"],
                    "metadata": json.loads(doc["metadata_"])
                }
                for doc in DEFAULT_KNOWLEDGE_DOCS if any(w in doc["content"].lower() for w in query_text.lower().split())
            ]
            if not retrieved:
                retrieved = [
                    {
                        "content": doc["content"],
                        "metadata": json.loads(doc["metadata_"])
                    }
                    for doc in DEFAULT_KNOWLEDGE_DOCS[:2]
                ]
        finally:
            db.close()
        return retrieved
