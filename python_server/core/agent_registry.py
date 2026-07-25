"""
Dynamic Agent Registry for managing agent metadata and resolution.
"""

from typing import List, Dict, Any, Set


class AgentRegistry:
    """
    Registry for agents with metadata including name, capabilities, description, and instance.
    """

    def __init__(self):
        """Initialize an empty registry."""
        self._agents: List[Dict[str, Any]] = []

    def register(
        self,
        name: str,
        capabilities: List[str],
        description: str,
        instance: Any
    ) -> None:
        """
        Register an agent with its metadata.

        Args:
            name: The name of the agent.
            capabilities: List of capability strings the agent can handle.
            description: Human-readable description of the agent's purpose.
            instance: The agent instance that will be invoked to handle tasks.
        """
        self._agents.append({
            "name": name,
            "capabilities": capabilities,
            "description": description,
            "instance": instance
        })

    def get_agent_for_capability(self, capability: str) -> Any:
        """
        Get the agent instance that handles the given capability.
        Assumes exactly one agent per capability. Returns the first match.

        Args:
            capability: The capability string to look up.

        Returns:
            The agent instance that handles the capability, or None if not found.
        """
        for agent in self._agents:
            if capability in agent["capabilities"]:
                return agent["instance"]
        return None

    def resolve(self, capabilities: List[str]) -> List[Any]:
        """
        Resolve a list of capabilities to a list of unique agent instances.

        Args:
            capabilities: List of capability strings.

        Returns:
            List of unique agent instances that handle at least one of the capabilities.
        """
        agents: Set[Any] = set()
        for capability in capabilities:
            agent = self.get_agent_for_capability(capability)
            if agent is not None:
                agents.add(agent)
        return list(agents)

    def list_agents(self) -> List[Dict[str, Any]]:
        """
        List all registered agents with their metadata.

        Returns:
            List of dictionaries containing agent metadata.
        """
        return self._agents.copy()