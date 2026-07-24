from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class OrchestrationRequest(BaseModel):
    """Request payload for starting the agent negotiation."""
    session_id: str = Field(..., description="Unique identifier for the orchestration session.")
    trigger_event: str = Field(..., description="The main event triggering the agents.")
    department_data: dict = Field(..., description="Data required by domain agents.")

class OrchestrationResponse(BaseModel):
    status: str
    session_id: str
    message: str
