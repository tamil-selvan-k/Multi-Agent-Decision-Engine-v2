from typing import Dict, List, Any, Optional


class AgentMetadata:
    def __init__(
        self,
        name: str,
        capabilities: List[str],
        description: str,
        agent_instance: Any
    ):
        self.name = name
        self.capabilities = capabilities
        self.description = description
        self.agent_instance = agent_instance


class AgentRegistry:
    def __init__(self):
        self._agents: List[AgentMetadata] = []
        # For quick lookup: capability -> agent_instance
        self._capability_to_agent: Dict[str, Any] = {}

    def register(
        self,
        name: str,
        capabilities: List[str],
        description: str,
        agent_instance: Any
    ) -> None:
        """
        Register an agent with the registry.
        """
        metadata = AgentMetadata(
            name=name,
            capabilities=capabilities,
            description=description,
            agent_instance=agent_instance
        )
        self._agents.append(metadata)
        # Update the capability lookup map.
        # If multiple agents have the same capability, the last one wins.
        # We assume each capability is unique to one agent.
        for cap in capabilities:
            self._capability_to_agent[cap] = agent_instance

    def get_agent_for_capability(self, capability: str) -> Optional[Any]:
        """
        Return the agent instance that provides the given capability.
        Returns None if no agent is found for the capability.
        """
        return self._capability_to_agent.get(capability)

    def list_agents(self) -> List[AgentMetadata]:
        """
        Return a list of all registered agent metadata.
        """
        return self._agents.copy()