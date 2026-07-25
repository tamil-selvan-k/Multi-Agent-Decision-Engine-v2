import json
from typing import List
from datetime import datetime

from schemas.recommendation import AgentRecommendation
from schemas.decision import EnterpriseDecision

# Import the core modular sub-components
from core.decision_engine.aggregator import Aggregator
from core.decision_engine.policy_loader import PolicyLoader
from core.decision_engine.knowledge_retriever import KnowledgeRetriever
from core.decision_engine.conflict_detector import ConflictDetector
from core.decision_engine.rule_engine import RuleEngine
from core.decision_engine.priority_engine import PriorityEngine
from core.decision_engine.consensus_engine import ConsensusEngine
from core.decision_engine.explainability import Explainability

class EnterpriseDecisionEngine:
    def __init__(self):
        self.consensus_engine = ConsensusEngine()

    async def execute(
        self,
        session_id: str,
        original_request: str,
        agent_outputs: List[AgentRecommendation]
    ) -> EnterpriseDecision:
        # 1. Aggregator: Normalize agent outputs
        normalized_recommendations = Aggregator.normalize(agent_outputs)

        # 2. Policy Loader: Load policies from PostgreSQL
        policies = PolicyLoader.load_policies()

        # 3. Knowledge Retriever: Retrieve relevant knowledge from pgvector / DB
        knowledge = KnowledgeRetriever.retrieve(original_request)

        # 4. Conflict Detector: Detect conflicting recommendations
        conflicts = ConflictDetector.detect(normalized_recommendations, policies)

        # 5. Rule Engine: Apply deterministic rules
        ruled_recommendations = RuleEngine.apply_rules(normalized_recommendations, policies)

        # Gather any rules applied for explainability reference
        all_rules_applied = []
        for rec in ruled_recommendations:
            all_rules_applied.extend(rec.get("rules_applied", []))

        # 6. Priority Engine: Rank recommendations
        ranked_recommendations = PriorityEngine.rank(ruled_recommendations, policies)

        # 7. Consensus Engine: Call LLM to merge inputs into consensus
        consensus_data = await self.consensus_engine.resolve(
            recommendations=normalized_recommendations,
            enterprise_context=original_request,
            knowledge=knowledge,
            policies=policies,
            conflicts=conflicts,
            priorities=ranked_recommendations
        )

        # 8. Explainability: Formulate executive report
        explainability_report = Explainability.generate_report(consensus_data, all_rules_applied)

        # We serialise the full explainability report as JSON string inside `final_decision` 
        # so that the frontend can parse it and render the detailed dashboard.
        final_decision_str = json.dumps(explainability_report)

        return EnterpriseDecision(
            session_id=session_id,
            status="COMPLETED",
            final_decision=final_decision_str,
            agent_outputs=agent_outputs,
            merged_at=datetime.utcnow().isoformat()
        )

# Instantiate engine
decision_engine_instance = EnterpriseDecisionEngine()

async def generate_decision(
    session_id: str,
    agent_outputs: List[AgentRecommendation],
    original_request: str = "Align enterprise supply chain and demand levels."
) -> EnterpriseDecision:
    """Orchestrator endpoint to execute the modular Decision Engine workflow."""
    return await decision_engine_instance.execute(
        session_id=session_id,
        original_request=original_request,
        agent_outputs=agent_outputs
    )
