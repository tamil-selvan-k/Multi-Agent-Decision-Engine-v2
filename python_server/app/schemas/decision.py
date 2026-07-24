from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class OrchestrationRequest(BaseModel):
    session_id: str = Field(
        ...,
        description="Unique session ID"
    )

    user_input: str = Field(
        ...,
        description="Business request to analyze"
    )

    parameters: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional scenario parameters"
    )


class AgentPlanItem(BaseModel):
    agent_name: str
    task: str
    parameters: Dict[str, Any] = Field(default_factory=dict)


class ExecutionPlan(BaseModel):
    agents: List[AgentPlanItem]


class ValidationResult(BaseModel):
    valid: bool
    score: float
    issues: List[str] = Field(default_factory=list)
    feedback: str


class AgentOutputDetail(BaseModel):
    recommendation: str
    confidence: float
    metrics: Dict[str, Any] = Field(default_factory=dict)


class AgentResultItem(BaseModel):
    agent_name: str
    status: str
    attempt: int
    validation: ValidationResult
    output: AgentOutputDetail


class OrchestrationResult(BaseModel):
    session_id: str
    status: str
    plan: ExecutionPlan
    agent_results: List[AgentResultItem]
