# Developer Guide: Multi-Agent Platform

Welcome to the Multi-Agent platform! This guide is intended for developers who wish to understand the architecture, contribute to the codebase, or extend the system's capabilities.

## Architecture Deep Dive

The platform employs a **Microservice Architecture** with two core components:

### 1. The Gateway (Node.js/TypeScript)
The Gateway is the primary entry point for all client applications (e.g., the Next.js frontend).
- **Location:** `/node_server`
- **Responsibilities:**
  - Request filtering and rate-limiting
  - Authentication and Authorization (RBAC)
  - WebSocket forwarding for real-time agent reasoning streams
  - Routing orchestration triggers to the Python Microservice

### 2. The Agent Engine (Python/FastAPI)
The Engine houses the actual logic for the AI domain agents.
- **Location:** `/python_server`
- **Responsibilities:**
  - Running Large Language Model (LLM) inference (e.g., via Google ADK)
  - Executing deterministic ML algorithms (e.g., Prophet, Scikit-Learn)
  - Managing agent sessions and state via Redis
  - Inter-agent negotiation and conflict resolution

## Development Workflow

### Adding a New API Route
#### Node.js
1. Create a controller in `node_server/src/controllers/`
2. Create or update a router in `node_server/src/routes/`
3. Map the router in `node_server/src/app.ts`

#### Python
1. Define the Pydantic schema for requests/responses in `python_server/app/schemas/`
2. Create the route function in `python_server/app/api/v1/routes.py`
3. If adding a new agent domain, create a new sub-module under `python_server/app/agents/` to keep logic isolated.

### Managing Asynchronous Tasks
Agent negotiation can be long-running. The Python service uses `BackgroundTasks` (FastAPI) for lightweight jobs. For heavy or distributed jobs, consider implementing Celery with a Redis broker.

## Coding Conventions
- **TypeScript:** Use strong typing. Avoid `any`. Interfaces over Types where applicable for object shaping.
- **Python:** Use Type Hints extensively (`typing` module). We use Pydantic for data validation on the boundaries.
- **Logging:** Do not use plain `console.log` or `print`.
  - Node: Use the custom `@middleware/logger` (Winston).
  - Python: Use the custom `logger` defined in `app.core.logging`.

## Testing Structure
- **Unit Tests:** Placed alongside the code or in a dedicated `/tests` directory for each microservice.
- **Integration Tests:** Emulate the HTTP boundary using tools like `supertest` for Node and `TestClient` for FastAPI.

## Adding a New Domain Agent

If you need to introduce a new department (e.g., **HR Agent**):
1. Create `hr_agent.py` in the Python server `agents` directory.
2. Define its System Prompt incorporating the specific goals (e.g., minimum hiring requirements vs. budget).
3. Update the Orchestrator loop in `routes.py` so the Orchestrator includes the HR Agent in the negotiation cycle when relevant.
4. Ensure the Node.js Gateway payload schema (`OrchestrationRequest`) is updated to accept HR department data.
