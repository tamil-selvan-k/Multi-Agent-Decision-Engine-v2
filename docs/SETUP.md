# Multi-Agent Platform Setup Guide

## Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js**: v24.x
- **Python**: 3.10+
- **Docker** & **Docker Compose**
- **Git**

## 1. Node.js Gateway & Frontend Server Setup

The Node.js server acts as the API Gateway and potential host for the React/Next.js frontend.

1. Navigate to the Node server directory:
   ```bash
   cd node_server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables and configure them:
   ```bash
   cp .env.example .env
   # Ensure PORT=3000 is set
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 2. Python AI Orchestration Server Setup

The Python backend runs the Agent orchestration using FastAPI.

1. Navigate to the Python server directory:
   ```bash
   cd python_server
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables (create `.env`):
   ```ini
   PORT=3001
   ENV=development
   API_VERSION=v1
   CORS_ORIGINS="*"
   ```
5. Start the FastAPI server:
   ```bash
   python -m app.main
   ```

## 3. Connecting the Two

By default:
- Node Server runs on `http://localhost:3000`
- Python Server runs on `http://localhost:3001`
- The Node.js Gateway interacts with the Python microservice over HTTP endpoints (e.g., `/api/v1/orchestrate`).

Make sure both are running simultaneously for the full platform to operate locally.
